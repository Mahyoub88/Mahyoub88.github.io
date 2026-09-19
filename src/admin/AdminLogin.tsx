import { useState } from 'react'
import { Lock, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isCryptoAvailable, MIN_PASSWORD_LENGTH } from './crypto'

export function AdminLogin() {
  const { login, setup, needsSetup, legacy } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const cryptoReady = isCryptoAvailable()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)

    try {
      if (needsSetup) {
        if (password !== confirm) {
          setError('The two passwords do not match.')
          return
        }
        const problem = await setup(password)
        if (problem) setError(problem)
        return
      }

      const ok = await login(password)
      if (!ok) setError('Incorrect password.')
    } finally {
      setBusy(false)
    }
  }

  if (!cryptoReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-0)] px-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-[var(--surface-1)] p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 text-red-400" size={28} />
          <p className="text-sm text-[var(--text-2)]">
            This browser does not expose the Web Crypto API, so the admin vault cannot be opened
            safely. Use an up-to-date browser over HTTPS.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-0)] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-purple-500 text-white">
          {needsSetup ? <KeyRound size={22} /> : <Lock size={22} />}
        </div>
        <h1 className="text-center text-xl font-bold text-[var(--text-1)]">
          {needsSetup ? 'Set Admin Password' : 'Admin Dashboard'}
        </h1>
        <p className="mt-1 text-center text-sm text-[var(--text-3)]">
          {needsSetup
            ? 'This browser has no admin vault yet. Choose a password to create one.'
            : 'Unlock this browser’s admin vault'}
        </p>

        {legacy.removedToken && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
            <ShieldAlert size={14} className="mt-0.5 shrink-0" />
            <span>
              A GitHub token was found stored in plaintext by an older version of this dashboard
              and has been deleted from this browser.{' '}
              <strong>Revoke that token on GitHub now</strong> and issue a new one — assume it was
              readable by anything with access to this browser.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            autoFocus
            autoComplete={needsSetup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(null)
            }}
            placeholder={needsSetup ? `New password (${MIN_PASSWORD_LENGTH}+ characters)` : 'Password'}
            className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-0)] px-3 py-2.5 text-sm text-[var(--text-1)] outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20"
          />
          {needsSetup && (
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value)
                setError(null)
              }}
              placeholder="Confirm password"
              className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-0)] px-3 py-2.5 text-sm text-[var(--text-1)] outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20"
            />
          )}
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={busy || password.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {busy ? 'Working…' : needsSetup ? 'Create Vault' : 'Unlock'}
            {!busy && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--text-3)]">
          The password is never stored. It decrypts your GitHub token on this device only, and is
          required again after every reload.
        </p>

        <Link
          to="/"
          className="mt-5 block text-center text-xs text-[var(--text-3)] hover:text-brand-blue-400"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  )
}
