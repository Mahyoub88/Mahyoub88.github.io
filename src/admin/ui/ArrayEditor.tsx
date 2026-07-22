import type { ReactNode } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

export function ArrayEditor<T>({
  items,
  onChange,
  makeItem,
  renderItem,
  itemLabel = 'item',
  addLabel,
}: {
  items: T[]
  onChange: (next: T[]) => void
  makeItem: () => T
  renderItem: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  itemLabel?: string
  addLabel?: string
}) {
  const update = (index: number, patch: Partial<T>) => {
    const next = items.slice()
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= items.length) return
    const next = items.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="relative rounded-xl border border-[var(--border-1)] bg-[var(--surface-0)] p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-3)]">
              {itemLabel} {i + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="rounded-md p-1.5 text-[var(--text-3)] hover:bg-[var(--surface-2)] disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="rounded-md p-1.5 text-[var(--text-3)] hover:bg-[var(--surface-2)] disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded-md p-1.5 text-red-400 hover:bg-red-500/10"
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          {renderItem(item, (patch) => update(i, patch), i)}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeItem()])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-2)] py-3 text-sm font-medium text-[var(--text-2)] transition hover:border-brand-blue-500/60 hover:text-brand-blue-400"
      >
        <Plus size={16} />
        {addLabel ?? `Add ${itemLabel}`}
      </button>
    </div>
  )
}
