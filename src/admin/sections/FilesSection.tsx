import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { readToken, isTargetReady } from '../vault'
import { decodeText, encodeText, fileHistory, listRepositoryFiles, readRepositoryFile, uploadRepositoryFile, writeRepositoryFile, type RepositoryEntry } from '../repository'
import { TextInput, TextArea, Field } from '../ui/Field'

const button = 'rounded-lg border border-[var(--border-2)] px-3 py-2 text-sm disabled:opacity-40'
export function FilesSection({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const { vault, cryptoKey } = useAuth()
  const [files, setFiles] = useState<RepositoryEntry[]>([])
  const [filter, setFilter] = useState('public/')
  const [path, setPath] = useState('')
  const [sha, setSha] = useState<string>()
  const [loadedPath, setLoadedPath] = useState('')
  const [text, setText] = useState('')
  const [original, setOriginal] = useState('')
  const [editable, setEditable] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Load files to edit pages, simulations, styles, documents and images. File changes commit directly to the configured branch; they are separate from Save Changes.')
  const [preview, setPreview] = useState(false)
  const [history, setHistory] = useState<Awaited<ReturnType<typeof fileHistory>>>([])
  const dirty = editable && text !== original
  useEffect(() => {
    onDirtyChange(dirty)
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn); onDirtyChange(false) }
  }, [dirty, onDirtyChange])
  async function access() {
    if (!vault || !cryptoKey || !isTargetReady(vault)) throw new Error('Configure GitHub publishing in Settings first.')
    const token = await readToken(cryptoKey, vault)
    if (!token) throw new Error('A GitHub token is required.')
    return { target: vault.github, token }
  }
  async function perform(action: () => Promise<void>) {
    setBusy(true)
    try { await action() } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
    finally { setBusy(false) }
  }
  async function refresh() {
    const { target, token } = await access()
    setFiles(await listRepositoryFiles(target, token))
  }
  async function open(nextPath: string) {
    if (dirty && !confirm('Discard unsaved file changes?')) return
    await perform(async () => {
      const { target, token } = await access()
      const file = await readRepositoryFile(target, token, nextPath)
      const isText = /\.(html?|css|js|mjs|ts|tsx|json|md|txt|xml|svg|csv|yml|yaml|toml)$/.test(nextPath) || /(^|\/)(robots\.txt|_redirects)$/.test(nextPath)
      if (isText && file.encoding !== 'base64') throw new Error('This file is too large for the text editor. Download and replace it instead.')
      const decoded = isText ? decodeText(file.content) : ''
      setPath(nextPath); setLoadedPath(nextPath); setSha(file.sha); setPreview(false)
      setEditable(isText); setText(decoded); setOriginal(decoded)
      setHistory([])
      setMessage(`Opened ${nextPath}. ${isText ? 'Edit and commit below.' : 'Binary file: upload a replacement below.'}`)
    })
  }
  async function save(remove = false, upload?: File) {
    if (remove && !confirm(`Delete ${path} from the repository? Linked pages may stop working.`)) return
    await perform(async () => {
      if (sha && path !== loadedPath) throw new Error('Open this path first, or choose New file.')
      const { target, token } = await access()
      const result = upload ? await uploadRepositoryFile(target, token, path, upload, sha) : await writeRepositoryFile(target, token, path, encodeText(text), sha, remove)
      if (remove) { setPath(''); setSha(undefined); setLoadedPath(''); setEditable(false) }
      else { setSha(result.content.sha); setLoadedPath(path); setOriginal(text) }
      setMessage(`Committed to ${target.branch}. Deployment runs when this is the publishing branch. ${result.commit.html_url}`)
      await refresh()
    })
  }
  function newFile() {
    if (dirty && !confirm('Discard unsaved file changes?')) return
    setPath('public/'); setLoadedPath(''); setSha(undefined); setText(''); setOriginal(''); setEditable(true); setPreview(false)
    setMessage('Enter a new repository path and content, or upload a file. Existing paths must be opened before replacement.')
    setHistory([])
  }
  async function restore(ref: string) {
    if (!confirm(`Restore ${path} from revision ${ref.slice(0, 12)}? This creates a new commit.`)) return
    await perform(async () => {
      const { target, token } = await access()
      const previous = await readRepositoryFile(target, token, path, ref)
      if (previous.encoding !== 'base64') throw new Error('This revision is too large to restore in the browser.')
      await writeRepositoryFile(target, token, path, previous.content.replace(/\s/g, ''), sha)
      setText(''); setOriginal(''); setSha(undefined); setLoadedPath(''); setEditable(false); setHistory([])
      setMessage('Restored in a new commit. Reopen the file to edit it, and check Deployment Status.')
      await refresh()
    })
  }
  return <div className="space-y-4">
    <h2 className="text-lg font-bold text-[var(--text-1)]">Pages & Files</h2>
    <p className="text-sm">Manage uploaded media and downloads, detailed HTML case studies, simulation files and site source. Canonical project titles, summaries and hero images are regenerated from the Projects editor on build; edit those there.</p>
    <p className="text-sm">Paths start with public/ for public files. For example, public/uploads/resume.pdf is linked as /uploads/resume.pdf. New project pages are created automatically when a complete project is published.</p>
    <div className="flex flex-wrap gap-2">
      <button className={button} disabled={busy} onClick={() => void perform(refresh)}>Load / refresh files</button>
      <button className={button} disabled={busy} onClick={newFile}>New file</button>
    </div>
    <TextInput aria-label="Filter files" value={filter} onChange={event => setFilter(event.target.value)} placeholder="Filter paths…" />
    <div className="max-h-56 overflow-auto rounded-lg border border-[var(--border-1)]">
      {files.filter(file => file.path.toLowerCase().includes(filter.toLowerCase())).map(file => <button disabled={busy} key={file.path} className="block w-full break-all px-3 py-2 text-left text-xs hover:bg-[var(--surface-2)]" onClick={() => void open(file.path)}>{file.path}</button>)}
    </div>
    <Field label="Repository path"><TextInput value={path} disabled={!!sha} onChange={event => setPath(event.target.value)} /></Field>
    <button className={button} disabled={busy || !path} onClick={() => void open(path)}>Open exact path</button>
    {editable && <Field label="File contents"><TextArea rows={22} className="font-mono text-xs" value={text} onChange={event => setText(event.target.value)} /></Field>}
    <div className="flex flex-wrap gap-2">
      <button className={button} disabled={busy || !path || !editable || (!dirty && !!sha)} onClick={() => void save()}>Commit file</button>
      <button className={button} disabled={busy || !sha} onClick={() => void save(true)}>Delete file</button>
      <button className={button} disabled={busy || !sha} onClick={() => void perform(async () => { const { target, token } = await access(); setHistory(await fileHistory(target, token, path)) })}>Version history</button>
      {editable && path.endsWith('.html') && <button className={button} onClick={() => setPreview(!preview)}>Preview HTML</button>}
    </div>
    {path && <label className="block text-sm">{sha ? 'Replace this file' : 'Upload to this path'}<input type="file" disabled={busy} className="mt-2 block max-w-full" onChange={event => { const file = event.target.files?.[0]; if (file) void save(false, file); event.target.value = '' }} /></label>}
    {preview && <iframe title="Isolated HTML preview" sandbox="" srcDoc={text} className="h-[500px] w-full rounded-lg bg-white" />}
    {history.length > 0 && <div className="space-y-2"><h3 className="font-semibold">Recent file versions</h3>{history.map(revision => <div key={revision.sha} className="rounded-lg border border-[var(--border-1)] p-3 text-xs"><p>{revision.commit.message.split('\n')[0]} · {revision.commit.author.date}</p><button disabled={busy || dirty} className="mt-2 underline" onClick={() => void restore(revision.sha)}>Restore {revision.sha.slice(0, 12)}</button></div>)}</div>}
    <p role="status" className="break-words text-sm">{busy ? 'Working…' : message}</p>
  </div>
}
