import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Skills() {
  const { content } = useContent()
  const toolGroups = [...content.tools.reduce((map, tool) => map.set(tool.group ?? '', [...(map.get(tool.group ?? '') ?? []), tool]), new Map<string, typeof content.tools>())]

  return (
    <section id="skills" className="pb-14 pt-20">
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">SKILLS</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">{content.siteSettings?.labels.skillsTitle || <>Technical Expertise</>}</h2>

        {content.siteSettings?.labels.skillsSubtitle && <p className="mt-3 text-sm">{content.siteSettings.labels.skillsSubtitle}</p>}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {content.technicalExpertise.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]"
            >
              <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--text-3)]">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {content.tools.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {toolGroups.map(([heading, tools]) => (
              <div key={heading} className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]">
                {heading && (
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-3)]">{heading}</h3>
                )}
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {tools.map((tool) => (
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
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
