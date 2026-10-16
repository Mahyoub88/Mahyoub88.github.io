export function validateContent(value: unknown): string[] {
  const errors: string[] = []
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Content must be an object.']
  const content = value as Record<string, unknown>
  const record = (item: unknown): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item)
  const fields = (item: unknown, keys: string[], path: string) => {
    if (!record(item)) { errors.push(`${path} must be an object.`); return }
    for (const key of keys) if (typeof item[key] !== 'string') errors.push(`${path}.${key} must be text.`)
  }
  fields(content.brand, ['name', 'title', 'logoInitial'], 'brand')
  fields(content.hero, ['badge', 'greetingName', 'tagline', 'description', 'photoUrl', 'backgroundUrl'], 'hero')
  if (record(content.hero)) {
    for (const key of ['primaryCta', 'secondaryCta', 'tertiaryCta']) fields(content.hero[key], ['label', 'href'], `hero.${key}`)
    if (!Array.isArray(content.hero.currentFocus) || !content.hero.currentFocus.every(item => typeof item === 'string')) errors.push('hero.currentFocus must be a list of text.')
  }
  fields(content.about, ['heading', 'subheading'], 'about')
  if (record(content.about) && (!Array.isArray(content.about.paragraphs) || !content.about.paragraphs.every(item => typeof item === 'string'))) errors.push('about.paragraphs must be a list of text.')
  fields(content.contact, ['heading', 'subheading', 'email', 'location'], 'contact')
  fields(content.footerLinks, ['resumeUrl', 'orcidUrl'], 'footerLinks')
  const itemFields: Record<string, string[]> = { nav: ['label', 'href'], social: ['type', 'url'], specializations: ['icon', 'label'], tools: ['label', 'abbr', 'color'], stats: ['icon', 'value', 'label'], experience: ['role', 'company', 'period', 'description'], technicalExpertise: ['category'], education: ['degree', 'institution', 'period', 'status'], certifications: ['name', 'issuer', 'date', 'type'], articles: ['title', 'excerpt', 'date', 'url'] }
  for (const [key, keys] of Object.entries(itemFields)) if (Array.isArray(content[key])) (content[key] as unknown[]).forEach((item, index) => fields(item, keys, `${key}[${index}]`))
  const strings = (value: unknown) => Array.isArray(value) && value.every(item => typeof item === 'string')
  if (Array.isArray(content.technicalExpertise)) for (const item of content.technicalExpertise) if (!record(item) || !strings(item.items)) errors.push('Technical expertise items must be a list of text.')
  if (Array.isArray(content.experience)) for (const item of content.experience) {
    if (!record(item)) continue
    if (!strings(item.tags)) errors.push('Experience tags must be a list of text.')
    for (const key of ['bullets', 'projectIds']) if (item[key] !== undefined && !strings(item[key])) errors.push(`Experience ${key} must be a list of text.`)
    if (item.roles !== undefined) {
      if (!Array.isArray(item.roles)) errors.push('Experience roles must be a list.')
      else item.roles.forEach(role => fields(role, ['title', 'period', 'description'], 'experience.roles'))
    }
  }
  if (Array.isArray(content.education)) for (const item of content.education) {
    if (!record(item)) continue
    if (item.highlights !== undefined && !strings(item.highlights)) errors.push('Education highlights must be a list of text.')
    if (item.document !== undefined) fields(item.document, ['title', 'image', 'issuer'], 'education.document')
  }
  if (content.siteSettings !== undefined) {
    if (!record(content.siteSettings)) errors.push('siteSettings must be an object.')
    else {
      const settings = content.siteSettings
      fields(settings.seo, ['title', 'description', 'socialTitle', 'socialDescription', 'socialImage', 'canonicalUrl', 'language', 'locale', 'favicon'], 'siteSettings.seo')
      fields(settings.appearance, ['defaultTheme', 'fontFamily', 'accentBlue', 'accentPurple', 'lightBackground', 'darkBackground', 'lightSurface', 'darkSurface'], 'siteSettings.appearance')
      fields(settings.labels, ['articlesTitle', 'articlesSubtitle', 'skillsTitle', 'skillsSubtitle', 'educationTitle', 'certificationsTitle', 'experienceTitle', 'footerText'], 'siteSettings.labels')
      if (record(settings.appearance) && (!['dark', 'light', 'system'].includes(String(settings.appearance.defaultTheme)) || !Number.isInteger(settings.appearance.statsColumns) || Number(settings.appearance.statsColumns) < 1 || Number(settings.appearance.statsColumns) > 6)) errors.push('Choose a valid default theme and between 1 and 6 columns.')
      if (record(settings.seo)) {
        if (typeof settings.seo.indexing !== 'boolean') errors.push('Search indexing must be a boolean.')
        try { if (!['https:', 'http:'].includes(new URL(String(settings.seo.canonicalUrl)).protocol)) throw new Error() } catch { errors.push('Canonical URL must use http(s).') }
      }
      const sectionIds = new Set(['hero', 'stats', 'about', 'experience', 'projects', 'articles', 'skills', 'education', 'certifications', 'contact'])
      if (!Array.isArray(settings.sections) || settings.sections.length !== sectionIds.size) errors.push('Keep every homepage section exactly once; use visibility to hide it.')
      else for (const section of settings.sections) {
        if (!record(section) || !sectionIds.delete(String(section.id)) || typeof section.visible !== 'boolean') errors.push('Invalid or duplicate homepage section.')
      }
    }
  }
  for (const key of ['brand', 'hero', 'about', 'contact', 'footerLinks']) {
    if (!content[key] || typeof content[key] !== 'object' || Array.isArray(content[key])) errors.push(`${key} must be an object.`)
  }
  for (const key of ['nav', 'social', 'specializations', 'tools', 'stats', 'experience', 'technicalExpertise', 'education', 'certifications', 'projects', 'articles']) {
    if (!Array.isArray(content[key])) errors.push(`${key} must be a list.`)
    else {
      const ids = new Set<string>()
      for (const item of content[key] as Record<string, unknown>[]) {
        if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id) { errors.push(`${key}: every item needs an ID.`); continue }
        if (ids.has(item.id)) errors.push(`${key}: duplicate ID ${item.id}.`)
        ids.add(item.id)
      }
    }
  }
  for (const key of ['projectsTitle', 'projectsSubtitle', 'projectsCtaLabel', 'projectsCtaHref']) if (typeof content[key] !== 'string') errors.push(`${key} must be text.`)
  if (Array.isArray(content.projects)) for (const project of content.projects as Record<string, unknown>[]) {
    if (!project || typeof project !== 'object') continue
    if (typeof project.id !== 'string' || !/^proj-[a-z0-9-]+$/.test(project.id)) errors.push('Project IDs must use proj- followed by lowercase letters, digits or hyphens.')
    for (const key of ['title', 'description', 'category', 'image', 'imageAlt', 'imageCaption', 'coverImage', 'coverLightImage', 'coverAlt', 'coverCaption']) if (typeof project[key] !== 'string' || !String(project[key]).trim()) errors.push(`${project.id}: ${key} is required.`)
    if (!Array.isArray(project.tags) || !Array.isArray(project.links) || !Array.isArray(project.meta)) errors.push(`${project.id}: tags, links and meta must be lists.`)
    if (!strings(project.tags)) errors.push(`${project.id}: tags must contain text.`)
    if (Array.isArray(project.links)) project.links.forEach(link => fields(link, ['label', 'href'], 'project.links'))
    if (Array.isArray(project.meta)) project.meta.forEach(meta => fields(meta, ['label', 'value'], 'project.meta'))
    if (!project.status || typeof (project.status as Record<string, unknown>).label !== 'string') errors.push(`${project.id}: status is required.`)
  }
  // Prevent accidentally importing executable URL schemes into public links and images.
  const visit = (item: unknown, path = '') => {
    if (typeof item === 'string' && /^\s*(javascript|vbscript|data):/i.test(item)) errors.push(`${path}: use a local path or an http(s) URL.`)
    else if (Array.isArray(item)) item.forEach((entry, index) => visit(entry, `${path}[${index}]`))
    else if (item && typeof item === 'object') Object.entries(item).forEach(([key, entry]) => visit(entry, `${path}.${key}`))
  }
  visit(content)
  return errors
}
