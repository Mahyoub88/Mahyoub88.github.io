import { ArrowUpRight, FileText } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Articles() {
  const { content } = useContent()
  if (content.articles.length === 0) return null

  return (
    <section id="articles" className="border-y border-[var(--border-1)] bg-[var(--surface-1)] py-20">
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">RESEARCH</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">Research &amp; Publications</h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {content.articles.map((article) => {
            const hasLink = Boolean(article.url)
            const Wrapper = hasLink ? 'a' : 'div'
            return (
              <Wrapper
                key={article.id}
                {...(hasLink ? { href: article.url, target: '_blank', rel: 'noreferrer' } : {})}
                className="group flex gap-4 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-0)] p-6 shadow-[var(--shadow-card)] transition hover:border-brand-blue-500/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-500/10 text-brand-blue-400">
                  <FileText size={20} />
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[var(--text-1)]">{article.title}</h3>
                    {hasLink && (
                      <ArrowUpRight
                        size={16}
                        className="mt-1 shrink-0 text-[var(--text-3)] transition group-hover:text-brand-blue-400"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-3)]">
                    {new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-2)]">
                    {article.excerpt}
                  </p>
                </div>
              </Wrapper>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
