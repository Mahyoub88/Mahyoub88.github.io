import { useRef, useState } from 'react'
import {
  Download,
  Upload,
  RotateCcw,
  Save,
  KeyRound,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { GitHubIcon } from '../../components/BrandIcons'
import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { useAuth } from '../../context/AuthContext'
import { publishContentToGitHub } from '../github'
import { MIN_PASSWORD_LENGTH } from '../crypto'
import { readToken, writeTarget, writeToken, type GitHubTarget } from '../vault'

export function SettingsSection({
  content,
  onImport,
  onReset,
}: {
  content: SiteContent
  onImport: (next: SiteContent) => void
  onReset: () => void
}) {
  const { changePassword, vault, setVault, cryptoKey } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMessage, setPwMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const target = vault?.github
  const hasToken = Boolean(vault?.token)
  // Never prefilled: the stored token is ciphertext, and decrypting it just to
  // paint it into an input would put it back in the DOM for no reason.
  const [tokenDraft, setTokenDraft] = useState('')
  const [tokenMessage, setTokenMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    null,
  )
  const [publishStatus, setPublishStatus] = useState<{
    type: 'ok' | 'error' | 'loading'
    text: string
  } | null>(null)

  const updateTarget = (patch: Partial<GitHubTarget>) => {
    if (!vault) return
    setVault(writeTarget(vault, patch))
  }

  const handleSaveToken = async () => {
    if (!vault || !cryptoKey) return
    if (!tokenDraft.trim()) {
      setTokenMessage({ type: 'error', text: 'Paste a token first.' })
      return
    }
    setVault(await writeToken(cryptoKey, vault, tokenDraft.trim()))
    setTokenDraft('')
    setTokenMessage({ type: 'ok', text: 'Token encrypted and saved to this browser.' })
  }

  const handleClearToken = async () => {
    if (!vault || !cryptoKey) return
    if (!confirm('Remove the stored token from this browser?')) return
    setVault(await writeToken(cryptoKey, vault, ''))
    setTokenMessage({ type: 'ok', text: 'Token removed from this browser.' })
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        onImport(parsed)
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = await changePassword(currentPw, newPw)
    if (problem) {
      setPwMessage({ type: 'error', text: problem })
      return
    }
    setPwMessage({ type: 'ok', text: 'Password updated and the stored token re-encrypted.' })
    setCurrentPw('')
    setNewPw('')
  }

  const handlePublish = async () => {
    if (!vault || !cryptoKey) return
    if (!target?.owner || !target?.repo || !hasToken) {
      setPublishStatus({ type: 'error', text: 'Owner, repository and a saved token are required.' })
      return
    }
    setPublishStatus({ type: 'loading', text: 'Publishing…' })
    const token = await readToken(cryptoKey, vault)
    if (!token) {
      setPublishStatus({ type: 'error', text: 'Could not decrypt the stored token.' })
      return
    }
    try {
      await publishContentToGitHub(target, token, JSON.stringify(content, null, 2))
      setPublishStatus({ type: 'ok', text: 'Published. The redeploy picks this up automatically.' })
    } catch (err) {
      setPublishStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Publish failed.',
      })
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-1)]">Backup &amp; Restore</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-1)] px-4 py-2.5 text-sm font-medium text-[var(--text-1)] hover:border-brand-blue-500/60"
          >
            <Download size={16} />
            Export content.json
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-1)] px-4 py-2.5 text-sm font-medium text-[var(--text-1)] hover:border-brand-blue-500/60"
          >
            <Upload size={16} />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => {
              if (confirm('Reset all content to the built-in defaults? This cannot be undone.')) {
                onReset()
              }
            }}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--text-3)]">
          Changes save to this browser instantly. Once a token is saved below, every Save Changes
          also publishes automatically.
        </p>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text-1)]">
          <GitHubIcon size={18} />
          Publish to GitHub
        </h2>
        <p className="mb-4 text-sm text-[var(--text-2)]">
          Commits the current content to your repository so it becomes the new default for every
          visitor after the next deploy. Once these fields are filled in, every{' '}
          <strong>Save Changes</strong> click across the dashboard publishes automatically too.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Owner">
            <TextInput
              placeholder="Mahyoub88"
              value={target?.owner ?? ''}
              onChange={(e) => updateTarget({ owner: e.target.value })}
            />
          </Field>
          <Field label="Repository">
            <TextInput
              placeholder="mahyoub88.github.io"
              value={target?.repo ?? ''}
              onChange={(e) => updateTarget({ repo: e.target.value })}
            />
          </Field>
          <Field label="Branch">
            <TextInput
              value={target?.branch ?? ''}
              onChange={(e) => updateTarget({ branch: e.target.value })}
            />
          </Field>
          <Field label="File path in repo">
            <TextInput
              value={target?.path ?? ''}
              onChange={(e) => updateTarget({ path: e.target.value })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Personal Access Token"
              hint="Fine-grained token with 'Contents: read and write' on this repository only. Encrypted with your admin password before it touches storage."
            >
              <TextInput
                type="password"
                autoComplete="off"
                placeholder={hasToken ? '•••••••• saved — paste a new one to replace' : 'github_pat_...'}
                value={tokenDraft}
                onChange={(e) => {
                  setTokenDraft(e.target.value)
                  setTokenMessage(null)
                }}
              />
            </Field>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveToken}
                className="flex items-center gap-2 rounded-lg border border-[var(--border-1)] px-3 py-2 text-sm font-medium text-[var(--text-1)] hover:border-brand-blue-500/60"
              >
                <ShieldCheck size={15} />
                Encrypt &amp; Save Token
              </button>
              {hasToken && (
                <button
                  onClick={handleClearToken}
                  className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                  Remove Token
                </button>
              )}
              {tokenMessage && (
                <span
                  className={`text-xs ${tokenMessage.type === 'ok' ? 'text-brand-emerald-400' : 'text-red-400'}`}
                >
                  {tokenMessage.text}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand-amber-400/30 bg-brand-amber-400/10 px-3 py-2 text-xs text-brand-amber-400">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          The token is stored encrypted, but it is still decrypted in this tab while you are signed
          in — only use this on a device you trust, and scope the token to this one repository.
        </div>

        <button
          onClick={handlePublish}
          disabled={publishStatus?.type === 'loading'}
          className="mt-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <Save size={16} />
          {publishStatus?.type === 'loading' ? 'Publishing…' : 'Publish Now'}
        </button>
        {publishStatus && publishStatus.type !== 'loading' && (
          <p
            className={`mt-2 text-sm ${publishStatus.type === 'ok' ? 'text-brand-emerald-400' : 'text-red-400'}`}
          >
            {publishStatus.text}
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text-1)]">
          <KeyRound size={18} />
          Change Admin Password
        </h2>
        <form onSubmit={handlePasswordChange} className="grid max-w-md grid-cols-1 gap-4">
          <Field label="Current password">
            <TextInput
              type="password"
              autoComplete="current-password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </Field>
          <Field label={`New password (${MIN_PASSWORD_LENGTH}+ characters)`}>
            <TextInput
              type="password"
              autoComplete="new-password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </Field>
          {pwMessage && (
            <p className={`text-sm ${pwMessage.type === 'ok' ? 'text-brand-emerald-400' : 'text-red-400'}`}>
              {pwMessage.text}
            </p>
          )}
          <button
            type="submit"
            className="flex w-fit items-center gap-2 rounded-lg border border-[var(--border-1)] px-4 py-2.5 text-sm font-medium text-[var(--text-1)] hover:border-brand-blue-500/60"
          >
            <Save size={16} />
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
