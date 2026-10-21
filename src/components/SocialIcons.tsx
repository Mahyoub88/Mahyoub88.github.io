import { Mail, Link2 } from 'lucide-react'
import type { SocialLink } from '../types/content'
import { openMail } from './openMail'
import { FacebookIcon, GitHubIcon, LinkedInIcon, OrcidIcon, XIcon } from './BrandIcons'

const iconFor = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  orcid: OrcidIcon,
  email: Mail,
  twitter: XIcon,
  facebook: FacebookIcon,
  bluesky: Link2,
  other: Link2,
}

export function SocialIcons({
  links,
  className = '',
}: {
  links: SocialLink[]
  className?: string
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.map((link) => {
        const Icon = iconFor[link.type] ?? Link2
        const box =
          'flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] text-[var(--text-2)] transition hover:border-brand-blue-500/60 hover:text-brand-blue-400'
        if (link.type === 'email') {
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => openMail(link.url.replace(/^mailto:/, ''))}
              aria-label="Email"
              className={box}
            >
              <Icon size={18} />
            </button>
          )
        }
        return (
          <a
            key={link.id}
            href={link.url || '#'}
            target="_blank"
            rel="noreferrer"
            aria-label={link.type}
            className={box}
          >
            <Icon size={18} />
          </a>
        )
      })}
    </div>
  )
}
