import { Mail, MapPin, Send } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

export function Contact() {
  const { content } = useContent()
  const { contact } = content

  return (
    <section id="contact" className="py-20">
      <Container>
        {/* The same two-column rail the rest of the page uses, so the closing
            section sits on the page's grid instead of as a narrow island. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="text-xs font-semibold tracking-wider text-brand-blue-400">CONTACT</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--text-1)] sm:text-4xl">
              {contact.heading}
            </h2>
          </div>

          <div>
            <p className="max-w-[68ch] leading-relaxed text-[var(--text-2)]">
              {contact.subheading}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-1)] px-6 py-5 shadow-[var(--shadow-card)]">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-[var(--text-2)] transition hover:text-brand-blue-400"
              >
                <Mail size={16} className="text-brand-blue-400" />
                {contact.email}
              </a>
              {contact.location && (
                <span className="flex items-center gap-2 text-sm text-[var(--text-2)]">
                  <MapPin size={16} className="text-brand-purple-400" />
                  {contact.location}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-blue-500/25 transition hover:brightness-110"
              >
                <Send size={16} />
                Send a Message
              </a>
              <SocialIcons links={content.social} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
