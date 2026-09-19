// Encrypted storage for the admin dashboard's publish credentials.
//
// Everything the dashboard needs to publish lives in one localStorage record.
// The GitHub token inside it is sealed with a key derived from the admin
// password (see crypto.ts), so the stored bytes are useless to anyone who does
// not know the password — including someone who copies localStorage wholesale.

import {
  MIN_PASSWORD_LENGTH,
  PBKDF2_ITERATIONS,
  deriveKey,
  newSalt,
  seal,
  unseal,
  type Sealed,
} from './crypto'

const VAULT_KEY = 'portfolio-admin-vault-v1'

// Pre-vault keys. These held a plaintext GitHub token and a plaintext password
// and are destroyed on sight — see purgeLegacySecrets().
const LEGACY_GITHUB_KEY = 'portfolio-github-config'
const LEGACY_PASSWORD_KEY = 'portfolio-admin-password'
const LEGACY_SESSION_KEY = 'portfolio-admin-session'

/** Decrypting this proves the password was right. */
const CHECK_PLAINTEXT = 'portfolio-admin-vault-v1/ok'

export interface GitHubTarget {
  owner: string
  repo: string
  branch: string
  path: string
}

export interface Vault {
  v: 1
  kdf: { salt: string; iterations: number }
  check: Sealed
  github: GitHubTarget
  token: Sealed | null
}

export const defaultTarget: GitHubTarget = {
  owner: '',
  repo: '',
  branch: 'main',
  path: 'src/data/defaultContent.json',
}

export function loadVault(): Vault | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Vault
    if (parsed?.v !== 1 || !parsed.kdf?.salt || !parsed.check) return null
    return { ...parsed, github: { ...defaultTarget, ...parsed.github } }
  } catch {
    return null
  }
}

export function saveVault(vault: Vault): void {
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
}

export function vaultExists(): boolean {
  return loadVault() !== null
}

export interface LegacyPurge {
  removedToken: boolean
  removedPassword: boolean
}

/**
 * Removes every pre-vault key. The old build kept the GitHub token in
 * plaintext, so a token found here must be treated as compromised: the caller
 * surfaces `removedToken` as a prompt to revoke it on GitHub.
 */
export function purgeLegacySecrets(): LegacyPurge {
  let removedToken = false
  try {
    const legacy = localStorage.getItem(LEGACY_GITHUB_KEY)
    if (legacy) {
      removedToken = Boolean(JSON.parse(legacy)?.token)
      localStorage.removeItem(LEGACY_GITHUB_KEY)
    }
  } catch {
    localStorage.removeItem(LEGACY_GITHUB_KEY)
  }

  const removedPassword = localStorage.getItem(LEGACY_PASSWORD_KEY) !== null
  localStorage.removeItem(LEGACY_PASSWORD_KEY)
  sessionStorage.removeItem(LEGACY_SESSION_KEY)

  return { removedToken, removedPassword }
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  return null
}

/** First run: turn a chosen password into a vault and its in-memory key. */
export async function createVault(
  password: string,
  target: GitHubTarget = defaultTarget,
): Promise<{ vault: Vault; key: CryptoKey }> {
  const salt = newSalt()
  const key = await deriveKey(password, salt)
  const vault: Vault = {
    v: 1,
    kdf: { salt, iterations: PBKDF2_ITERATIONS },
    check: await seal(key, CHECK_PLAINTEXT),
    github: target,
    token: null,
  }
  saveVault(vault)
  return { vault, key }
}

/** Returns the key on the right password, null on the wrong one. */
export async function unlockVault(vault: Vault, password: string): Promise<CryptoKey | null> {
  const key = await deriveKey(password, vault.kdf.salt, vault.kdf.iterations)
  const check = await unseal(key, vault.check)
  return check === CHECK_PLAINTEXT ? key : null
}

export async function readToken(key: CryptoKey, vault: Vault): Promise<string | null> {
  return vault.token ? unseal(key, vault.token) : null
}

export async function writeToken(
  key: CryptoKey,
  vault: Vault,
  token: string,
): Promise<Vault> {
  const next: Vault = { ...vault, token: token ? await seal(key, token) : null }
  saveVault(next)
  return next
}

export function writeTarget(vault: Vault, patch: Partial<GitHubTarget>): Vault {
  const next: Vault = { ...vault, github: { ...vault.github, ...patch } }
  saveVault(next)
  return next
}

/**
 * Re-keys the vault. The token is decrypted with the old key and re-sealed
 * with the new one, so changing the password never strands it.
 */
export async function changeVaultPassword(
  vault: Vault,
  current: string,
  next: string,
): Promise<{ vault: Vault; key: CryptoKey } | null> {
  const oldKey = await unlockVault(vault, current)
  if (!oldKey) return null

  const token = await readToken(oldKey, vault)
  const salt = newSalt()
  const newKey = await deriveKey(next, salt)
  const rekeyed: Vault = {
    ...vault,
    kdf: { salt, iterations: PBKDF2_ITERATIONS },
    check: await seal(newKey, CHECK_PLAINTEXT),
    token: token ? await seal(newKey, token) : null,
  }
  saveVault(rekeyed)
  return { vault: rekeyed, key: newKey }
}

export function isTargetReady(vault: Vault | null): boolean {
  return Boolean(vault?.github.owner && vault?.github.repo && vault?.token)
}
