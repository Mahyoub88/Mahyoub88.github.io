import { ArrowUpRight } from 'lucide-react'
import type { Project, ProjectStatusKind } from '../types/content'

const accentStyles: Record<Project['accent'], { text: string; gradient: string; ring: string }> = {
  blue: {
    text: 'text-brand-blue-400',
    gradient: 'from-brand-blue-500/25 via-brand-blue-500/5 to-transparent',
    ring: 'hover:border-brand-blue-500/50',
  },
  purple: {
    text: 'text-brand-purple-400',
    gradient: 'from-brand-purple-500/25 via-brand-purple-500/5 to-transparent',
    ring: 'hover:border-brand-purple-500/50',
  },
  amber: {
    text: 'text-brand-amber-400',
    gradient: 'from-brand-amber-400/25 via-brand-amber-400/5 to-transparent',
    ring: 'hover:border-brand-amber-400/50',
  },
}

// The badge tells the reader what kind of claim the card is making, so academic
// work is never mistaken for a shipped production system.
const statusStyles: Record<ProjectStatusKind, string> = {
  public: 'border-brand-emerald-400/40 bg-brand-emerald-400/10 text-brand-emerald-400',
  academic: 'border-brand-purple-500/40 bg-brand-purple-500/10 text-brand-purple-400',
  professional: 'border-brand-amber-400/40 bg-brand-amber-400/10 text-brand-amber-400',
}

export function ProjectCard({ project }: { project: Project }) {
  const accent = accentStyles[project.accent]
  const buttons = project.links?.filter((l) => l.label && l.href) ?? []
  // A card with its own buttons must not also be one big link — nesting anchors
  // is invalid and steals the click from the buttons.
  const wholeCardLink = buttons.length === 0 && Boolean(project.link)

  const Wrapper = wholeCardLink ? 'a' : 'div'

  return (
    <Wrapper
      {...(wholeCardLink
        ? { href: project.link, target: '_blank', rel: 'noreferrer' }
        : {})}
      className={`${wholeCardLink ? 'group ' : ''}flex flex-col overflow-hidden rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] shadow-[var(--shadow-card)] transition ${accent.ring}`}
    >
      <div
        className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${accent.gradient}`}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,var(--border-2)_1px,transparent_0)] [background-size:16px_16px]"
        />
        <span className={`relative text-4xl font-black tracking-tight opacity-20 ${accent.text}`}>
          {project.category.slice(0, 2).toUpperCase()}
        </span>
        {project.status && (
          <span
            className={`absolute right-3 top-3 rounded-md border px-2 py-1 text-[10px] font-semibold leading-tight ${statusStyles[project.status.kind]}`}
          >
            {project.status.label}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <span className={`text-xs font-semibold tracking-wide ${accent.text}`}>
            {project.category}
          </span>
          {wholeCardLink && (
            <ArrowUpRight
              size={18}
              className="shrink-0 text-[var(--text-3)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-1)]"
            />
          )}
        </div>

        <h3 className="text-lg font-bold leading-snug text-[var(--text-1)]">{project.title}</h3>
        {project.subtitle && (
          <p className="mt-1 text-sm italic leading-snug text-[var(--text-3)]">{project.subtitle}</p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">{project.description}</p>

        {project.meta && project.meta.length > 0 && (
          <dl className="mt-4 space-y-2 border-t border-[var(--border-1)] pt-4">
            {project.meta.map((row) => (
              <div key={row.label} className="grid grid-cols-[4.25rem_1fr] gap-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-3)]">
                  {row.label}
                </dt>
                <dd className="text-sm leading-snug text-[var(--text-2)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-5 flex flex-1 flex-wrap content-start gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {buttons.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border-1)] pt-4">
            {buttons.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-1)] px-3 py-1.5 text-xs font-semibold text-[var(--text-1)] transition hover:border-brand-blue-500/60 hover:text-brand-blue-400"
              >
                {link.label}
                <ArrowUpRight size={13} />
              </a>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  )
}
