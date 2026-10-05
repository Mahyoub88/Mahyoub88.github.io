import { BrainCircuit, CircuitBoard, GraduationCap } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Education() {
  const { content } = useContent()
  if (content.education.length === 0) return null

  return (
    <section
      id="education"
      className="scroll-mt-24 border-y border-[var(--border-1)] bg-[var(--surface-1)] py-20"
    >
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">EDUCATION</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">Education</h2>

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {content.education.map((item) => (
            <article
              key={item.id}
              className="flex overflow-hidden rounded-2xl border border-[var(--border-1)] bg-[var(--surface-0)] shadow-[var(--shadow-card)] transition hover:border-brand-blue-400/40"
            >
              <div className="flex w-16 shrink-0 flex-col items-center justify-center gap-4 border-r border-[var(--border-1)] bg-gradient-to-br from-brand-blue-500/10 to-brand-purple-500/10 px-2 py-5 text-brand-blue-400 sm:w-28">
                {item.degree.startsWith('MSc') ? <BrainCircuit size={36} strokeWidth={1.3} aria-hidden /> : <CircuitBoard size={36} strokeWidth={1.3} aria-hidden />}
                <GraduationCap size={20} strokeWidth={1.5} aria-hidden />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.degree.split(' ')[0]}</span>
              </div>
              <div className="min-w-0 flex-1 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-bold leading-snug text-[var(--text-1)]">
                    {item.degree}
                  </h3>
                  {item.status && (
                    <span className="rounded-md border border-brand-blue-400/20 bg-brand-blue-400/10 px-2 py-1 text-[10px] font-semibold text-brand-blue-400">
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
                  <details className="mt-4 border-t border-[var(--border-1)] pt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-blue-400">
                      Selected work
                    </summary>
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
                  </details>
                )}

                {item.note && (
                  <p className="mt-4 text-xs italic text-[var(--text-3)]">{item.note}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
