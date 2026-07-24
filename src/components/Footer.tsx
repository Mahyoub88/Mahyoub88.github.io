import { useContent } from '../context/ContentContext'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

export function Footer() {
  const { content } = useContent()
  const { resumeUrl, orcidUrl } = content.footerLinks

  const links = [
    resumeUrl && { label: 'Resume', url: resumeUrl },
    orcidUrl && { label: 'ORCID', url: orcidUrl },
  ].filter((l): l is { label: string; url: string } => Boolean(l))

  return (
    <footer className="border-t border-[var(--border-1)] py-8">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-[var(--text-3)] sm:flex-row">
        <p>
          © {new Date().getFullYear()} {content.brand.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--text-2)] transition hover:text-brand-blue-400"
            >
              {link.label}
            </a>
          ))}
          <SocialIcons links={content.social} />
        </div>
      </Container>
    </footer>
  )
}
