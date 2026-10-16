import type { GitHubTarget } from './vault'

export interface RepositoryEntry { path: string; type: string; sha: string; size?: number }
export interface DeploymentRun { id: number; head_sha: string; status: string; conclusion: string | null; html_url: string; name: string }
export function repositoryPath(path: string) {
  if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Use a relative repository path without empty segments or ..')
  return path.split('/').map(encodeURIComponent).join('/')
}
async function request(target: GitHubTarget, token: string, path: string, init?: RequestInit) {
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}/${path}`, {
    ...init, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...init?.headers },
  })
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}))
    throw new Error(response.status === 409 || response.status === 422 ? 'The repository changed or this path already exists. Reload before saving.' : detail.message || `GitHub returned ${response.status}`)
  }
  return response.json()
}
export async function listRepositoryFiles(target: GitHubTarget, token: string): Promise<RepositoryEntry[]> {
  const result = await request(target, token, `git/trees/${encodeURIComponent(target.branch)}?recursive=1`)
  if (result.truncated) throw new Error('The repository listing is too large; use an exact path to open a file.')
  return result.tree.filter((entry: RepositoryEntry) => entry.type === 'blob')
}
export async function readRepositoryFile(target: GitHubTarget, token: string, path: string, ref = target.branch): Promise<{ sha: string; content: string; encoding: string }> {
  return request(target, token, `contents/${repositoryPath(path)}?ref=${encodeURIComponent(ref)}`)
}
export async function fileHistory(target: GitHubTarget, token: string, path: string): Promise<{ sha: string; commit: { message: string; author: { date: string } } }[]> {
  return request(target, token, `commits?sha=${encodeURIComponent(target.branch)}&path=${encodeURIComponent(path)}&per_page=20`)
}
export function decodeText(content: string) {
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(content.replace(/\s/g, '')), char => char.charCodeAt(0)))
}
export function encodeText(content: string) {
  const bytes = new TextEncoder().encode(content)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(binary)
}
export async function writeRepositoryFile(target: GitHubTarget, token: string, path: string, content: string, sha?: string, remove = false) {
  return request(target, token, `contents/${repositoryPath(path)}`, {
    method: remove ? 'DELETE' : 'PUT', body: JSON.stringify({ message: `${remove ? 'Remove' : 'Update'} ${path} via admin dashboard`, branch: target.branch, ...(sha ? { sha } : {}), ...(!remove ? { content } : {}) }),
  })
}
export async function uploadRepositoryFile(target: GitHubTarget, token: string, path: string, file: File, sha?: string) {
  if (file.size > 20 * 1024 * 1024) throw new Error('Use files smaller than 20 MB.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return writeRepositoryFile(target, token, path, btoa(binary), sha)
}
export async function getDeploymentRuns(target: GitHubTarget, token: string): Promise<DeploymentRun[]> {
  const result = await request(target, token, `actions/workflows/deploy.yml/runs?branch=${encodeURIComponent(target.branch)}&per_page=10`)
  return result.workflow_runs
}
