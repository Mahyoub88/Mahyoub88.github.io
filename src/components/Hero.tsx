import { Download, Send, LayoutGrid, UserRound } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { getIcon } from '../data/icons'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

export function Hero() {
  const { content } = useContent()
  const { hero, specializations, tools } = content

  return (
    <section id="home" className="relative overflow-hidden pb-20 pt-16 lg:pt-24">
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

      <Container className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
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

        <div className="relative lg:col-span-6">
          <div className="relative mr-auto flex aspect-square max-w-md items-center justify-center">
            <div
              aria-hidden
              className="animate-glow-pulse absolute inset-6 rounded-full bg-gradient-to-br from-brand-blue-500/40 via-brand-purple-500/30 to-transparent blur-2xl"
            />
            <div className="animate-float relative flex h-full w-full items-center justify-center rounded-full border border-[var(--border-2)] bg-[var(--surface-1)] shadow-2xl">
              <div className="absolute inset-3 rounded-full bg-gradient-to-tr from-brand-blue-500 via-brand-purple-500 to-brand-blue-400 opacity-25 blur-md" />
              <div className="relative flex h-[88%] w-[88%] items-center justify-center overflow-hidden rounded-full border border-[var(--border-2)] bg-[var(--surface-2)]">
                {hero.photoUrl ? (
                  <img
                    src={hero.photoUrl}
                    alt={hero.greetingName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound
                    size={140}
                    strokeWidth={1}
                    className="text-[var(--text-3)]"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-8 w-full max-w-sm rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)] xl:absolute xl:right-0 xl:top-0 xl:mt-0">
            <p className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-3)]">
              SPECIALIZATIONS
            </p>
            <ul className="mb-5 space-y-3">
              {specializations.map((item) => {
                const Icon = getIcon(item.icon)
                return (
                  <li key={item.id} className="flex items-center gap-3 text-sm text-[var(--text-1)]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-brand-blue-400">
                      <Icon size={16} />
                    </span>
                    {item.label}
                  </li>
                )
              })}
            </ul>

            <p className="mb-3 border-t border-[var(--border-1)] pt-4 text-xs font-semibold tracking-wider text-[var(--text-3)]">
              TOOLS &amp; TECHNOLOGIES
            </p>
            <div className="grid grid-cols-4 gap-3">
              {tools.map((tool) => (
                <div key={tool.id} className="flex flex-col items-center gap-1.5" title={tool.label}>
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: `${tool.color}26`, color: tool.color }}
                  >
                    {tool.abbr}
                  </span>
                  <span className="truncate text-[10px] text-[var(--text-3)]">{tool.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
