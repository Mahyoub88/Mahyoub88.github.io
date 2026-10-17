export interface NavLink {
  id: string
  label: string
  href: string
}

export interface SocialLink {
  id: string
  type: 'github' | 'linkedin' | 'orcid' | 'email' | 'twitter' | 'facebook' | 'other'
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
  /** Heading of the card this badge is shown in; badges with no group share one card. */
  group?: string
}

export interface Stat {
  id: string
  icon: string
  value: string
  label: string
  detail?: string
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
  coverImage?: string
  coverLightImage?: string
  coverAlt?: string
  coverCaption?: string
  image?: string
  imageAlt?: string
  imageCaption?: string
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
  projectIds?: string[]
  roles?: { title: string; period: string; description: string; bullets?: string[] }[]
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
  document?: { title: string; image: string; issuer: string; date?: string }
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
  image?: string
  description?: string
  credentialUrl?: string
  sourceUrl?: string
  validUntil?: string
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
  siteSettings?: SiteSettings
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

export type HomeSection = 'hero' | 'stats' | 'about' | 'experience' | 'projects' | 'articles' | 'skills' | 'education' | 'certifications' | 'contact'
export interface SiteSettings {
  seo: { title: string; description: string; socialTitle: string; socialDescription: string; socialImage: string; canonicalUrl: string; language: string; locale: string; favicon: string; indexing: boolean }
  appearance: { defaultTheme: 'dark' | 'light' | 'system'; fontFamily: string; accentBlue: string; accentPurple: string; lightBackground: string; darkBackground: string; lightSurface: string; darkSurface: string; statsColumns: number }
  sections: { id: HomeSection; visible: boolean }[]
  labels: { articlesTitle: string; articlesSubtitle: string; skillsTitle: string; skillsSubtitle: string; educationTitle: string; certificationsTitle: string; experienceTitle: string; footerText: string }
}
