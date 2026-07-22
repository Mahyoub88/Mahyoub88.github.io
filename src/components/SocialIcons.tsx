import { Mail, Link2 } from 'lucide-react'
import type { SocialLink } from '../types/content'
import { GitHubIcon, LinkedInIcon, XIcon } from './BrandIcons'

const iconFor = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: Mail,
  twitter: XIcon,
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
        return (
          <a
            key={link.id}
            href={link.url || '#'}
            target={link.type === 'email' ? undefined : '_blank'}
            rel="noreferrer"
            aria-label={link.type}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-1)] bg-[var(--surface-2)] text-[var(--text-2)] transition hover:border-brand-blue-500/60 hover:text-brand-blue-400"
          >
            <Icon size={18} />
          </a>
        )
      })}
    </div>
  )
}
