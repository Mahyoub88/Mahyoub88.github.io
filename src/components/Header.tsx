import { useEffect, useMemo, useState } from 'react'
import { Sun, Moon, Menu, X, Download, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useActiveSection } from '../hooks/useActiveSection'
import { Container } from './Container'

export function Header() {
  const { content } = useContent()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  // Same rule as the hero CTA: a file link (not an in-page #anchor) opens in a
  // new tab and downloads, so the header CV button behaves like a real download.
  const ctaIsFile = !content.hero.primaryCta.href.startsWith('#')
  const ctaFileProps = ctaIsFile
    ? { target: '_blank', rel: 'noopener noreferrer', download: '' }
    : {}

  // The hero already shows this CTA, so showing it in the sticky header at the
  // same time duplicates it on screen. Reveal the header copy only once the
  // hero has scrolled away, keeping the CV reachable without the duplication.
  const [heroPassed, setHeroPassed] = useState(false)
  useEffect(() => {
    const update = () => {
      const hero = document.getElementById('home')
      // No hero yet (first paint) or no hero at all (admin route): fall back to
      // one viewport, so the button never flashes in beside the hero's own CTA.
      if (!hero) {
        setHeroPassed(window.scrollY > window.innerHeight * 0.8)
        return
      }
      const heroBottom = hero.offsetTop + hero.offsetHeight
      // Before first layout the hero measures 0; treat that as "still on the
      // hero" so the button never flashes next to the hero's own CTA.
      if (heroBottom <= 0) {
        setHeroPassed(false)
        return
      }
      // 80px ≈ the sticky header's own height, so the button appears just as
      // the hero's CTA scrolls out from under it.
      setHeroPassed(window.scrollY > heroBottom - 80)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    // Late layout shifts (web font, hero background) change the hero's height.
    window.addEventListener('load', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('load', update)
    }
  }, [])

  const sectionIds = useMemo(
    () =>
      content.nav
        .filter((link) => link.href.startsWith('#'))
        .map((link) => link.href.slice(1)),
    [content.nav],
  )
  const activeSection = useActiveSection(sectionIds)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-1)] bg-[var(--surface-0)]/80 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between">
        <a href="#home" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-purple-500 font-bold text-white shadow-lg shadow-brand-blue-500/20">
            {content.brand.logoInitial}
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold text-[var(--text-1)]">
              {content.brand.name}
            </span>
            <span className="text-xs text-[var(--text-3)]">{content.brand.title}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-[var(--border-1)] bg-[var(--surface-1)] p-1 lg:flex">
          {content.nav.map((link) => {
            const isActive = link.href === `#${activeSection}`
            return (
              <a
                key={link.id}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--surface-2)] text-brand-blue-400'
                    : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                }`}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && (
            <Link
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-1)] text-[var(--text-2)] transition hover:border-brand-blue-500/60 hover:text-brand-blue-400"
              aria-label="Admin dashboard"
              title="Admin dashboard"
            >
              <LayoutDashboard size={18} />
            </Link>
          )}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-1)] text-[var(--text-2)] transition hover:border-brand-blue-500/60 hover:text-brand-blue-400"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href={content.hero.primaryCta.href}
            {...ctaFileProps}
            aria-hidden={!heroPassed}
            tabIndex={heroPassed ? undefined : -1}
            className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/20 transition hover:brightness-110 ${
              heroPassed ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <Download size={16} />
            {content.hero.primaryCta.label}
          </a>
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-1)] text-[var(--text-2)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-[var(--border-1)] bg-[var(--surface-0)] lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {content.nav.map((link) => {
              const isActive = link.href === `#${activeSection}`
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-2)] text-brand-blue-400'
                      : 'text-[var(--text-2)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  {link.label}
                </a>
              )
            })}
            <div className="mt-2 flex items-center gap-3 px-3">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-1)] text-[var(--text-2)]"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <a
                href={content.hero.primaryCta.href}
                {...ctaFileProps}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Download size={16} />
                {content.hero.primaryCta.label}
              </a>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
