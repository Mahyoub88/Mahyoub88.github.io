import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Skills() {
  const { content } = useContent()

  return (
    <section id="skills" className="py-20">
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">SKILLS</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">Tools &amp; Technologies</h2>

        <div className="mt-10 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]">
          <div className="grid grid-cols-4 gap-6 sm:grid-cols-6 lg:grid-cols-8">
            {content.tools.map((tool) => (
              <div key={tool.id} className="flex flex-col items-center gap-2" title={tool.label}>
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold"
                  style={{ backgroundColor: `${tool.color}26`, color: tool.color }}
                >
                  {tool.abbr}
                </span>
                <span className="text-center text-xs text-[var(--text-3)]">{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
