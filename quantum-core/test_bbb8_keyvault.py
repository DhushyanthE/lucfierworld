from __future__ import annotations

import os
import sqlite3

import pytest

from bbb8_keyvault import KeyVault, KeyVaultError
from bbb8_service import FabricService, IntegrityError

MASTER_A = b"bbb8-keyvault-test-master-secret-aaaaaaaa"
MASTER_B = b"bbb8-keyvault-test-master-secret-bbbbbbbb"


def test_keyvault_roundtrip(tmp_path):
    path = str(tmp_path / "vault.sqlite3")
    vault = KeyVault(path, MASTER_A)
    with sqlite3.connect(path) as conn:
        vault.ensure_schema(conn)
    secret = os.urandom(4096)
    vault.store_private_key("cell-00", secret)
    assert vault.load_private_key("cell-00") == secret


def test_ciphertext_does_not_contain_plaintext(tmp_path):
    path = str(tmp_path / "vault.sqlite3")
    vault = KeyVault(path, MASTER_A)
    with sqlite3.connect(path) as conn:
        vault.ensure_schema(conn)
    secret = b"S" * 4096
    vault.store_private_key("cell-00", secret)

    with sqlite3.connect(path) as conn:
        nonce, ciphertext = conn.execute(
            "SELECT nonce,ciphertext FROM bbb8_key_vault WHERE cell_id=?",
            ("cell-00",),
        ).fetchone()
    assert len(nonce) == 12
    assert bytes(ciphertext) != secret
    assert secret not in bytes(ciphertext)


def test_aad_binding_rejects_row_rename(tmp_path):
    path = str(tmp_path / "vault.sqlite3")
    vault = KeyVault(path, MASTER_A)
    with sqlite3.connect(path) as conn:
        vault.ensure_schema(conn)
    vault.store_private_key("cell-00", os.urandom(128))
    vault.store_private_key("cell-01", os.urandom(128))

    with sqlite3.connect(path) as conn:
        nonce, ciphertext = conn.execute(
            "SELECT nonce,ciphertext FROM bbb8_key_vault WHERE cell_id='cell-00'"
        ).fetchone()
        conn.execute(
            "UPDATE bbb8_key_vault SET nonce=?, ciphertext=? WHERE cell_id='cell-01'",
            (nonce, ciphertext),
        )
        conn.commit()

    with pytest.raises(KeyVaultError):
        vault.load_private_key("cell-01")


def test_wrong_master_fails_authentication(tmp_path):
    path = str(tmp_path / "vault.sqlite3")
    first = KeyVault(path, MASTER_A)
    with sqlite3.connect(path) as conn:
        first.ensure_schema(conn)
    first.store_private_key("cell-00", os.urandom(128))

    wrong = KeyVault(path, MASTER_B)
    with pytest.raises(KeyVaultError):
        wrong.load_private_key("cell-00")


def test_rejects_short_master_secret(tmp_path):
    with pytest.raises(ValueError):
        KeyVault(str(tmp_path / "vault.sqlite3"), b"too-short")


def test_service_restart_with_same_master_succeeds(tmp_path):
    path = str(tmp_path / "ledger.sqlite3")
    first = FabricService(
        path,
        allow_classical_fallback=True,
        keyvault_master=MASTER_A,
    )
    first_keys = [cell.identity.public_key for cell in first.registry]

    second = FabricService(
        path,
        allow_classical_fallback=True,
        keyvault_master=MASTER_A,
    )
    assert [cell.identity.public_key for cell in second.registry] == first_keys


def test_service_restart_with_wrong_master_fails_closed(tmp_path):
    path = str(tmp_path / "ledger.sqlite3")
    FabricService(
        path,
        allow_classical_fallback=True,
        keyvault_master=MASTER_A,
    )
    with pytest.raises(IntegrityError):
        FabricService(
            path,
            allow_classical_fallback=True,
            keyvault_master=MASTER_B,
        )


def test_service_refuses_legacy_plaintext_secret_column(tmp_path):
    path = str(tmp_path / "legacy.sqlite3")
    with sqlite3.connect(path) as conn:
        conn.execute(
            """
            CREATE TABLE cells(
                idx INTEGER PRIMARY KEY,
                public_key BLOB NOT NULL,
                secret_key BLOB NOT NULL,
                algorithm TEXT NOT NULL
            )
            """
        )
        conn.commit()

    with pytest.raises(IntegrityError, match="legacy plaintext signer-key schema"):
        FabricService(
            path,
            allow_classical_fallback=True,
            keyvault_master=MASTER_A,
        )
