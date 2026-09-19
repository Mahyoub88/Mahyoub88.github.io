import { GraduationCap } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Education() {
  const { content } = useContent()
  if (content.education.length === 0) return null

  return (
    <section
      id="education"
      className="border-y border-[var(--border-1)] bg-[var(--surface-1)] py-20"
    >
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">EDUCATION</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">Education</h2>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {content.education.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-0)] p-6 shadow-[var(--shadow-card)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-500/10 text-brand-blue-400">
                <GraduationCap size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-bold leading-snug text-[var(--text-1)]">
                    {item.degree}
                  </h3>
                  {item.status && (
                    <span className="shrink-0 rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]">
                      {item.status}
                    </span>
                  )}
                </div>
                {item.institution && (
                  <p className="mt-1 text-sm font-medium text-brand-blue-400">{item.institution}</p>
                )}
                {item.period && (
                  <p className="mt-1 text-xs font-semibold tracking-wide text-[var(--text-3)]">
                    {item.period}
                  </p>
                )}
                {item.description && (
                  <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-[var(--text-2)]">
                    {item.description}
                  </p>
                )}

                {item.highlights && item.highlights.length > 0 && (
                  <>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
                      Selected work
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {item.note && (
                  <p className="mt-4 text-xs italic text-[var(--text-3)]">{item.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
