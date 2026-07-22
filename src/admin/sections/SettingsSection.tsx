import { useRef, useState } from 'react'
import { Download, Upload, RotateCcw, Save, KeyRound, AlertTriangle } from 'lucide-react'
import { GitHubIcon } from '../../components/BrandIcons'
import type { SiteContent } from '../../types/content'
import { Field, TextInput } from '../ui/Field'
import { useAuth } from '../../context/AuthContext'
import { publishContentToGitHub } from '../github'

const GITHUB_CONFIG_KEY = 'portfolio-github-config'

interface GitHubConfig {
  owner: string
  repo: string
  branch: string
  path: string
  token: string
}

const defaultGitHubConfig: GitHubConfig = {
  owner: '',
  repo: '',
  branch: 'main',
  path: 'src/data/defaultContent.json',
  token: '',
}

function loadGitHubConfig(): GitHubConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY)
    return raw ? { ...defaultGitHubConfig, ...JSON.parse(raw) } : defaultGitHubConfig
  } catch {
    return defaultGitHubConfig
  }
}

export function SettingsSection({
  content,
  onImport,
  onReset,
}: {
  content: SiteContent
  onImport: (next: SiteContent) => void
  onReset: () => void
}) {
  const { changePassword } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMessage, setPwMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  const [gh, setGh] = useState<GitHubConfig>(() => loadGitHubConfig())
  const [publishStatus, setPublishStatus] = useState<{
    type: 'ok' | 'error' | 'loading'
    text: string
  } | null>(null)

  const updateGh = (patch: Partial<GitHubConfig>) => {
    const next = { ...gh, ...patch }
    setGh(next)
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(next))
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

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPw.length < 4) {
      setPwMessage({ type: 'error', text: 'New password must be at least 4 characters.' })
      return
    }
    const ok = changePassword(currentPw, newPw)
    if (ok) {
      setPwMessage({ type: 'ok', text: 'Password updated.' })
      setCurrentPw('')
      setNewPw('')
    } else {
      setPwMessage({ type: 'error', text: 'Current password is incorrect.' })
    }
  }

  const handlePublish = async () => {
    if (!gh.owner || !gh.repo || !gh.token) {
      setPublishStatus({ type: 'error', text: 'Owner, repo, and token are required.' })
      return
    }
    setPublishStatus({ type: 'loading', text: 'Publishing…' })
    try {
      const result = await publishContentToGitHub(gh, JSON.stringify(content, null, 2))
      setPublishStatus({
        type: 'ok',
        text: result.commit?.html_url
          ? `Published. Redeploy will pick this up automatically.`
          : 'Published successfully.',
      })
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
          Changes save to this browser instantly. Export a backup or publish to GitHub to make
          them permanent and visible to everyone.
        </p>
      </div>

      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text-1)]">
          <GitHubIcon size={18} />
          Publish to GitHub
        </h2>
        <p className="mb-4 text-sm text-[var(--text-2)]">
          Commits the current content directly to your repository so it becomes the new default
          for every visitor after your host redeploys (GitHub Pages / Vercel / Netlify all
          redeploy automatically on push).
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Owner">
            <TextInput
              placeholder="mahyoub88"
              value={gh.owner}
              onChange={(e) => updateGh({ owner: e.target.value })}
            />
          </Field>
          <Field label="Repository">
            <TextInput
              placeholder="predicting-vehicle-type-using-ngsim-us101"
              value={gh.repo}
              onChange={(e) => updateGh({ repo: e.target.value })}
            />
          </Field>
          <Field label="Branch">
            <TextInput value={gh.branch} onChange={(e) => updateGh({ branch: e.target.value })} />
          </Field>
          <Field label="File path in repo">
            <TextInput value={gh.path} onChange={(e) => updateGh({ path: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Personal Access Token"
              hint="Fine-grained token with 'Contents: read and write' on this repo only. Stored in this browser's local storage — never share it."
            >
              <TextInput
                type="password"
                placeholder="github_pat_..."
                value={gh.token}
                onChange={(e) => updateGh({ token: e.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand-amber-400/30 bg-brand-amber-400/10 px-3 py-2 text-xs text-brand-amber-400">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Only use this on a device you trust. The token is stored locally and used to call the
          GitHub API directly from your browser.
        </div>

        <button
          onClick={handlePublish}
          disabled={publishStatus?.type === 'loading'}
          className="mt-4 flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <Save size={16} />
          {publishStatus?.type === 'loading' ? 'Publishing…' : 'Publish to GitHub'}
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
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </Field>
          <Field label="New password">
            <TextInput type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
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
