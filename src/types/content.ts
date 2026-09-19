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

/** Where a card is shown: the headline grid, or the de-emphasised earlier work. */
export type ProjectGroup = 'selected' | 'earlier'

/** Drives the badge colour. Keep these honest — they set the reader's expectations. */
export type ProjectStatusKind = 'public' | 'academic' | 'professional'

export interface ProjectStatus {
  kind: ProjectStatusKind
  label: string
}

export interface ProjectLink {
  label: string
  href: string
}

/** A Problem / Role / Method / Result row. Omit a row rather than inventing one. */
export interface ProjectMeta {
  label: string
  value: string
}

export interface Project {
  id: string
  category: string
  title: string
  description: string
  tags: string[]
  link: string
  accent: ProjectAccent
  subtitle?: string
  status?: ProjectStatus
  links?: ProjectLink[]
  meta?: ProjectMeta[]
  group?: ProjectGroup
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
  currentFocus: string[]
}

export interface BrandContent {
  name: string
  title: string
  logoInitial: string
}

export interface AboutCard {
  id: string
  title: string
  description: string
}

export interface AboutContent {
  heading: string
  subheading: string
  paragraphs: string[]
  cards?: AboutCard[]
}

export interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  description: string
  tags: string[]
  location?: string
  /** Shown as a chip beside the period, e.g. "Part-time / Project-based". */
  employmentType?: string
  bullets?: string[]
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

export interface ExpertiseCategory {
  id: string
  category: string
  items: string[]
}

export interface EducationItem {
  id: string
  degree: string
  institution: string
  period: string
  status: string
  description?: string
  /** "Selected work" bullets under a degree. */
  highlights?: string[]
  /** A short footnote, e.g. a degree-equivalency statement. */
  note?: string
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  type: string
}

export interface FooterLinks {
  resumeUrl: string
  orcidUrl: string
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
  technicalExpertise: ExpertiseCategory[]
  education: EducationItem[]
  certifications: CertificationItem[]
  projectsTitle: string
  projectsSubtitle: string
  projectsCtaLabel: string
  projectsCtaHref: string
  projects: Project[]
  articles: ArticleItem[]
  contact: ContactContent
  social: SocialLink[]
  footerLinks: FooterLinks
}
