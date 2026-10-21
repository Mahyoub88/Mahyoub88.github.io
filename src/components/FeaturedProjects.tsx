import { ChevronDown } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'
import { ProjectCard } from './ProjectCard'

export function FeaturedProjects() {
  const { content } = useContent()

  // Anything not explicitly marked "earlier" is headline work, so older content
  // written before the group field existed keeps its place.
  const selected = content.projects.filter((p) => p.group !== 'earlier')
  const earlier = content.projects.filter((p) => p.group === 'earlier')

  return (
    <section id="work" className="py-20">
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">SELECTED WORK</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">
          {content.projectsTitle}
        </h2>
        {content.projectsSubtitle && (
          <p className="mt-3 max-w-2xl text-[var(--text-2)]">{content.projectsSubtitle}</p>
        )}
        <a href="/projects/" className="mt-5 inline-flex rounded-lg border border-[var(--border-1)] px-4 py-2 text-sm font-semibold text-brand-blue-400">
          Browse all case studies →
        </a>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selected.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {earlier.length > 0 && (
          <details className="group mt-16 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-lg font-bold text-[var(--text-1)]">
                  More work ({earlier.length})
                </span>
                <span className="mt-1 block max-w-2xl text-sm text-[var(--text-3)]">
                  Completed work across communications, infrastructure, software, embedded systems and automation.
                </span>
              </span>
              <ChevronDown
                size={20}
                aria-hidden="true"
                className="shrink-0 text-brand-blue-400 transition group-open:rotate-180"
              />
            </summary>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {earlier.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </details>
        )}
        <nav aria-label="Related project collections" className="mt-10 flex flex-wrap gap-4 text-sm text-[var(--text-3)]">
          <a id="proj-monitoring-apps" className="scroll-mt-24" href="/projects/proj-engineering-operations/">Engineering operations suite</a>
          <a id="proj-rf-network" className="scroll-mt-24" href="/projects/proj-rf-network/">Network engineering collection</a>
        </nav>
      </Container>
    </section>
  )
}
