import { ArrowUpRight, Award, Cpu, ShieldCheck } from 'lucide-react'
import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Certifications() {
  const { content } = useContent()
  if (content.certifications.length === 0) return null

  return (
    <section id="certifications" className="scroll-mt-24 border-y border-[var(--border-1)] bg-[var(--surface-1)] py-20">
      <Container>
        <p className="text-xs font-semibold tracking-wider text-brand-blue-400">CREDENTIALS</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[var(--text-1)]">
          Certifications, Training &amp; Recognition
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-2)]">Professional certifications, technical training and recognition, with original certificate images and source links where available.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {content.certifications.map((item) => (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-1)] bg-[var(--surface-0)] shadow-[var(--shadow-card)] transition hover:border-brand-blue-400/40 sm:flex-row"
            >
              {item.image ? (
                <a href={item.image} target="_blank" rel="noreferrer" aria-label={`View full certificate: ${item.name}`} className="group flex shrink-0 items-center justify-center border-b border-[var(--border-1)] bg-[var(--surface-2)] p-4 sm:w-44 sm:border-b-0 sm:border-r">
                  <img src={item.image} alt={`Original certificate: ${item.name}`} loading="lazy" className="h-36 w-full rounded-md object-contain drop-shadow-lg transition group-hover:scale-[1.03] sm:h-auto sm:max-h-40" />
                </a>
              ) : (
                <div className="flex h-44 shrink-0 flex-col items-center justify-center gap-3 border-b border-[var(--border-1)] bg-gradient-to-br from-brand-blue-500/10 to-brand-purple-500/10 p-4 sm:h-auto sm:w-44 sm:border-b-0 sm:border-r">
                  <Cpu size={44} strokeWidth={1.3} className="text-brand-blue-400" aria-hidden />
                  <p className="text-center text-[10px] font-semibold uppercase tracking-widest text-[var(--text-3)]">Technical Training</p>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col p-5">
                <span className="mb-3 text-brand-blue-400">{item.type === 'Recognition' ? <Award size={22} aria-hidden /> : <ShieldCheck size={22} aria-hidden />}</span>
                <h3 className="text-base font-bold leading-snug text-[var(--text-1)]">{item.name}</h3>
                <p className="mt-2 text-sm font-medium text-[var(--text-2)]">
                  {item.issuer}
                </p>
                {item.date && <p className="mt-2 text-xs text-[var(--text-3)]">{item.type === 'Recognition' ? 'Awarded' : 'Issued'}: {item.date}</p>}
                {item.validUntil && <p className="mt-1 text-xs text-[var(--text-3)]">Original certificate valid through: {item.validUntil}</p>}
                {item.type && (
                  <span className="mt-3 self-start rounded-md border border-[var(--border-1)] bg-[var(--surface-2)] px-2 py-1 text-[10px] font-medium text-[var(--text-2)]">
                    {item.type}
                  </span>
                )}
                {item.description && <p className="mt-4 text-sm leading-relaxed text-[var(--text-2)]">{item.description}</p>}
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  {[
                    { href: item.image, label: 'View certificate' },
                    { href: item.credentialUrl, label: 'Issuer verification portal' },
                    { href: item.sourceUrl, label: 'View on LinkedIn' },
                  ].filter((link) => link.href).map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue-400 underline-offset-4 hover:underline">{link.label}<ArrowUpRight size={13} aria-hidden /></a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
