import { GraduationCap } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Education() {
  const { content } = useContent()
  if (content.education.length === 0) return null

  return (
    <section id="education" className="py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">EDUCATION</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">Education</h2>

        <div className="mt-10 space-y-4">
          {content.education.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-500/10 text-brand-blue-400">
                <GraduationCap size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-[var(--text-1)]">{item.degree}</h3>
                  {item.status && (
                    <span className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]">
                      {item.status}
                    </span>
                  )}
                </div>
                {item.institution && (
                  <p className="mt-1 text-sm font-medium text-brand-blue-400">
                    {item.institution}
                  </p>
                )}
                {item.period && (
                  <p className="mt-1 text-xs font-semibold tracking-wide text-[var(--text-3)]">
                    {item.period}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
