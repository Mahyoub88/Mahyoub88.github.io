import { useState } from 'react'
import type { SiteContent } from '../../types/content'
import { validateContent } from '../validateContent'
import { TextArea } from '../ui/Field'

export function AdvancedSection({ content, onChange }: { content: SiteContent; onChange: (patch: Partial<SiteContent>) => void }) {
  const [json, setJson] = useState(() => JSON.stringify(content, null, 2))
  const [message, setMessage] = useState('')
  function apply() {
    try {
      const parsed = JSON.parse(json)
      const errors = validateContent(parsed)
      if (errors.length) throw new Error(errors.join('\n'))
      onChange(parsed)
      setMessage('Applied to the draft. Save Changes to publish.')
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
  }
  return <div className="space-y-4">
    <h2 className="text-lg font-bold">Complete Content Editor</h2>
    <p className="text-sm">Edit all content fields as JSON. Use the regular editors for day-to-day changes. Applying checks the structure before updating your draft.</p>
    <TextArea aria-label="Complete site content JSON" rows={30} className="font-mono text-xs" value={json} onChange={event => setJson(event.target.value)} />
    <div className="flex gap-3"><button className="rounded-lg border px-4 py-2" onClick={apply}>Validate & apply</button><button className="rounded-lg border px-4 py-2" onClick={() => { setJson(JSON.stringify(content, null, 2)); setMessage('Loaded current draft.') }}>Reload draft</button></div>
    <p role="status" className="whitespace-pre-line text-sm">{message}</p>
  </div>
}
