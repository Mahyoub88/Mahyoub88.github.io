import { useEffect } from 'react'
import { useContent } from '../context/ContentContext'
import { siteSettings } from '../data/siteSettings'

export function SiteAppearance() {
  const { content } = useContent()
  useEffect(() => {
    const settings = siteSettings(content.siteSettings)
    const a = settings.appearance
    const style = document.createElement('style')
    // Only simple CSS colors are interpolated; arbitrary source editing lives in Pages & Files.
    const color = (value: string, fallback: string) => /^#[\da-f]{6}$/i.test(value) ? value : fallback
    style.textContent = `:root { --color-brand-blue-400:${color(a.accentBlue, '#5b9dff')}; --color-brand-blue-500:${color(a.accentBlue, '#3b82f6')}; --color-brand-purple-400:${color(a.accentPurple, '#c084fc')}; --color-brand-purple-500:${color(a.accentPurple, '#a855f7')}; --surface-0:${color(a.lightBackground, '#f5f7fb')}; --surface-1:${color(a.lightSurface, '#ffffff')}; } .dark { --surface-0:${color(a.darkBackground, '#05070d')}; --surface-1:${color(a.darkSurface, '#0a0e18')}; } @media(min-width:1024px){.career-highlights{grid-template-columns:repeat(${Math.max(1, Math.min(6, Number(a.statsColumns) || 4))},minmax(0,1fr));}}`
    document.head.appendChild(style)
    document.documentElement.style.setProperty('--font-sans', a.fontFamily)
    document.documentElement.lang = settings.seo.language
    return () => { style.remove(); document.documentElement.style.removeProperty('--font-sans') }
  }, [content.siteSettings])
  return null
}
