import { useState } from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AdminLogin() {
  const { login, isDefaultPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!login(password)) {
      setError(true)
      return
    }
    setError(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-0)] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-8 shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-purple-500 text-white">
          <Lock size={22} />
        </div>
        <h1 className="text-center text-xl font-bold text-[var(--text-1)]">Admin Dashboard</h1>
        <p className="mt-1 text-center text-sm text-[var(--text-3)]">
          Sign in to edit site content
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError(false)
            }}
            placeholder="Password"
            className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-0)] px-3 py-2.5 text-sm text-[var(--text-1)] outline-none focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20"
          />
          {error && <p className="text-xs text-red-400">Incorrect password. Try again.</p>}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Sign In
            <ArrowRight size={16} />
          </button>
        </form>

        {isDefaultPassword && (
          <p className="mt-4 rounded-lg border border-brand-amber-400/30 bg-brand-amber-400/10 px-3 py-2 text-xs text-brand-amber-400">
            Default password is <code>admin123</code>. Change it from Settings after signing in.
          </p>
        )}

        <Link
          to="/"
          className="mt-6 block text-center text-xs text-[var(--text-3)] hover:text-brand-blue-400"
        >
          ← Back to site
        </Link>
      </div>
    </div>
  )
}
