import { Download, Send, LayoutGrid, UserRound } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { getIcon } from '../data/icons'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

// A CV / file link (anything that is not an in-page #anchor) opens in a new tab
// and downloads instead of being treated as a scroll target.
const isFileLink = (href: string) => !href.startsWith('#')

// The icon follows the destination, so reordering the buttons in the dashboard
// never leaves a "Download" icon on a link that scrolls to a section.
function ctaIcon(href: string) {
  if (isFileLink(href)) return Download
  if (href.startsWith('#contact')) return Send
  return LayoutGrid
}

const fileLinkProps = (href: string) =>
  isFileLink(href) ? { target: '_blank', rel: 'noopener noreferrer', download: '' } : {}

export function Hero() {
  const { content } = useContent()
  const { hero, specializations } = content

  const PrimaryIcon = ctaIcon(hero.primaryCta.href)
  const SecondaryIcon = ctaIcon(hero.secondaryCta.href)
  const TertiaryIcon = ctaIcon(hero.tertiaryCta.href)

  // The intro is authored as blank-line separated paragraphs.
  const introParagraphs = hero.description.split(/\n\s*\n/).filter((p) => p.trim())

  return (
    <section id="home" className="relative overflow-hidden py-14 lg:py-16">
      {hero.backgroundUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.backgroundUrl})` }}
        />
      )}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 ${
          hero.backgroundUrl
            ? 'bg-[linear-gradient(90deg,var(--surface-0)_15%,rgba(5,7,13,0.55)_55%,rgba(5,7,13,0.3)_100%)]'
            : 'bg-[radial-gradient(60%_50%_at_20%_0%,rgba(59,130,246,0.16),transparent),radial-gradient(50%_40%_at_90%_10%,rgba(168,85,247,0.14),transparent)]'
        }`}
      />

      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-2)] bg-[var(--surface-2)] px-4 py-1.5 text-xs font-semibold tracking-wider text-[var(--text-2)]">
            <UserRound size={14} className="text-brand-blue-400" />
            {hero.badge}
          </span>

          {/* text-4xl on phones so the full name always fits on one line. */}
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-1)] sm:text-5xl lg:text-6xl">
            {hero.greetingName}
          </h1>
          <h2 className="gradient-text mt-3 text-xl font-bold leading-snug sm:text-2xl lg:text-3xl">
            {hero.tagline}
          </h2>

          <div className="mt-6 max-w-[62ch] space-y-4">
            {introParagraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-[var(--text-2)]">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={hero.primaryCta.href}
              {...fileLinkProps(hero.primaryCta.href)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:brightness-110"
            >
              <PrimaryIcon size={16} />
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              {...fileLinkProps(hero.secondaryCta.href)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-2)] px-5 py-3 text-sm font-semibold text-[var(--text-1)] transition hover:border-brand-blue-500/60"
            >
              <SecondaryIcon size={16} />
              {hero.secondaryCta.label}
            </a>
            <a
              href={hero.tertiaryCta.href}
              {...fileLinkProps(hero.tertiaryCta.href)}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-2)] px-5 py-3 text-sm font-semibold text-[var(--text-1)] transition hover:border-brand-blue-500/60"
            >
              <TertiaryIcon size={16} />
              {hero.tertiaryCta.label}
            </a>
          </div>

          <SocialIcons links={content.social} className="mt-8" />
        </div>

        <div className="lg:col-span-6">
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
            <div className="relative min-h-[420px] w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--border-2)] bg-gradient-to-br from-blue-50 via-purple-50 to-white shadow-2xl dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
              <div
                aria-hidden
                className="animate-glow-pulse pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-blue-500/15 via-brand-purple-500/15 to-transparent blur-2xl"
              />
              {hero.photoUrl ? (
                <img
                  src={hero.photoUrl}
                  alt={hero.greetingName}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <UserRound size={96} strokeWidth={1} className="text-[var(--text-3)]" />
                </div>
              )}
            </div>

            <div className="flex min-h-[420px] w-full min-w-0 flex-col rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-3)]">
                CORE EXPERTISE
              </p>
              <ul className="mb-4 space-y-2.5">
                {specializations.map((item) => {
                  const Icon = getIcon(item.icon)
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 text-sm leading-snug text-[var(--text-1)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-brand-blue-400">
                        <Icon size={16} />
                      </span>
                      {/* No truncate: full labels like "Intelligent Transportation
                          Systems" must stay readable rather than being cut off. */}
                      <span className="min-w-0 pt-1.5">{item.label}</span>
                    </li>
                  )
                })}
              </ul>

              <p className="mb-3 border-t border-[var(--border-1)] pt-4 text-xs font-semibold tracking-wider text-[var(--text-3)]">
                CURRENT FOCUS
              </p>
              <div className="flex flex-1 flex-col justify-center gap-3">
                {(hero.currentFocus ?? []).map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm leading-snug text-[var(--text-1)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-brand-blue-500 to-brand-purple-500" />
                    <span className="min-w-0">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
