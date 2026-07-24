import { ShieldCheck } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Certifications() {
  const { content } = useContent()
  if (content.certifications.length === 0) return null

  return (
    <section id="certifications" className="border-y border-[var(--border-1)] bg-[var(--surface-1)] py-20">
      <Container className="max-w-4xl">
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">CREDENTIALS</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">
          Certifications &amp; Training
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {content.certifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-[var(--border-1)] bg-[var(--surface-0)] p-5 shadow-[var(--shadow-card)]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-500/10 text-brand-blue-400">
                <ShieldCheck size={18} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[var(--text-1)]">{item.name}</h3>
                <p className="mt-0.5 text-xs text-[var(--text-3)]">
                  {item.issuer}
                  {item.date ? ` · ${item.date}` : ''}
                </p>
                {item.type && (
                  <span className="mt-2 inline-block rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-2)]">
                    {item.type}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
