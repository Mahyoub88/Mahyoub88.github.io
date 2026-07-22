export interface NavLink {
  id: string
  label: string
  href: string
}

export interface SocialLink {
  id: string
  type: 'github' | 'linkedin' | 'email' | 'twitter' | 'other'
  url: string
}

export interface IconItem {
  id: string
  icon: string
  label: string
}

export interface ToolBadge {
  id: string
  label: string
  abbr: string
  color: string
}

export interface Stat {
  id: string
  icon: string
  value: string
  label: string
}

export type ProjectAccent = 'blue' | 'purple' | 'amber'

export interface Project {
  id: string
  category: string
  title: string
  description: string
  tags: string[]
  link: string
  accent: ProjectAccent
}

export interface CtaLink {
  label: string
  href: string
}

export interface HeroContent {
  badge: string
  greetingName: string
  tagline: string
  description: string
  primaryCta: CtaLink
  secondaryCta: CtaLink
  tertiaryCta: CtaLink
  photoUrl: string
  backgroundUrl: string
}

export interface BrandContent {
  name: string
  title: string
  logoInitial: string
}

export interface AboutContent {
  heading: string
  subheading: string
  paragraphs: string[]
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  description: string
  tags: string[]
}

export interface ArticleItem {
  id: string
  title: string
  excerpt: string
  date: string
  url: string
}

export interface ContactContent {
  heading: string
  subheading: string
  email: string
  location: string
}

export interface SiteContent {
  brand: BrandContent
  nav: NavLink[]
  hero: HeroContent
  specializations: IconItem[]
  tools: ToolBadge[]
  stats: Stat[]
  about: AboutContent
  experience: ExperienceItem[]
  projectsTitle: string
  projectsSubtitle: string
  projectsCtaLabel: string
  projectsCtaHref: string
  projects: Project[]
  articles: ArticleItem[]
  contact: ContactContent
  social: SocialLink[]
}
