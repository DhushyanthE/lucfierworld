/**
 * Post-quantum cryptography helpers — TypeScript port of `quantum-core/pqc.py`
 * from DEVELOPMENT.md (ML-KEM-1024 key encapsulation, ML-DSA-87 signatures).
 *
 * Uses @noble/post-quantum, an audited JS implementation of the FIPS 203/204
 * standards, so these are the real algorithms rather than a stand-in.
 *
 * The argument order of `sign`/`verify` differs between @noble/post-quantum
 * major versions; the wrappers below tolerate both so a dependency bump cannot
 * silently turn every signature into an error.
 */

import { ml_kem1024 } from "npm:@noble/post-quantum@0.7.0/ml-kem.js";
import { ml_dsa87 } from "npm:@noble/post-quantum@0.7.0/ml-dsa.js";

export function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

export function fromB64(b64: string): Uint8Array {
  let bin: string;
  try {
    bin = atob(b64.trim());
  } catch {
    throw new Error("value is not valid base64");
  }
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const enc = new TextEncoder();

export const mlKem = {
  keygen() {
    const { publicKey, secretKey } = ml_kem1024.keygen();
    return {
      public_key_b64: toB64(publicKey),
      secret_key_b64: toB64(secretKey),
      public_key_bytes: publicKey.length,
      secret_key_bytes: secretKey.length,
      caveat:
        "Demo only. The secret key is returned over HTTP so the round trip is inspectable; a production KEM never transmits secret key material.",
    };
  },

  encapsulate(publicKeyB64: string) {
    const result = ml_kem1024.encapsulate(fromB64(publicKeyB64));
    const ciphertext: Uint8Array = (result as { cipherText?: Uint8Array; ciphertext?: Uint8Array })
      .cipherText ?? (result as { ciphertext: Uint8Array }).ciphertext;
    return {
      ciphertext_b64: toB64(ciphertext),
      shared_secret_b64: toB64(result.sharedSecret),
      ciphertext_bytes: ciphertext.length,
    };
  },

  decapsulate(secretKeyB64: string, ciphertextB64: string) {
    const sharedSecret = ml_kem1024.decapsulate(
      fromB64(ciphertextB64),
      fromB64(secretKeyB64),
    );
    return { shared_secret_b64: toB64(sharedSecret) };
  },
};

type DsaFns = {
  sign: (...args: unknown[]) => Uint8Array;
  verify: (...args: unknown[]) => boolean;
};

export const mlDsa = {
  keygen() {
    const { publicKey, secretKey } = ml_dsa87.keygen();
    return {
      public_key_b64: toB64(publicKey),
      secret_key_b64: toB64(secretKey),
      public_key_bytes: publicKey.length,
      secret_key_bytes: secretKey.length,
    };
  },

  sign(secretKeyB64: string, message: string) {
    const sk = fromB64(secretKeyB64);
    const msg = enc.encode(message);
    const dsa = ml_dsa87 as unknown as DsaFns;
    let signature: Uint8Array;
    try {
      signature = dsa.sign(sk, msg);
    } catch {
      signature = dsa.sign(msg, sk);
    }
    return { signature_b64: toB64(signature), signature_bytes: signature.length };
  },

  verify(publicKeyB64: string, message: string, signatureB64: string): boolean {
    const pk = fromB64(publicKeyB64);
    const msg = enc.encode(message);
    const sig = fromB64(signatureB64);
    const dsa = ml_dsa87 as unknown as DsaFns;
    try {
      return dsa.verify(sig, msg, pk) === true;
    } catch {
      try {
        return dsa.verify(pk, msg, sig) === true;
      } catch {
        return false;
      }
    }
  },
};
