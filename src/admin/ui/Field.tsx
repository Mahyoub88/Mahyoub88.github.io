import type { ReactNode } from 'react'

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-2)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-[var(--text-3)]">{hint}</span>}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-[var(--border-1)] bg-[var(--surface-0)] px-3 py-2 text-sm text-[var(--text-1)] outline-none transition focus:border-brand-blue-500 focus:ring-2 focus:ring-brand-blue-500/20'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-y ${props.className ?? ''}`} />
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />
}
