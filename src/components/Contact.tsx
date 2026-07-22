import { Mail, MapPin, Send } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

export function Contact() {
  const { content } = useContent()
  const { contact } = content

  return (
    <section id="contact" className="py-20">
      <Container className="max-w-3xl text-center">
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">CONTACT</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)] sm:text-4xl">
          {contact.heading}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--text-2)]">{contact.subheading}</p>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] p-6 shadow-[var(--shadow-card)] sm:flex-row sm:justify-center">
          <span className="flex items-center gap-2 text-sm text-[var(--text-2)]">
            <Mail size={16} className="text-brand-blue-400" />
            {contact.email}
          </span>
          <span className="hidden h-4 w-px bg-[var(--border-1)] sm:block" />
          <span className="flex items-center gap-2 text-sm text-[var(--text-2)]">
            <MapPin size={16} className="text-brand-purple-400" />
            {contact.location}
          </span>
        </div>

        <a
          href={`mailto:${contact.email}`}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:brightness-110"
        >
          <Send size={16} />
          Send a Message
        </a>

        <SocialIcons links={content.social} className="mt-8 justify-center" />
      </Container>
    </section>
  )
}
