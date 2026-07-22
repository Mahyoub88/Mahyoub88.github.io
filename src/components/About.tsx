import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function About() {
  const { content } = useContent()
  const { about } = content

  return (
    <section id="about" className="py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">ABOUT</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">{about.heading}</h2>
        <p className="mt-2 text-[var(--text-2)]">{about.subheading}</p>

        <div className="mt-8 space-y-5">
          {about.paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-[var(--text-2)]">
              {p}
            </p>
          ))}
        </div>
      </Container>
    </section>
  )
}
