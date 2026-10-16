import type { SiteSettings } from '../types/content'

export const defaultSiteSettings: SiteSettings = {
  seo: {
    title: 'Mohammed Mahyoub | Senior ITS & Systems Integration Engineer',
    description: 'Senior ITS and Systems Integration Engineer with 14 years of engineering experience, including over 7 years at VITRONIC Machine Vision, specializing in traffic enforcement, smart infrastructure, LiDAR and applied AI.',
    socialTitle: 'Mohammed Mahyoub — Senior ITS & Systems Integration Engineer',
    socialDescription: '14 years of engineering experience, including over 7 years at VITRONIC Machine Vision. Engineering reliable traffic systems and applying computer vision to smarter mobility.',
    socialImage: '/social-preview.jpg', canonicalUrl: 'https://mahyoub88.github.io/', language: 'en', locale: 'en_US', favicon: '/favicon.svg', indexing: true,
  },
  appearance: { defaultTheme: 'dark', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif", accentBlue: '#5b9dff', accentPurple: '#c084fc', lightBackground: '#f5f7fb', darkBackground: '#05070d', lightSurface: '#ffffff', darkSurface: '#0a0e18', statsColumns: 4 },
  sections: ['hero', 'stats', 'about', 'experience', 'projects', 'articles', 'skills', 'education', 'certifications', 'contact'].map(id => ({ id: id as SiteSettings['sections'][number]['id'], visible: true })),
  labels: { articlesTitle: '', articlesSubtitle: '', skillsTitle: '', skillsSubtitle: '', educationTitle: '', certificationsTitle: '', experienceTitle: '', footerText: '' },
}
export function siteSettings(value?: Partial<SiteSettings>): SiteSettings {
  const incoming = value?.sections ?? []
  return { ...defaultSiteSettings, ...value,
    seo: { ...defaultSiteSettings.seo, ...value?.seo },
    appearance: { ...defaultSiteSettings.appearance, ...value?.appearance },
    labels: { ...defaultSiteSettings.labels, ...value?.labels },
    sections: [...incoming, ...defaultSiteSettings.sections.filter(section => !incoming.some(item => item.id === section.id))],
  }
}
