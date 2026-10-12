"""Encrypted-at-rest signer key storage for BBB8.

The vault protects each signer secret with AES-256-GCM. A per-cell data key is
derived from a high-entropy master secret using HKDF-SHA256, and the cell ID is
bound as associated data so moving ciphertext to a different identity fails
authentication.

The master secret is intentionally not stored in SQLite. In production it must
come from a secrets manager, OS keyring, HSM/TPM-backed secret, or equivalent.
"""
from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from typing import Iterator

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

VAULT_TABLE = "bbb8_key_vault"
_VAULT_SALT = b"QSF/BBB8/v21/keyvault"
_AAD_PREFIX = b"QSF/BBB8/v21/cell:"


class KeyVaultError(RuntimeError):
    pass


class KeyVault:
    def __init__(self, db_path: str, master_secret: bytes):
        if not isinstance(master_secret, (bytes, bytearray)):
            raise TypeError("master_secret must be bytes")
        master_secret = bytes(master_secret)
        if len(master_secret) < 32:
            raise ValueError("master_secret must contain at least 32 bytes of high-entropy input")
        self.db_path = str(db_path)
        self._master = master_secret

    @contextmanager
    def _conn(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path, isolation_level=None, timeout=15.0)
        try:
            yield conn
        finally:
            conn.close()

    def ensure_schema(self, conn: sqlite3.Connection | None = None) -> None:
        sql = f"""
        CREATE TABLE IF NOT EXISTS {VAULT_TABLE}(
            cell_id TEXT PRIMARY KEY,
            nonce BLOB NOT NULL CHECK(length(nonce) = 12),
            ciphertext BLOB NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (unixepoch()),
            updated_at INTEGER NOT NULL DEFAULT (unixepoch())
        )
        """
        if conn is not None:
            conn.execute(sql)
            return
        with self._conn() as owned:
            owned.execute(sql)

    def _data_key(self, cell_id: str) -> bytes:
        if not cell_id or len(cell_id) > 128:
            raise ValueError("invalid cell_id")
        return HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=_VAULT_SALT,
            info=_AAD_PREFIX + cell_id.encode("utf-8"),
        ).derive(self._master)

    @staticmethod
    def _aad(cell_id: str) -> bytes:
        return _AAD_PREFIX + cell_id.encode("utf-8")

    def store_private_key(
        self,
        cell_id: str,
        private_key: bytes,
        conn: sqlite3.Connection | None = None,
    ) -> None:
        if not isinstance(private_key, (bytes, bytearray)) or not private_key:
            raise ValueError("private_key must be non-empty bytes")
        nonce = os.urandom(12)
        ciphertext = AESGCM(self._data_key(cell_id)).encrypt(
            nonce,
            bytes(private_key),
            self._aad(cell_id),
        )
        sql = f"""
        INSERT INTO {VAULT_TABLE}(cell_id,nonce,ciphertext,created_at,updated_at)
        VALUES(?,?,?,unixepoch(),unixepoch())
        ON CONFLICT(cell_id) DO UPDATE SET
          nonce=excluded.nonce,
          ciphertext=excluded.ciphertext,
          updated_at=unixepoch()
        """
        args = (cell_id, nonce, ciphertext)
        if conn is not None:
            conn.execute(sql, args)
            return
        with self._conn() as owned:
            owned.execute("BEGIN IMMEDIATE")
            try:
                owned.execute(sql, args)
            except Exception:
                owned.execute("ROLLBACK")
                raise
            else:
                owned.execute("COMMIT")

    def load_private_key(
        self,
        cell_id: str,
        conn: sqlite3.Connection | None = None,
    ) -> bytes:
        sql = f"SELECT nonce,ciphertext FROM {VAULT_TABLE} WHERE cell_id=?"
        if conn is not None:
            row = conn.execute(sql, (cell_id,)).fetchone()
        else:
            with self._conn() as owned:
                row = owned.execute(sql, (cell_id,)).fetchone()
        if row is None:
            raise KeyVaultError(f"no private key stored for {cell_id}")
        nonce = bytes(row[0])
        ciphertext = bytes(row[1])
        try:
            return AESGCM(self._data_key(cell_id)).decrypt(
                nonce,
                ciphertext,
                self._aad(cell_id),
            )
        except Exception as exc:
            raise KeyVaultError(f"key authentication failed for {cell_id}") from exc

    def rotate_master(
        self,
        new_master_secret: bytes,
        cell_ids: list[str],
    ) -> None:
        if len(new_master_secret) < 32:
            raise ValueError("new master secret must contain at least 32 bytes")
        plaintext = {cell_id: self.load_private_key(cell_id) for cell_id in cell_ids}
        old_master = self._master
        self._master = bytes(new_master_secret)
        try:
            with self._conn() as conn:
                conn.execute("BEGIN IMMEDIATE")
                try:
                    for cell_id, key in plaintext.items():
                        self.store_private_key(cell_id, key, conn=conn)
                except Exception:
                    conn.execute("ROLLBACK")
                    raise
                else:
                    conn.execute("COMMIT")
        except Exception:
            self._master = old_master
            raise
