import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Experience() {
  const { content } = useContent()

  return (
    <section id="experience" className="bg-[var(--surface-1)] py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">EXPERIENCE</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">Where I've Worked</h2>

        <ol className="mt-10 space-y-10 border-l border-[var(--border-1)] pl-8">
          {content.experience.map((item) => (
            <li key={item.id} className="relative">
              <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-blue-500 to-brand-purple-500" />
              <p className="text-xs font-semibold tracking-wide text-[var(--text-3)]">
                {item.period}
              </p>
              <h3 className="mt-1 text-lg font-bold text-[var(--text-1)]">{item.role}</h3>
              <p className="text-sm font-medium text-brand-blue-400">{item.company}</p>
              <p className="mt-2 leading-relaxed text-[var(--text-2)]">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
