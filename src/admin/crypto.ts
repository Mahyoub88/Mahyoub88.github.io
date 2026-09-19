// Web Crypto primitives for the admin vault.
//
// The admin password is never stored — not in plaintext, not as a hash. It is
// used to derive an AES-GCM key via PBKDF2, and that key is what decrypts the
// GitHub token. This is what makes the password load-bearing on a static site:
// faking the "logged in" flag in DevTools gets you the dashboard shell, but
// without the password there is no key, and without the key the token stays
// ciphertext and nothing can be published.

export interface Sealed {
  iv: string
  ct: string
}

/** OWASP 2023 guidance for PBKDF2-HMAC-SHA256. */
export const PBKDF2_ITERATIONS = 310_000

export const MIN_PASSWORD_LENGTH = 12

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

// The Web Crypto signatures want a view backed by a plain ArrayBuffer, so these
// allocate one explicitly rather than letting the generic widen to
// ArrayBufferLike (which also admits SharedArrayBuffer).
function allocate(length: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(length))
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = allocate(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = allocate(length)
  crypto.getRandomValues(bytes)
  return bytes
}

export function newSalt(): string {
  return toBase64(randomBytes(16))
}

export async function deriveKey(
  password: string,
  salt: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: fromBase64(salt), iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function seal(key: CryptoKey, plaintext: string): Promise<Sealed> {
  const iv = randomBytes(12)
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  )
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(ct)) }
}

/** Returns null when the key is wrong or the ciphertext was tampered with. */
export async function unseal(key: CryptoKey, sealed: Sealed): Promise<string | null> {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(sealed.iv) },
      key,
      fromBase64(sealed.ct),
    )
    return new TextDecoder().decode(plain)
  } catch {
    // AES-GCM authentication failure — wrong password, or modified ciphertext.
    return null
  }
}

/** True when this browser can run the vault at all (needs a secure context). */
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined'
}
