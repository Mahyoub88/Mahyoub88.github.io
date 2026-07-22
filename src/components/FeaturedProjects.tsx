import { ArrowUpRight } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'
import { ProjectCard } from './ProjectCard'

export function FeaturedProjects() {
  const { content } = useContent()

  return (
    <section id="work" className="py-20">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--text-1)]">
              {content.projectsTitle}
            </h2>
            <p className="mt-2 text-[var(--text-2)]">{content.projectsSubtitle}</p>
          </div>
          {content.projectsCtaHref && (
            <a
              href={content.projectsCtaHref}
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue-400 hover:text-brand-blue-500"
            >
              {content.projectsCtaLabel}
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Container>
    </section>
  )
}
