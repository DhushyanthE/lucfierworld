"""
SQLite-backed BBB8 research ledger.

The database is local, single-host storage. SQLite serializes each writer with
BEGIN IMMEDIATE. Signing keys remain on this host; this is intentionally
reported as a research limitation rather than described as distributed trust.
"""
from __future__ import annotations

import base64
import binascii
import json
import os
import sqlite3
import stat
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from bbb8_consensus import (
    NETWORK_ID,
    POLICY_VERSION,
    QUORUM,
    Cell,
    block_hash,
    make_certificate,
    make_registry,
    verify_block,
)
from bbb8_crypto import (
    DOMAINS,
    SigningIdentity,
    canonical,
    crypto_mode,
    digest,
    sign,
    transport_roundtrip,
)
from bbb8_decision import analyze
from bbb8_keyvault import KeyVault, KeyVaultError
from bbb8_models import RunRequest, RunResponse, StageReport, StatusResponse
from bbb8_quantum import simulate_channel

DB_PATH = os.environ.get("BBB8_DB_PATH", ".bbb8/ledger.sqlite3")


class RequestConflictError(RuntimeError):
    pass


class ConcurrentHeadError(RuntimeError):
    pass


class IntegrityError(RuntimeError):
    pass


def _env_truthy(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _resolve_keyvault_master(explicit: bytes | str | None) -> bytes:
    if explicit is not None:
        value = explicit.encode("utf-8") if isinstance(explicit, str) else bytes(explicit)
    else:
        encoded = os.environ.get("BBB8_KEYVAULT_MASTER_B64", "").strip()
        raw = os.environ.get("BBB8_KEYVAULT_MASTER", "")
        if encoded:
            try:
                value = base64.b64decode(encoded, validate=True)
            except (binascii.Error, ValueError) as exc:
                raise IntegrityError("BBB8_KEYVAULT_MASTER_B64 is not valid base64") from exc
        elif raw:
            value = raw.encode("utf-8")
        else:
            raise IntegrityError(
                "BBB8 signer KeyVault master secret is required; set "
                "BBB8_KEYVAULT_MASTER_B64 (preferred) or BBB8_KEYVAULT_MASTER"
            )
    if len(value) < 32:
        raise IntegrityError("BBB8 KeyVault master secret must contain at least 32 bytes")
    return value


class FabricService:
    def __init__(
        self,
        db_path: str = DB_PATH,
        *,
        allow_classical_fallback: bool | None = None,
        keyvault_master: bytes | str | None = None,
    ):
        self.db_path = str(db_path)
        self.allow_classical_fallback = (
            _env_truthy("BBB8_ALLOW_CLASSICAL_FALLBACK")
            if allow_classical_fallback is None
            else bool(allow_classical_fallback)
        )
        self.keyvault = KeyVault(self.db_path, _resolve_keyvault_master(keyvault_master))
        parent = Path(self.db_path).parent
        parent.mkdir(parents=True, exist_ok=True)
        if os.name == "posix":
            try:
                parent.chmod(0o700)
            except OSError:
                pass

        self._lock = threading.RLock()
        self.registry: list[Cell] = []
        self._init_db()

    @contextmanager
    def _conn(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(
            self.db_path,
            isolation_level=None,
            timeout=15.0,
        )
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys=ON")
        conn.execute("PRAGMA journal_mode=WAL")
        try:
            yield conn
        finally:
            conn.close()

    @contextmanager
    def _write_tx(self) -> Iterator[sqlite3.Connection]:
        with self._conn() as conn:
            conn.execute("BEGIN IMMEDIATE")
            try:
                yield conn
            except Exception:
                conn.execute("ROLLBACK")
                raise
            else:
                conn.execute("COMMIT")

    @staticmethod
    def _columns(conn: sqlite3.Connection, table: str) -> set[str]:
        return {str(row["name"]) for row in conn.execute(f"PRAGMA table_info({table})")}

    def _ensure_schema(self, conn: sqlite3.Connection) -> None:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cells(
                idx INTEGER PRIMARY KEY,
                public_key BLOB NOT NULL,
                algorithm TEXT NOT NULL
            )
            """
        )
        cell_columns = self._columns(conn, "cells")
        if "secret_key" in cell_columns:
            raise IntegrityError(
                "legacy plaintext signer-key schema detected. Preserve that database "
                "for evidence and start a fresh BBB8_DB_PATH with KeyVault enabled; "
                "SQLite page reuse cannot guarantee secure erasure of the old keys."
            )
        required_cell_columns = {"idx", "public_key", "algorithm"}
        if not required_cell_columns.issubset(cell_columns):
            raise IntegrityError("unsupported cells schema")
        self.keyvault.ensure_schema(conn)

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS chain(
                height INTEGER PRIMARY KEY,
                prev_hash TEXT NOT NULL,
                block_json TEXT NOT NULL,
                head_hash TEXT NOT NULL UNIQUE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS outcomes(
                request_id TEXT PRIMARY KEY,
                request_digest TEXT NOT NULL,
                outcome TEXT NOT NULL,
                response_json TEXT NOT NULL,
                outcome_digest TEXT NOT NULL,
                outcome_signature TEXT NOT NULL,
                signer_cell_id TEXT NOT NULL,
                signer_algorithm TEXT NOT NULL
            )
            """
        )

        outcome_columns = self._columns(conn, "outcomes")
        additions = {
            "request_digest": "TEXT",
            "outcome_digest": "TEXT",
            "outcome_signature": "TEXT",
            "signer_cell_id": "TEXT",
            "signer_algorithm": "TEXT",
        }
        for name, kind in additions.items():
            if name not in outcome_columns:
                conn.execute(f"ALTER TABLE outcomes ADD COLUMN {name} {kind}")

    def _init_db(self) -> None:
        with self._write_tx() as conn:
            self._ensure_schema(conn)

            rows = conn.execute(
                "SELECT idx, public_key, algorithm FROM cells ORDER BY idx"
            ).fetchall()
            if not rows:
                fresh = make_registry()
                for cell in fresh:
                    conn.execute(
                        "INSERT INTO cells(idx,public_key,algorithm) VALUES(?,?,?)",
                        (
                            cell.index,
                            cell.identity.public_key,
                            cell.identity.algorithm,
                        ),
                    )
                    self.keyvault.store_private_key(
                        cell.cell_id,
                        cell.identity.secret_key,
                        conn=conn,
                    )
                self.registry = fresh
            else:
                registry: list[Cell] = []
                for row in rows:
                    idx = int(row["idx"])
                    cell_id = f"cell-{idx:02d}"
                    try:
                        secret_key = self.keyvault.load_private_key(cell_id, conn=conn)
                    except KeyVaultError as exc:
                        raise IntegrityError(
                            f"encrypted signer key missing or invalid for {cell_id}"
                        ) from exc
                    algorithm = str(row["algorithm"])
                    registry.append(
                        Cell(
                            idx,
                            SigningIdentity(
                                bytes(row["public_key"]),
                                secret_key,
                                algorithm,
                                algorithm != "ML-DSA-87",
                            ),
                        )
                    )
                self.registry = registry

            if len(self.registry) != 9:
                raise IntegrityError("cell registry must contain exactly nine identities")

            if conn.execute("SELECT 1 FROM chain WHERE height=0").fetchone() is None:
                genesis = {
                    "height": 0,
                    "prev_hash": "0" * 128,
                    "network": NETWORK_ID,
                    "policy_version": POLICY_VERSION,
                    "kind": "genesis",
                }
                head_hash = block_hash(genesis)
                conn.execute(
                    "INSERT INTO chain(height,prev_hash,block_json,head_hash) "
                    "VALUES(?,?,?,?)",
                    (0, genesis["prev_hash"], json.dumps(genesis), head_hash),
                )

        if os.name == "posix":
            os.chmod(self.db_path, stat.S_IRUSR | stat.S_IWUSR)

    def head(self) -> tuple[int, str]:
        with self._conn() as conn:
            row = conn.execute(
                "SELECT height, head_hash FROM chain ORDER BY height DESC LIMIT 1"
            ).fetchone()
        if row is None:
            raise IntegrityError("ledger has no genesis row")
        return int(row["height"]), str(row["head_hash"])

    @staticmethod
    def _request_payload(req: RunRequest) -> dict:
        return req.model_dump(mode="json")

    def _request_digest(self, req: RunRequest) -> str:
        return digest(DOMAINS["request"], self._request_payload(req)).hex()

    def _cached_response(
        self,
        request_id: str,
        request_digest: str,
    ) -> RunResponse | None:
        with self._conn() as conn:
            row = conn.execute(
                "SELECT request_digest,response_json FROM outcomes "
                "WHERE request_id=?",
                (request_id,),
            ).fetchone()
        if row is None:
            return None

        stored_digest = row["request_digest"]
        if not stored_digest or str(stored_digest) != request_digest:
            raise RequestConflictError(
                "request_id already exists with different input"
            )
        body = json.loads(str(row["response_json"]))
        body["cached"] = True
        return RunResponse(**body)

    def _crypto_allowed(self, protection: dict) -> bool:
        if not protection.get("verified"):
            return False
        return bool(protection.get("pqc")) or self.allow_classical_fallback

    def run(self, req: RunRequest) -> RunResponse:
        request_digest = self._request_digest(req)

        with self._lock:
            cached = self._cached_response(req.request_id, request_digest)
            if cached is not None:
                return cached

            qkd = simulate_channel(
                req.quantum.pairs,
                req.quantum.seed,
                req.quantum.sample_fraction,
                req.quantum.intercept_resend,
            )
            decision = analyze(
                req.observation.telemetry,
                req.observation.declared_risk,
                req.observation.image_grid,
            )
            height, prev_hash = self.head()

            stages: list[StageReport] = [
                StageReport(
                    name="bell_and_channel",
                    passed=qkd.passed,
                    detail=qkd.to_dict(),
                ),
                StageReport(
                    name="local_ai",
                    passed=True,
                    detail={
                        "outcome": decision.outcome,
                        "score": decision.score,
                        "model_accuracy": decision.model_accuracy,
                        "features": decision.features,
                    },
                ),
            ]

            proposal = {
                "network": NETWORK_ID,
                "height": height + 1,
                "prev_hash": prev_hash,
                "request_id": req.request_id,
                "request_digest": request_digest,
                "decision": {
                    "outcome": decision.outcome,
                    "score": decision.score,
                },
                "qkd_summary": {
                    "qber": round(qkd.qber, 8),
                    "qber_upper": round(qkd.qber_upper, 8),
                    "passed": qkd.passed,
                    "reason": qkd.reason,
                },
                "cell_transition": {
                    "from_height": height,
                    "to_height": height + 1,
                },
                "policy_version": POLICY_VERSION,
            }
            proposer = self.registry[0]
            proposal_digest, proposal_signature = sign(
                proposer.identity,
                "proposal",
                proposal,
            )
            stages.append(
                StageReport(
                    name="sha3_and_proposal",
                    passed=True,
                    detail={
                        "digest": proposal_digest.hex(),
                        "algorithm": proposer.identity.algorithm,
                        "signature_len": len(proposal_signature),
                    },
                )
            )

            protection = transport_roundtrip(canonical(proposal))
            crypto_allowed = self._crypto_allowed(protection)
            protection_detail = dict(protection)
            protection_detail["accepted_by_policy"] = crypto_allowed
            protection_detail["classical_fallback_allowed"] = (
                self.allow_classical_fallback
            )
            stages.append(
                StageReport(
                    name="lattice_protection",
                    passed=crypto_allowed,
                    detail=protection_detail,
                )
            )

            policy_approve = (
                qkd.passed
                and decision.outcome == "approve"
                and crypto_allowed
            )
            certificate = make_certificate(
                self.registry,
                height + 1,
                prev_hash,
                proposal_digest,
                policy_approve,
                req.offline_cells,
            )
            votes = len(certificate["votes"])
            stages.append(
                StageReport(
                    name="cell_consensus",
                    passed=policy_approve and votes >= QUORUM,
                    detail={
                        "votes": votes,
                        "quorum_required": QUORUM,
                        "online": 9 - len(req.offline_cells),
                        "approve": policy_approve,
                    },
                )
            )

            block = {
                "height": height + 1,
                "prev_hash": prev_hash,
                "proposal": proposal,
                "proposal_digest": proposal_digest.hex(),
                "proposer_cell_id": proposer.cell_id,
                "proposer_algorithm": proposer.identity.algorithm,
                "proposal_signature_digest": proposal_digest.hex(),
                "proposal_signature": proposal_signature.hex(),
                "certificate": certificate,
            }

            if not qkd.passed:
                outcome = "reject"
            elif decision.outcome != "approve":
                outcome = decision.outcome
            elif not crypto_allowed:
                outcome = "reject"
            elif votes < QUORUM:
                outcome = "no_quorum"
            else:
                outcome = "approve"

            committed = False
            commit_reason = outcome
            if outcome == "approve":
                valid, reason = verify_block(block, self.registry)
                if valid:
                    committed = True
                    commit_reason = "ok"
                else:
                    outcome = "reject"
                    commit_reason = f"certificate_invalid:{reason}"

            stages.append(
                StageReport(
                    name="ledger_commit",
                    passed=committed,
                    detail={"reason": commit_reason},
                )
            )

            candidate_head_hash = block_hash(block) if committed else prev_hash
            outcome_payload = {
                "request_id": req.request_id,
                "request_digest": request_digest,
                "outcome": outcome,
                "committed": committed,
                "ledger_height": height + 1 if committed else height,
                "head_hash": candidate_head_hash,
            }
            outcome_digest, outcome_signature = sign(
                proposer.identity,
                "outcome",
                outcome_payload,
            )
            outcome_proof = {
                "payload": outcome_payload,
                "digest": outcome_digest.hex(),
                "signature": outcome_signature.hex(),
                "signer_cell_id": proposer.cell_id,
                "algorithm": proposer.identity.algorithm,
            }

            response = RunResponse(
                request_id=req.request_id,
                request_digest=request_digest,
                outcome=outcome,
                stages=stages,
                qkd=qkd.to_dict(),
                decision={
                    "outcome": decision.outcome,
                    "score": decision.score,
                    "model_accuracy": decision.model_accuracy,
                    "features": decision.features,
                },
                protection=protection_detail,
                votes=votes,
                block=block if committed else None,
                outcome_proof=outcome_proof,
                cached=False,
            )

            with self._write_tx() as conn:
                existing = conn.execute(
                    "SELECT request_digest,response_json FROM outcomes "
                    "WHERE request_id=?",
                    (req.request_id,),
                ).fetchone()
                if existing is not None:
                    if str(existing["request_digest"]) != request_digest:
                        raise RequestConflictError(
                            "request_id already exists with different input"
                        )
                    cached_body = json.loads(str(existing["response_json"]))
                    cached_body["cached"] = True
                    return RunResponse(**cached_body)

                current = conn.execute(
                    "SELECT height,head_hash FROM chain "
                    "ORDER BY height DESC LIMIT 1"
                ).fetchone()
                if current is None:
                    raise IntegrityError("ledger head disappeared")
                current_height = int(current["height"])
                current_hash = str(current["head_hash"])
                if current_height != height or current_hash != prev_hash:
                    raise ConcurrentHeadError(
                        "ledger head advanced before commit; retry request"
                    )

                if committed:
                    conn.execute(
                        "INSERT INTO chain(height,prev_hash,block_json,head_hash) "
                        "VALUES(?,?,?,?)",
                        (
                            block["height"],
                            prev_hash,
                            json.dumps(block, sort_keys=True),
                            candidate_head_hash,
                        ),
                    )

                conn.execute(
                    "INSERT INTO outcomes("
                    "request_id,request_digest,outcome,response_json,"
                    "outcome_digest,outcome_signature,signer_cell_id,"
                    "signer_algorithm"
                    ") VALUES(?,?,?,?,?,?,?,?)",
                    (
                        req.request_id,
                        request_digest,
                        outcome,
                        json.dumps(response.model_dump(mode="json"), sort_keys=True),
                        outcome_digest.hex(),
                        outcome_signature.hex(),
                        proposer.cell_id,
                        proposer.identity.algorithm,
                    ),
                )

            return response

    def _chain_rows(self) -> list[sqlite3.Row]:
        with self._conn() as conn:
            return conn.execute(
                "SELECT height,prev_hash,block_json,head_hash "
                "FROM chain ORDER BY height"
            ).fetchall()

    def _verify_chain(self, rows: list[sqlite3.Row]) -> bool:
        if not rows:
            return False

        previous_head: str | None = None
        expected_height = 0

        for row in rows:
            height = int(row["height"])
            if height != expected_height:
                return False
            block = json.loads(str(row["block_json"]))
            if int(block.get("height", -1)) != height:
                return False

            stored_head = str(row["head_hash"])
            recomputed_head = block_hash(block)
            if stored_head != recomputed_head:
                return False

            if height == 0:
                if block.get("kind") != "genesis":
                    return False
                if block.get("prev_hash") != "0" * 128:
                    return False
            else:
                if previous_head is None or block.get("prev_hash") != previous_head:
                    return False
                valid, _ = verify_block(block, self.registry)
                if not valid:
                    return False

            previous_head = stored_head
            expected_height += 1

        return True

    def status(self) -> StatusResponse:
        rows = self._chain_rows()
        integrity = self._verify_chain(rows)
        if not rows:
            raise IntegrityError("ledger is empty")
        last = rows[-1]
        cells = [
            {
                "index": cell.index,
                "cell_id": cell.cell_id,
                "algorithm": cell.identity.algorithm,
            }
            for cell in self.registry
        ]
        return StatusResponse(
            network_id=NETWORK_ID,
            height=int(last["height"]),
            head_hash=str(last["head_hash"]),
            integrity=integrity,
            cells=cells,
            crypto_mode=crypto_mode(),
        )

    def ledger(self, after_height: int = -1, limit: int = 20) -> dict:
        if after_height < -1:
            raise ValueError("after_height must be >= -1")
        if not 1 <= limit <= 100:
            raise ValueError("limit must be 1..100")

        with self._conn() as conn:
            rows = conn.execute(
                "SELECT height,block_json FROM chain "
                "WHERE height > ? ORDER BY height LIMIT ?",
                (after_height, limit),
            ).fetchall()
            if rows:
                last_height = int(rows[-1]["height"])
                more = conn.execute(
                    "SELECT 1 FROM chain WHERE height > ? LIMIT 1",
                    (last_height,),
                ).fetchone()
                next_cursor = last_height if more else None
            else:
                next_cursor = None

        return {
            "blocks": [json.loads(str(row["block_json"])) for row in rows],
            "next_cursor": next_cursor,
        }

    def external_checkpoint(self) -> dict:
        height, head_hash = self.head()
        return {
            "network": NETWORK_ID,
            "height": height,
            "head_hash": head_hash,
        }

    def verify_external_checkpoint(self, checkpoint: dict) -> bool:
        """Compare a trusted out-of-band checkpoint with local ledger history.

        This function does not authenticate the checkpoint source. The caller
        must obtain the checkpoint from an independently trusted channel.
        """
        if not isinstance(checkpoint, dict):
            return False
        if checkpoint.get("network") != NETWORK_ID:
            return False
        height = checkpoint.get("height")
        head_hash = checkpoint.get("head_hash")
        if not isinstance(height, int) or height < 0:
            return False
        if (
            not isinstance(head_hash, str)
            or len(head_hash) != 128
            or any(ch not in "0123456789abcdef" for ch in head_hash)
        ):
            return False

        local_height, _ = self.head()
        if local_height < height:
            return False

        with self._conn() as conn:
            row = conn.execute(
                "SELECT head_hash FROM chain WHERE height=?",
                (height,),
            ).fetchone()
        return row is not None and str(row["head_hash"]) == head_hash

    def verify(self, block: dict) -> dict:
        valid, reason = verify_block(block, self.registry)
        included = False

        if isinstance(block, dict) and isinstance(block.get("height"), int):
            with self._conn() as conn:
                row = conn.execute(
                    "SELECT head_hash FROM chain WHERE height=?",
                    (block["height"],),
                ).fetchone()
            if row is not None:
                try:
                    included = str(row["head_hash"]) == block_hash(block)
                except Exception:
                    included = False

        return {
            "certificate_valid": valid,
            "reason": reason,
            "included_in_local_ledger": included,
        }
