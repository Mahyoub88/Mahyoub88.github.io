import { useContent } from '../context/ContentContext'
import { getIcon } from '../data/icons'
import { Container } from './Container'

const accentPalette = [
  'text-brand-blue-400 bg-brand-blue-500/10',
  'text-brand-emerald-400 bg-brand-emerald-400/10',
  'text-brand-purple-400 bg-brand-purple-500/10',
  'text-brand-amber-400 bg-brand-amber-400/10',
]

export function StatsBar() {
  const { content } = useContent()

  return (
    <section className="relative -mt-6 pb-4 lg:-mt-10">
      <Container>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border-1)] bg-[var(--border-1)] shadow-[var(--shadow-card)] sm:grid-cols-3">
          {content.stats.map((stat, i) => {
            const Icon = getIcon(stat.icon)
            return (
              <div
                key={stat.id}
                className="flex items-center gap-4 bg-[var(--surface-1)] px-6 py-6"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentPalette[i % accentPalette.length]}`}
                >
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  {stat.value && (
                    <p className="text-2xl font-extrabold text-[var(--text-1)]">{stat.value}</p>
                  )}
                  <p
                    className={
                      stat.value
                        ? 'text-xs text-[var(--text-3)]'
                        : 'text-sm font-semibold text-[var(--text-1)]'
                    }
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
