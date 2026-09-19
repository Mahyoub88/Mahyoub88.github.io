import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  changeVaultPassword,
  createVault,
  loadVault,
  purgeLegacySecrets,
  unlockVault,
  validatePassword,
  type LegacyPurge,
  type Vault,
} from '../admin/vault'

// There is no default password and no "remember me" flag. Authentication *is*
// holding the derived key, and that key lives in React state only: it is never
// written to localStorage or sessionStorage, so it cannot be forged from
// DevTools and does not survive a reload. Refreshing the page means entering
// the password again — on a static site with no server, that is the price of
// the gate actually meaning something.

interface AuthContextValue {
  isAuthenticated: boolean
  /** Null until the password is entered. Required to decrypt the token. */
  cryptoKey: CryptoKey | null
  vault: Vault | null
  setVault: (vault: Vault) => void
  /** True on first run: no vault yet, so a password has to be chosen. */
  needsSetup: boolean
  /** Set when a pre-vault plaintext token/password was found and destroyed. */
  legacy: LegacyPurge
  setup: (password: string) => Promise<string | null>
  login: (password: string) => Promise<boolean>
  logout: () => void
  changePassword: (current: string, next: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Runs once, before anything can read the old keys: the previous build kept
  // the GitHub token and the admin password in plaintext localStorage.
  const [legacy] = useState<LegacyPurge>(() => purgeLegacySecrets())
  const [vault, setVaultState] = useState<Vault | null>(() => loadVault())
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)

  const setup = useCallback(async (password: string) => {
    const problem = validatePassword(password)
    if (problem) return problem
    const { vault: created, key } = await createVault(password)
    setVaultState(created)
    setCryptoKey(key)
    return null
  }, [])

  const login = useCallback(
    async (password: string) => {
      const current = vault ?? loadVault()
      if (!current) return false
      const key = await unlockVault(current, password)
      if (!key) return false
      setVaultState(current)
      setCryptoKey(key)
      return true
    },
    [vault],
  )

  const logout = useCallback(() => {
    setCryptoKey(null)
  }, [])

  const changePassword = useCallback(
    async (current: string, next: string) => {
      const problem = validatePassword(next)
      if (problem) return problem
      const active = vault ?? loadVault()
      if (!active) return 'No admin vault on this browser.'
      const result = await changeVaultPassword(active, current, next)
      if (!result) return 'Current password is incorrect.'
      setVaultState(result.vault)
      setCryptoKey(result.key)
      return null
    },
    [vault],
  )

  const value = useMemo(
    () => ({
      isAuthenticated: cryptoKey !== null,
      cryptoKey,
      vault,
      setVault: setVaultState,
      needsSetup: vault === null,
      legacy,
      setup,
      login,
      logout,
      changePassword,
    }),
    [cryptoKey, vault, legacy, setup, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
