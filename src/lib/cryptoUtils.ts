
/**
 * Utility functions for Web Crypto API operations
 */

// Generate a new key pair for encryption/decryption
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  try {
    // Generate an RSA key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    )

    return keyPair
  } catch (error) {
    console.error("Error generating key pair:", error)
    throw new Error("Failed to generate encryption keys")
  }
}

// Encrypt data using the provided public key
export async function encryptData(
  data: string,
  publicKey: CryptoKey,
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
  try {
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    // Convert the string to an ArrayBuffer
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Encrypt the data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      dataBuffer,
    )

    return {
      ciphertext: encryptedData,
      iv: iv,
    }
  } catch (error) {
    console.error("Error encrypting data:", error)
    throw new Error("Failed to encrypt data")
  }
}

// Decrypt data using the provided private key
export async function decryptData(
  encryptedData: { ciphertext: ArrayBuffer; iv: Uint8Array },
  privateKey: CryptoKey,
): Promise<string> {
  try {
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedData.ciphertext,
    )

    // Convert the ArrayBuffer back to a string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    console.error("Error decrypting data:", error)
    throw new Error("Failed to decrypt data")
  }
}
