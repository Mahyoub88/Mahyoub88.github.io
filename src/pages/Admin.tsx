import { useState } from 'react'
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
import { ProjectsSection } from '../admin/sections/ProjectsSection'
import { ArticlesSection } from '../admin/sections/ArticlesSection'
import { ContactSocialSection } from '../admin/sections/ContactSocialSection'
import { SettingsSection } from '../admin/sections/SettingsSection'
import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'

const tabs = [
  { id: 'brand', label: 'Brand & Nav', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero', icon: User },
  { id: 'specializations', label: 'Specializations', icon: Sparkles },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'about', label: 'About', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'articles', label: 'Articles', icon: Newspaper },
  { id: 'contact', label: 'Contact & Social', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type TabId = (typeof tabs)[number]['id']

function AdminDashboard() {
  const { content, setContent, resetContent } = useContent()
  const { logout } = useAuth()
  const [draft, setDraft] = useState<SiteContent>(content)
  const [activeTab, setActiveTab] = useState<TabId>('brand')
  const [justSaved, setJustSaved] = useState(false)

  const isDirty = JSON.stringify(draft) !== JSON.stringify(content)

  const patch = (p: Partial<SiteContent>) => setDraft((prev) => ({ ...prev, ...p }))

  const handleSave = () => {
    setContent(draft)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
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
                onClick={() => setActiveTab(tab.id)}
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
            onChange={(e) => setActiveTab(e.target.value as TabId)}
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
            {isDirty && <p className="text-xs text-brand-amber-400">Unsaved changes</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg border border-[var(--border-1)] px-3 py-2 text-sm font-medium text-[var(--text-2)] hover:border-brand-blue-500/60"
            >
              <ExternalLink size={16} />
              <span className="hidden sm:inline">Preview</span>
            </Link>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
            >
              {justSaved ? <Check size={16} /> : <Save size={16} />}
              {justSaved ? 'Saved' : 'Save Changes'}
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
            {activeTab === 'brand' && <BrandNavSection {...sectionProps} />}
            {activeTab === 'hero' && <HeroSection {...sectionProps} />}
            {activeTab === 'specializations' && <SpecializationsSection {...sectionProps} />}
            {activeTab === 'tools' && <ToolsSection {...sectionProps} />}
            {activeTab === 'stats' && <StatsSection {...sectionProps} />}
            {activeTab === 'about' && <AboutSection {...sectionProps} />}
            {activeTab === 'experience' && <ExperienceSection {...sectionProps} />}
            {activeTab === 'projects' && <ProjectsSection {...sectionProps} />}
            {activeTab === 'articles' && <ArticlesSection {...sectionProps} />}
            {activeTab === 'contact' && <ContactSocialSection {...sectionProps} />}
            {activeTab === 'settings' && (
              <SettingsSection content={draft} onImport={handleImport} onReset={handleReset} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export function Admin() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <AdminLogin />
  return <AdminDashboard />
}
