import { Network, Wrench, BrainCircuit } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

const cardIcons = [Network, Wrench, BrainCircuit]

export function About() {
  const { content } = useContent()
  const { about } = content
  const cards = about.cards ?? []

  return (
    <section id="about" className="py-20">
      <Container>
        {/* Two columns on wide screens: the heading takes the left rail, the
            prose the right. Body text has to stay near 70ch to stay readable,
            so stretching it across a wide viewport is not an option — giving
            the heading its own column is what puts that space to work. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold tracking-wider text-brand-blue-400">ABOUT</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--text-1)]">
              {about.heading}
            </h2>
            {about.subheading && <p className="mt-3 text-[var(--text-2)]">{about.subheading}</p>}
          </div>

          <div className="max-w-[74ch] space-y-5">
            {about.paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-[var(--text-2)]">
                {p}
              </p>
            ))}
          </div>
        </div>

        {cards.length > 0 && (
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {cards.map((card, i) => {
              const Icon = cardIcons[i % cardIcons.length]
              return (
                <div
                  key={card.id}
                  className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue-500/10 text-brand-blue-400">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-[var(--text-1)]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Container>
    </section>
  )
}
