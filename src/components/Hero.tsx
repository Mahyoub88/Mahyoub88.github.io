import { Download, Send, LayoutGrid, UserRound } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { getIcon } from '../data/icons'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

export function Hero() {
  const { content } = useContent()
  const { hero, specializations } = content

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

          <h1 className="text-5xl font-extrabold tracking-tight text-[var(--text-1)] sm:text-6xl">
            {hero.greetingName}
          </h1>
          <h2 className="gradient-text mt-2 text-2xl font-bold sm:text-3xl">{hero.tagline}</h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-2)]">
            {hero.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={hero.primaryCta.href}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:brightness-110"
            >
              <Download size={16} />
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-2)] px-5 py-3 text-sm font-semibold text-[var(--text-1)] transition hover:border-brand-blue-500/60"
            >
              <LayoutGrid size={16} />
              {hero.secondaryCta.label}
            </a>
            <a
              href={hero.tertiaryCta.href}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-2)] px-5 py-3 text-sm font-semibold text-[var(--text-1)] transition hover:border-brand-blue-500/60"
            >
              <Send size={16} />
              {hero.tertiaryCta.label}
            </a>
          </div>

          <SocialIcons links={content.social} className="mt-8" />
        </div>

        <div className="lg:col-span-6">
          <div className="grid min-w-0 grid-cols-1 items-stretch gap-5 sm:grid-cols-2">
            <div className="relative min-h-[460px] w-full min-w-0 overflow-hidden rounded-2xl border border-[var(--border-2)] bg-gradient-to-br from-blue-50 via-purple-50 to-white shadow-2xl dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-950">
              <div
                aria-hidden
                className="animate-glow-pulse pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-blue-500/15 via-brand-purple-500/15 to-transparent blur-2xl"
              />
              {hero.photoUrl ? (
                <img
                  src={hero.photoUrl}
                  alt={hero.greetingName}
                  className="absolute inset-0 h-full w-full object-contain object-bottom"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <UserRound size={96} strokeWidth={1} className="text-[var(--text-3)]" />
                </div>
              )}
            </div>

            <div className="flex min-h-[460px] w-full min-w-0 flex-col rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]">
              <p className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-3)]">
                CORE EXPERTISE
              </p>
              <ul className="mb-4 space-y-2.5">
                {specializations.map((item) => {
                  const Icon = getIcon(item.icon)
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 text-sm text-[var(--text-1)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-brand-blue-400">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 truncate">{item.label}</span>
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
