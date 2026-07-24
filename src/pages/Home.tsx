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

export function Home() {
  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <About />
        <FeaturedProjects />
        <Experience />
        <Skills />
        <Education />
        <Certifications />
        <Articles />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
