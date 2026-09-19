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

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selected.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {earlier.length > 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-bold text-[var(--text-1)]">Earlier Engineering Work</h3>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-3)]">
              Foundational engineering work that predates the current ITS and applied-AI focus.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {earlier.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
