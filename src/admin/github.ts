export interface GitHubPublishConfig {
  owner: string
  repo: string
  branch: string
  path: string
  token: string
}

const GITHUB_CONFIG_KEY = 'portfolio-github-config'

const defaultGitHubConfig: GitHubPublishConfig = {
  owner: '',
  repo: '',
  branch: 'main',
  path: 'src/data/defaultContent.json',
  token: '',
}

export function loadGitHubConfig(): GitHubPublishConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY)
    return raw ? { ...defaultGitHubConfig, ...JSON.parse(raw) } : defaultGitHubConfig
  } catch {
    return defaultGitHubConfig
  }
}

export function saveGitHubConfig(config: GitHubPublishConfig) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config))
}

export function isGitHubConfigReady(config: GitHubPublishConfig): boolean {
  return Boolean(config.owner && config.repo && config.token)
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

async function githubRequest(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `GitHub API error (${res.status})`)
  }
  return res.json()
}

export async function publishContentToGitHub(config: GitHubPublishConfig, json: string) {
  const { owner, repo, branch, path, token } = config
  const base = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  let sha: string | undefined
  try {
    const existing = await githubRequest(`${base}?ref=${encodeURIComponent(branch)}`, token)
    sha = existing.sha
  } catch {
    sha = undefined
  }

  const result = await githubRequest(base, token, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'chore: update site content via admin dashboard',
      content: utf8ToBase64(json),
      branch,
      ...(sha ? { sha } : {}),
    }),
  })

  return result as { commit?: { html_url?: string } }
}
