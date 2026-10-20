import { Download, Send, LayoutGrid, UserRound, ArrowUpRight } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { getIcon } from '../data/icons'
import { Container } from './Container'
import { SocialIcons } from './SocialIcons'

const isFileLink = (href: string) => !href.startsWith('#')
function ctaIcon(href: string) {
  if (isFileLink(href)) return Download
  return href.startsWith('#contact') ? Send : LayoutGrid
}
const fileLinkProps = (href: string) => isFileLink(href)
  ? { target: '_blank', rel: 'noopener noreferrer', download: '' } : {}

export function Hero() {
  const { content } = useContent()
  const { hero, specializations } = content
  const intro = hero.description.split(/\n\s*\n/).filter(p => p.trim())
  const actions = [hero.primaryCta, hero.secondaryCta, hero.tertiaryCta]
  return (
    <section id="home" className="engineering-hero relative isolate overflow-hidden">
      {hero.backgroundUrl && <div aria-hidden="true" className="hero-background" style={{ backgroundImage: `url(${hero.backgroundUrl})` }} />}
      <div aria-hidden="true" className="blueprint-grid" />
      <Container>
        <div className="hero-layout">
          <div className="hero-copy">
            <span className="hero-eyebrow"><span aria-hidden="true" className="signal-dot" />{hero.badge}</span>
            <h1 className="hero-name">{hero.greetingName}</h1>
            <h2 className="hero-headline">{hero.tagline}</h2>
            <p className="hero-intro">{intro[0]}</p>
            {intro.length > 1 && <details className="hero-more">
              <summary>My integration approach <ArrowUpRight size={14} aria-hidden="true" /></summary>
              {intro.slice(1).map((p, i) => <p key={i}>{p}</p>)}
            </details>}
            <div className="hero-actions">
              {actions.map((action, i) => {
                const Icon = ctaIcon(action.href)
                return <a key={i} href={action.href} {...fileLinkProps(action.href)} className={`hero-action ${i === 0 ? 'hero-action-primary' : ''}`}>
                  <Icon size={16} aria-hidden="true" />{action.label}
                </a>
              })}
            </div>
            <SocialIcons links={content.social} className="mt-7" />
          </div>
          <div className="hero-visual">
            <div className="portrait-frame">
              <div aria-hidden="true" className="portrait-crosshair crosshair-top" />
              <div aria-hidden="true" className="portrait-crosshair crosshair-bottom" />
              {hero.photoUrl ? <img src={hero.photoUrl} alt={hero.greetingName} fetchPriority="high" width="640" height="800" className="hero-portrait" /> : <UserRound size={96} className="m-auto text-[var(--text-3)]" />}
              <div className="portrait-caption"><span>ENGINEERING / SYSTEMS / INTELLIGENCE</span><span aria-hidden="true">↗</span></div>
            </div>
            <div className="focus-panel">
              <p className="technical-label"><span aria-hidden="true">01 /</span> CURRENT FOCUS</p>
              {(hero.currentFocus ?? []).map((item, i) => <p className="focus-item" key={i}><span aria-hidden="true">0{i + 1}</span>{item}</p>)}
            </div>
          </div>
        </div>
        <div className="expertise-strip">
          <p className="technical-label">CORE EXPERTISE</p>
          <ul>{specializations.map(item => {
            const Icon = getIcon(item.icon)
            return <li key={item.id}><Icon size={17} aria-hidden="true" /><span>{item.label}</span></li>
          })}</ul>
        </div>
      </Container>
    </section>
  )
}
