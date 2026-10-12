"""
Cryptographic helpers for the BBB8 research pipeline.

Primary path (when pqcrypto is installed):
  * SHA3-512 (FIPS 202) for versioned digests
  * ML-DSA-87 (FIPS 204) signatures
  * ML-KEM-1024 (FIPS 203) encapsulation
  * HKDF-SHA256 + AES-256-GCM for a local confidentiality round-trip

Offline test fallback:
  * Ed25519 signatures
  * X25519 key agreement
  * HKDF-SHA256 + AES-256-GCM

The fallback is real classical cryptography, but it is NOT post-quantum.
"""
from __future__ import annotations

import hashlib
import json
import os
from dataclasses import dataclass
from typing import Any

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

try:
    import pqcrypto.sign.ml_dsa_87 as _mldsa  # type: ignore
    import pqcrypto.kem.ml_kem_1024 as _mlkem  # type: ignore
except Exception:
    _mldsa = None
    _mlkem = None

PQC_OK = _mldsa is not None and _mlkem is not None

DOMAINS = {
    "request": b"QSF/BBB8/v1/request",
    "proposal": b"QSF/BBB8/v1/proposal",
    "vote": b"QSF/BBB8/v1/vote",
    "outcome": b"QSF/BBB8/v1/outcome",
    "block": b"QSF/BBB8/v1/block",
}


def canonical(obj: Any) -> bytes:
    return json.dumps(
        obj,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")


def digest(domain: bytes, payload: Any) -> bytes:
    return hashlib.sha3_512(domain + canonical(payload)).digest()


@dataclass(frozen=True)
class SigningIdentity:
    public_key: bytes
    secret_key: bytes
    algorithm: str
    simulated: bool = False


def _as_bytes(value: Any) -> bytes:
    if isinstance(value, bytes):
        return value
    if isinstance(value, bytearray):
        return bytes(value)
    return bytes(value)


def _construct_key(module: Any, class_name: str, raw: bytes) -> Any:
    cls = getattr(module, class_name, None)
    if cls is None:
        return raw
    try:
        return cls(raw)
    except Exception:
        return raw


def _pqc_dsa_keygen() -> tuple[bytes, bytes]:
    if _mldsa is None:
        raise RuntimeError("pqcrypto ML-DSA unavailable")
    fn = getattr(_mldsa, "keygen", None) or getattr(_mldsa, "generate_keypair", None)
    if fn is None:
        raise RuntimeError("unsupported pqcrypto ML-DSA API")
    public_key, secret_key = fn()
    return _as_bytes(public_key), _as_bytes(secret_key)


def _pqc_dsa_sign(secret_key: bytes, message: bytes) -> bytes:
    if _mldsa is None:
        raise RuntimeError("pqcrypto ML-DSA unavailable")
    try:
        return _as_bytes(_mldsa.sign(secret_key, message))
    except TypeError:
        sk = _construct_key(_mldsa, "SecretKey", secret_key)
        return _as_bytes(_mldsa.sign(sk, message))


def _pqc_dsa_verify(public_key: bytes, message: bytes, signature: bytes) -> bool:
    if _mldsa is None:
        return False
    try:
        result = _mldsa.verify(public_key, message, signature)
    except TypeError:
        try:
            pk = _construct_key(_mldsa, "PublicKey", public_key)
            result = _mldsa.verify(pk, message, signature)
        except Exception:
            return False
    except Exception:
        return False
    return True if result is None else bool(result)


def _pqc_kem_keygen() -> tuple[bytes, bytes]:
    if _mlkem is None:
        raise RuntimeError("pqcrypto ML-KEM unavailable")
    fn = getattr(_mlkem, "keygen", None) or getattr(_mlkem, "generate_keypair", None)
    if fn is None:
        raise RuntimeError("unsupported pqcrypto ML-KEM API")
    public_key, secret_key = fn()
    return _as_bytes(public_key), _as_bytes(secret_key)


def _pqc_kem_encaps(public_key: bytes) -> tuple[bytes, bytes]:
    if _mlkem is None:
        raise RuntimeError("pqcrypto ML-KEM unavailable")
    fn = getattr(_mlkem, "encaps", None) or getattr(_mlkem, "encrypt", None)
    if fn is None:
        raise RuntimeError("unsupported pqcrypto ML-KEM API")
    try:
        ciphertext, shared = fn(public_key)
    except TypeError:
        pk = _construct_key(_mlkem, "PublicKey", public_key)
        ciphertext, shared = fn(pk)
    return _as_bytes(ciphertext), _as_bytes(shared)


def _pqc_kem_decaps(secret_key: bytes, ciphertext: bytes) -> bytes:
    if _mlkem is None:
        raise RuntimeError("pqcrypto ML-KEM unavailable")
    fn = getattr(_mlkem, "decaps", None) or getattr(_mlkem, "decrypt", None)
    if fn is None:
        raise RuntimeError("unsupported pqcrypto ML-KEM API")
    try:
        return _as_bytes(fn(secret_key, ciphertext))
    except TypeError:
        sk = _construct_key(_mlkem, "SecretKey", secret_key)
        return _as_bytes(fn(sk, ciphertext))


def new_identity() -> SigningIdentity:
    if PQC_OK:
        public_key, secret_key = _pqc_dsa_keygen()
        return SigningIdentity(public_key, secret_key, "ML-DSA-87", False)

    private_key = Ed25519PrivateKey.generate()
    secret_key = private_key.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_key = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    return SigningIdentity(public_key, secret_key, "Ed25519-test-fallback", True)


def sign(identity: SigningIdentity, domain_key: str, payload: Any) -> tuple[bytes, bytes]:
    if domain_key not in DOMAINS:
        raise ValueError(f"unknown domain: {domain_key}")
    d = digest(DOMAINS[domain_key], payload)
    message = DOMAINS[domain_key] + d

    if identity.algorithm == "ML-DSA-87":
        signature = _pqc_dsa_sign(identity.secret_key, message)
    elif identity.algorithm == "Ed25519-test-fallback":
        signature = Ed25519PrivateKey.from_private_bytes(identity.secret_key).sign(message)
    else:
        raise ValueError(f"unsupported signing algorithm: {identity.algorithm}")
    return d, signature


def verify(
    public_key: bytes,
    algorithm: str,
    domain_key: str,
    payload: Any,
    signature: bytes,
    expected_digest: bytes | None = None,
) -> bool:
    if domain_key not in DOMAINS:
        return False
    d = digest(DOMAINS[domain_key], payload)
    if expected_digest is not None and d != expected_digest:
        return False
    message = DOMAINS[domain_key] + d

    if algorithm == "ML-DSA-87":
        return _pqc_dsa_verify(public_key, message, signature)
    if algorithm == "Ed25519-test-fallback":
        try:
            Ed25519PublicKey.from_public_bytes(public_key).verify(signature, message)
            return True
        except Exception:
            return False
    return False


def _derive_aes_key(shared_secret: bytes) -> bytes:
    return HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b"QSF/BBB8/v1/aes",
    ).derive(shared_secret)


def transport_roundtrip(payload: bytes = b"BBB8-transport") -> dict:
    if not isinstance(payload, (bytes, bytearray)):
        raise TypeError("payload must be bytes")
    payload = bytes(payload)

    if PQC_OK:
        public_key, secret_key = _pqc_kem_keygen()
        ciphertext, sender_shared = _pqc_kem_encaps(public_key)
        receiver_shared = _pqc_kem_decaps(secret_key, ciphertext)
        algorithms = ["ML-KEM-1024", "HKDF-SHA256", "AES-256-GCM"]
        pqc = True
    else:
        receiver_private = X25519PrivateKey.generate()
        receiver_public = receiver_private.public_key()
        sender_private = X25519PrivateKey.generate()
        sender_shared = sender_private.exchange(receiver_public)
        receiver_shared = receiver_private.exchange(sender_private.public_key())
        algorithms = ["X25519-test-fallback", "HKDF-SHA256", "AES-256-GCM"]
        pqc = False

    if sender_shared != receiver_shared:
        return {"algorithms": algorithms, "verified": False, "pqc": pqc, "ciphertext_len": 0}

    aes_key = _derive_aes_key(sender_shared)
    nonce = os.urandom(12)
    aad = b"QSF/BBB8/v1/transport"
    encrypted = AESGCM(aes_key).encrypt(nonce, payload, aad)
    recovered = AESGCM(aes_key).decrypt(nonce, encrypted, aad)

    return {
        "algorithms": algorithms,
        "verified": recovered == payload,
        "pqc": pqc,
        "ciphertext_len": len(encrypted),
    }


def crypto_mode() -> str:
    return "ML-DSA-87+ML-KEM-1024" if PQC_OK else "classical-test-fallback"
