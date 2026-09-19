import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Experience() {
  const { content } = useContent()

  return (
    <section id="experience" className="bg-[var(--surface-1)] py-20">
      <Container>
        {/* Same two-column rail as About: the heading holds the left column so
            the timeline keeps a readable measure without leaving the right half
            of a wide screen empty. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold tracking-wider text-brand-blue-400">EXPERIENCE</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--text-1)]">
              Professional Experience
            </h2>
          </div>

          <ol className="space-y-12 border-l border-[var(--border-1)] pl-8">
            {content.experience.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[calc(2rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-blue-500 to-brand-purple-500" />

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <p className="text-xs font-semibold tracking-wide text-[var(--text-3)]">
                    {item.period}
                  </p>
                  {item.employmentType && (
                    <span className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--text-2)]">
                      {item.employmentType}
                    </span>
                  )}
                </div>

                <h3 className="mt-1.5 text-lg font-bold leading-snug text-[var(--text-1)]">
                  {item.role}
                </h3>
                <p className="text-sm font-medium text-brand-blue-400">
                  {item.company}
                  {item.location && <span className="text-[var(--text-3)]"> · {item.location}</span>}
                </p>

                {item.description && (
                  <p className="mt-3 max-w-[75ch] leading-relaxed text-[var(--text-2)]">
                    {item.description}
                  </p>
                )}

                {/* Two bullet columns on very wide screens: one long column
                    beside a sticky heading is what left the right side empty. */}
                {item.bullets && item.bullets.length > 0 && (
                  <ul className="mt-4 grid max-w-none gap-x-10 gap-y-2 xl:grid-cols-2">
                    {item.bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-sm leading-relaxed text-[var(--text-2)]">
                        <span
                          aria-hidden
                          className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-500/70"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--text-2)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
