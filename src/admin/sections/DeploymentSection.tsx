import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDeploymentRuns, type DeploymentRun } from '../repository'
import { readToken } from '../vault'

export function DeploymentSection({ commit }: { commit?: string }) {
  const { vault, cryptoKey } = useAuth()
  const [runs, setRuns] = useState<DeploymentRun[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function refresh() {
    setBusy(true); setError('')
    try {
      if (!vault || !cryptoKey) throw new Error('Configure GitHub publishing first.')
      const token = await readToken(cryptoKey, vault)
      if (!token) throw new Error('Save your publishing token in Settings first.')
      setRuns(await getDeploymentRuns(vault.github, token))
    } catch (problem) { setError(problem instanceof Error ? problem.message : String(problem)) }
    finally { setBusy(false) }
  }
  useEffect(() => { void refresh() }, [commit]) // refresh explicitly; no hidden background publishing
  const matching = commit ? runs.find(run => run.head_sha === commit) : undefined
  return <div className="space-y-4">
    <h2 className="text-lg font-bold">Deployment</h2>
    <p className="text-sm">A GitHub commit saves your change. The site updates only after its GitHub Pages deployment succeeds. Publishing to a different branch requires merging it into the deployment branch.</p>
    {commit && <p className="break-all text-sm">Last content commit: {commit}<br />{matching ? matching.status === 'completed' ? matching.conclusion === 'success' ? 'Deployment succeeded.' : `Deployment finished: ${matching.conclusion}.` : `Deployment ${matching.status}.` : 'Waiting for a deployment run for this commit. Refresh shortly.'}</p>}
    <button disabled={busy} onClick={() => void refresh()} className="rounded-lg border px-4 py-2 disabled:opacity-40">{busy ? 'Checking…' : 'Refresh deployment status'}</button>
    {error && <p role="alert" className="text-sm text-red-400">{error} GitHub Actions read access may be needed.</p>}
    {runs.map(run => <a className="block rounded-lg border border-[var(--border-1)] p-3 text-sm" target="_blank" rel="noreferrer" key={run.id} href={run.html_url}>{run.name}: {run.status === 'completed' ? run.conclusion : run.status}<br /><span className="font-mono text-xs">{run.head_sha.slice(0, 12)}</span></a>)}
  </div>
}
