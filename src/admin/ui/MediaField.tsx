import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { readToken, isTargetReady } from '../vault'
import { uploadRepositoryFile } from '../repository'
import { Field, TextInput } from './Field'

export function MediaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { vault, cryptoKey } = useAuth()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function upload(file?: File) {
    if (!file) return
    setBusy(true)
    try {
      if (!vault || !cryptoKey || !isTargetReady(vault)) throw new Error('Configure GitHub publishing in Settings first.')
      const token = await readToken(cryptoKey, vault)
      if (!token) throw new Error('Unlock your publishing token first.')
      const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const path = `public/uploads/${crypto.randomUUID()}-${name}`
      await uploadRepositoryFile(vault.github, token, path, file)
      onChange(path.slice('public'.length))
      setMessage('File committed to GitHub. Save the content changes to publish its reference.')
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }
  return <div>
    <Field label={label}><TextInput value={value} onChange={event => onChange(event.target.value)} placeholder="/uploads/file.webp or https://…" /></Field>
    {value && /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(value) && <img src={value} alt={`${label} preview`} className="my-2 max-h-32 max-w-full rounded-lg object-contain" />}
    <label className="mt-2 block text-xs text-[var(--text-2)]">{busy ? 'Uploading…' : 'Upload a new file'}
      <input type="file" disabled={busy} className="mt-1 block max-w-full text-xs" onChange={event => { void upload(event.target.files?.[0]); event.target.value = '' }} />
    </label>
    {message && <p role="status" className="mt-1 text-xs">{message}</p>}
  </div>
}
