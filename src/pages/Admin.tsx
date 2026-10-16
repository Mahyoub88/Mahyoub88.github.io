import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  Sparkles,
  Wrench,
  BarChart3,
  FileText,
  Briefcase,
  FolderKanban,
  Newspaper,
  MessageSquare,
  Settings,
  Save,
  LogOut,
  ExternalLink,
  Check,
  CloudUpload,
  GraduationCap,
  ShieldCheck,
  Cpu,
} from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { useAuth } from '../context/AuthContext'
import { AdminLogin } from '../admin/AdminLogin'
import { BrandNavSection } from '../admin/sections/BrandNavSection'
import { HeroSection } from '../admin/sections/HeroSection'
import { SpecializationsSection } from '../admin/sections/SpecializationsSection'
import { ToolsSection } from '../admin/sections/ToolsSection'
import { StatsSection } from '../admin/sections/StatsSection'
import { AboutSection } from '../admin/sections/AboutSection'
import { ExperienceSection } from '../admin/sections/ExperienceSection'
import { TechnicalExpertiseSection } from '../admin/sections/TechnicalExpertiseSection'
import { EducationSection } from '../admin/sections/EducationSection'
import { CertificationsSection } from '../admin/sections/CertificationsSection'
import { ProjectsSection } from '../admin/sections/ProjectsSection'
import { ArticlesSection } from '../admin/sections/ArticlesSection'
import { ContactSocialSection } from '../admin/sections/ContactSocialSection'
import { SettingsSection } from '../admin/sections/SettingsSection'
import { FilesSection } from '../admin/sections/FilesSection'
import { SiteSection } from '../admin/sections/SiteSection'
import { AdvancedSection } from '../admin/sections/AdvancedSection'
import { DeploymentSection } from '../admin/sections/DeploymentSection'
import { validateContent } from '../admin/validateContent'
import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'
import { publishContentToGitHub } from '../admin/github'
import { isTargetReady, readToken } from '../admin/vault'

const tabs = [
  { id: 'brand', label: 'Brand & Nav', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero', icon: User },
  { id: 'specializations', label: 'Core Expertise', icon: Sparkles },
  { id: 'stats', label: 'Career Highlights', icon: BarChart3 },
  { id: 'about', label: 'About', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'technicalExpertise', label: 'Technical Expertise', icon: Cpu },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certifications', label: 'Certifications', icon: ShieldCheck },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'articles', label: 'Research & Technical Work', icon: Newspaper },
  { id: 'contact', label: 'Contact & Social', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'site', label: 'Appearance & SEO', icon: Sparkles },
  { id: 'files', label: 'Pages & Files', icon: FolderKanban },
  { id: 'deployment', label: 'Deployment Status', icon: CloudUpload },
  { id: 'advanced', label: 'Complete Content', icon: FileText },
] as const

type TabId = (typeof tabs)[number]['id']

function AdminDashboard() {
  const { content, setContent, resetContent } = useContent()
  const { logout, vault, cryptoKey } = useAuth()
  const [draft, setDraft] = useState<SiteContent>(content)
  const [activeTab, setActiveTab] = useState<TabId>('brand')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'published' | 'publish-failed'>(
    'idle',
  )
  const [publishError, setPublishError] = useState<string | null>(null)
  const [lastCommit, setLastCommit] = useState<string>()
  const [publishedBase, setPublishedBase] = useState(defaultContent)
  const [fileDirty, setFileDirty] = useState(false)
  const chooseTab = (tab: TabId) => {
    if (fileDirty && tab !== activeTab && !confirm('Discard unsaved file changes?')) return
    setActiveTab(tab)
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(publishedBase)
  const hasUnsavedDraft = JSON.stringify(draft) !== JSON.stringify(content)

  useEffect(() => {
    if (!hasUnsavedDraft) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedDraft])

  const patch = (p: Partial<SiteContent>) => setDraft((prev) => ({ ...prev, ...p }))

  const handleSave = async () => {
    const errors = validateContent(draft)
    if (errors.length) { setPublishError(errors.join(' ')); setSaveState('publish-failed'); return }
    setContent(draft)
    setSaveState('saving')
    setPublishError(null)
    let failed = false

    if (vault && cryptoKey && isTargetReady(vault)) {
      try {
        const token = await readToken(cryptoKey, vault)
        if (!token) throw new Error('the stored token could not be decrypted')
        const result = await publishContentToGitHub(vault.github, token, JSON.stringify(draft, null, 2), JSON.stringify(publishedBase))
        setLastCommit(result.commit?.sha)
        setPublishedBase(draft)
        setSaveState('published')
      } catch (err) {
        failed = true
        setSaveState('publish-failed')
        setPublishError(err instanceof Error ? err.message : String(err))
      }
    } else {
      setSaveState('saved')
    }

    if (!failed) {
      setTimeout(() => setSaveState('idle'), 2500)
    }
  }

  const handleReset = () => {
    resetContent()
    setDraft(defaultContent)
  }

  const handleImport = (next: SiteContent) => {
    setDraft(next)
    setContent(next)
  }

  const sectionProps = { content: draft, onChange: patch }

  const saveButtonLabel = {
    idle: 'Save Changes',
    saving: 'Saving…',
    saved: 'Saved locally',
    published: 'Committed to GitHub',
    'publish-failed': 'Saved (publish failed)',
  }[saveState]

  return (
    <div className="flex min-h-screen bg-[var(--surface-0)]">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--border-1)] bg-[var(--surface-1)] lg:block">
        <div className="flex h-20 items-center gap-3 border-b border-[var(--border-1)] px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-purple-500 font-bold text-white">
            {content.brand.logoInitial}
          </span>
          <span className="text-sm font-semibold text-[var(--text-1)]">Admin Dashboard</span>
        </div>
        <nav className="space-y-1 p-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => chooseTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-blue-500/10 text-brand-blue-400'
                    : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="border-b border-[var(--border-1)] bg-[var(--surface-1)] p-3 lg:hidden">
          <select
            value={activeTab}
            onChange={(e) => chooseTab(e.target.value as TabId)}
            className="w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)]"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
        <header className="flex h-20 items-center justify-between border-b border-[var(--border-1)] bg-[var(--surface-1)] px-6">
          <div>
            <h1 className="text-lg font-bold text-[var(--text-1)]">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            {isDirty && <p className="text-xs text-brand-amber-400">{hasUnsavedDraft ? 'Unsaved draft changes' : 'Local draft — not yet committed'}</p>}
            {saveState === 'publish-failed' && (
              <p className="text-xs text-red-400">
                Saved locally, but publish to GitHub failed{publishError ? `: ${publishError}` : '.'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              onClick={() => setContent(draft)}
              className="flex items-center gap-2 rounded-lg border border-[var(--border-1)] px-3 py-2 text-sm font-medium text-[var(--text-2)] hover:border-brand-blue-500/60"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Preview</span>
            </Link>
            <button
              onClick={handleSave}
              disabled={(!isDirty && saveState !== 'publish-failed') || saveState === 'saving'}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
            >
              {saveState === 'idle' || saveState === 'saving' ? (
                <Save size={16} />
              ) : saveState === 'published' ? (
                <CloudUpload size={16} />
              ) : (
                <Check size={16} />
              )}
              {saveButtonLabel}
            </button>
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-1)] text-[var(--text-2)] hover:border-red-400/60 hover:text-red-400"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {lastCommit && <p role="status" className="mb-4 rounded-lg border border-[var(--border-1)] p-3 text-sm">Changes committed to GitHub. <button className="underline" onClick={() => setActiveTab('deployment')}>Check deployment status</button> to confirm when visitors can see them.</p>}
            {activeTab === 'brand' && <BrandNavSection {...sectionProps} />}
            {activeTab === 'hero' && <HeroSection {...sectionProps} />}
            {activeTab === 'specializations' && <SpecializationsSection {...sectionProps} />}
            {activeTab === 'stats' && <StatsSection {...sectionProps} />}
            {activeTab === 'about' && <AboutSection {...sectionProps} />}
            {activeTab === 'experience' && <ExperienceSection {...sectionProps} />}
            {activeTab === 'technicalExpertise' && <TechnicalExpertiseSection {...sectionProps} />}
            {activeTab === 'tools' && <ToolsSection {...sectionProps} />}
            {activeTab === 'education' && <EducationSection {...sectionProps} />}
            {activeTab === 'certifications' && <CertificationsSection {...sectionProps} />}
            {activeTab === 'projects' && <ProjectsSection {...sectionProps} />}
            {activeTab === 'articles' && <ArticlesSection {...sectionProps} />}
            {activeTab === 'contact' && <ContactSocialSection {...sectionProps} />}
            {activeTab === 'site' && <SiteSection {...sectionProps} />}
            {activeTab === 'files' && <FilesSection onDirtyChange={setFileDirty} />}
            {activeTab === 'deployment' && <DeploymentSection commit={lastCommit} />}
            {activeTab === 'advanced' && <AdvancedSection {...sectionProps} />}
            {activeTab === 'settings' && (
              <SettingsSection content={draft} onImport={handleImport} onReset={handleReset} expectedContent={publishedBase} onCommitted={commit => { setLastCommit(commit); setPublishedBase(draft); setContent(draft) }} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export function Admin() {
  const { isAuthenticated } = useAuth()

  // Keep the dashboard out of search results. The route is client-side, so the
  // tag has to be added while it is mounted and removed on the way out.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  if (!isAuthenticated) return <AdminLogin />
  return <AdminDashboard />
}
