import { Fragment, useEffect } from 'react'
import { useContent } from '../context/ContentContext'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { StatsBar } from '../components/StatsBar'
import { FeaturedProjects } from '../components/FeaturedProjects'
import { About } from '../components/About'
import { Experience } from '../components/Experience'
import { Skills } from '../components/Skills'
import { Education } from '../components/Education'
import { Certifications } from '../components/Certifications'
import { Articles } from '../components/Articles'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { siteSettings } from '../data/siteSettings'

export function Home() {
  const { content } = useContent()
  const settings = siteSettings(content.siteSettings)
  const sections = { hero: <Hero />, stats: <StatsBar />, about: <About />, experience: <Experience />, projects: <FeaturedProjects />, articles: <Articles />, skills: <Skills />, education: <Education />, certifications: <Certifications />, contact: <Contact /> }

  useEffect(() => {
    document.title = content.siteSettings?.seo.title || `${content.brand.name} | ${content.brand.title}`
    const seo = siteSettings(content.siteSettings).seo
    const metas: Record<string, string> = { description: seo.description, 'og:title': seo.socialTitle, 'og:description': seo.socialDescription, 'og:image': new URL(seo.socialImage, seo.canonicalUrl).href, 'twitter:title': seo.socialTitle, 'twitter:description': seo.socialDescription, 'twitter:image': new URL(seo.socialImage, seo.canonicalUrl).href }
    for (const [key, value] of Object.entries(metas)) document.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.setAttribute('content', value)
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', seo.canonicalUrl)
    document.querySelector('link[rel="icon"]')?.setAttribute('href', seo.favicon)
  }, [content.brand.name, content.brand.title, content.siteSettings])

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  return (
    <div className="portfolio-site min-h-screen bg-[var(--surface-0)]">
      <Header />
      <main>
        {/* Order mirrors the nav: Home, About, Experience, Selected Work,
            Research, Skills, Education, then credentials and contact. */}
        {settings.sections.filter(section => section.visible).map(section => <Fragment key={section.id}>{sections[section.id]}</Fragment>)}
      </main>
      <Footer />
    </div>
  )
}
