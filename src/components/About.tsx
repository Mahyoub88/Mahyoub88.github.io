import { Network, Wrench, BrainCircuit } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

const cardIcons = [Network, Wrench, BrainCircuit]

export function About() {
  const { content } = useContent()
  const { about } = content
  const cards = about.cards ?? []

  return (
    <section id="about" className="py-24">
      <Container className="max-w-4xl">
        {/* Heading and body share one measure so the column has a single right
            edge — a full-width heading over a 68ch body reads as a gap. */}
        <div className="max-w-[68ch]">
          <p className="text-xs font-semibold tracking-wider text-brand-blue-400">ABOUT</p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--text-1)]">
            {about.heading}
          </h2>
          {about.subheading && <p className="mt-3 text-[var(--text-2)]">{about.subheading}</p>}

          <div className="mt-8 space-y-5">
            {about.paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-[var(--text-2)]">
                {p}
              </p>
            ))}
          </div>
        </div>

        {cards.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {cards.map((card, i) => {
              const Icon = cardIcons[i % cardIcons.length]
              return (
                <div
                  key={card.id}
                  className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-5 shadow-[var(--shadow-card)]"
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
