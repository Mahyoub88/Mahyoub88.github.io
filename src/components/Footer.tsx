import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Footer() {
  const { content } = useContent()
  const { resumeUrl, orcidUrl } = content.footerLinks

  const social = (type: string) => content.social.find((s) => s.type === type)?.url
  const linkedin = social('linkedin')
  const github = social('github')

  const links = [
    linkedin && { label: 'LinkedIn', url: linkedin },
    github && { label: 'GitHub', url: github },
    orcidUrl && { label: 'ORCID', url: orcidUrl },
    resumeUrl && { label: 'Download CV', url: resumeUrl },
  ].filter((l): l is { label: string; url: string } => Boolean(l))

  return (
    <footer className="border-t border-[var(--border-1)] py-10">
      <Container className="flex flex-col items-center justify-between gap-5 text-sm text-[var(--text-3)] sm:flex-row">
        <p>
          © {new Date().getFullYear()} {content.brand.name}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => {
            // The CV is a file, not a page — open it in a new tab and download.
            const isFile = !link.url.startsWith('http') || link.url.endsWith('.pdf')
            return (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                {...(isFile ? { download: '' } : {})}
                className="font-medium text-[var(--text-2)] transition hover:text-brand-blue-400"
              >
                {link.label}
              </a>
            )
          })}
        </div>
      </Container>
    </footer>
  )
}
