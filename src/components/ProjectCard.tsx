import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../types/content'

const accentStyles: Record<Project['accent'], { text: string; gradient: string; ring: string }> = {
  blue: {
    text: 'text-brand-blue-400',
    gradient: 'from-brand-blue-500/25 via-brand-blue-500/5 to-transparent',
    ring: 'group-hover:border-brand-blue-500/50',
  },
  purple: {
    text: 'text-brand-purple-400',
    gradient: 'from-brand-purple-500/25 via-brand-purple-500/5 to-transparent',
    ring: 'group-hover:border-brand-purple-500/50',
  },
  amber: {
    text: 'text-brand-amber-400',
    gradient: 'from-brand-amber-400/25 via-brand-amber-400/5 to-transparent',
    ring: 'group-hover:border-brand-amber-400/50',
  },
}

export function ProjectCard({ project }: { project: Project }) {
  const accent = accentStyles[project.accent]
  const hasLink = Boolean(project.link)
  const Wrapper = hasLink ? 'a' : 'div'

  return (
    <Wrapper
      {...(hasLink ? { href: project.link, target: '_blank', rel: 'noreferrer' } : {})}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] shadow-[var(--shadow-card)] transition ${accent.ring}`}
    >
      <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${accent.gradient}`}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,var(--border-2)_1px,transparent_0)] [background-size:16px_16px]"
        />
        <span className={`relative text-4xl font-black tracking-tight opacity-20 ${accent.text}`}>
          {project.category.slice(0, 2).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className={`text-xs font-semibold tracking-wide ${accent.text}`}>
            {project.category}
          </span>
          {hasLink && (
            <ArrowUpRight
              size={18}
              className="text-[var(--text-3)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-1)]"
            />
          )}
        </div>
        <h3 className="text-lg font-bold text-[var(--text-1)]">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-2)]">
          {project.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Wrapper>
  )
}
