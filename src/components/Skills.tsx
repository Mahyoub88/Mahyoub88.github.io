import { useContent } from '../context/ContentContext'
import { getIcon } from '../data/icons'
import { Container } from './Container'

export function Skills() {
  const { content } = useContent()

  return (
    <section id="skills" className="py-20">
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">SKILLS</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">
          Specializations &amp; Tools
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--text-3)]">
              CORE SPECIALIZATIONS
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {content.specializations.map((item) => {
                const Icon = getIcon(item.icon)
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-500/10 text-brand-blue-400">
                      <Icon size={18} />
                    </span>
                    <span className="text-sm font-medium text-[var(--text-1)]">{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--text-3)]">
              TOOLS &amp; TECHNOLOGIES
            </h3>
            <div className="grid grid-cols-4 gap-4">
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
        </div>
      </Container>
    </section>
  )
}
