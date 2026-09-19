// GitHub Contents API calls used to publish site content.
//
// This module never reads or writes storage. The token arrives as an argument,
// decrypted from the vault moments earlier and dropped as soon as the request
// finishes, so it exists in plaintext only for the life of the call.

import type { GitHubTarget } from './vault'

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

async function githubRequest(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `GitHub API error (${res.status})`)
  }
  return res.json()
}

export async function publishContentToGitHub(
  target: GitHubTarget,
  token: string,
  json: string,
): Promise<{ commit?: { html_url?: string } }> {
  const { owner, repo, branch, path } = target
  const base = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  let sha: string | undefined
  try {
    const existing = await githubRequest(`${base}?ref=${encodeURIComponent(branch)}`, token)
    sha = existing.sha
  } catch {
    sha = undefined
  }

  return (await githubRequest(base, token, {
    method: 'PUT',
    body: JSON.stringify({
      message: 'chore: update site content via admin dashboard',
      content: utf8ToBase64(json),
      branch,
      ...(sha ? { sha } : {}),
    }),
  })) as { commit?: { html_url?: string } }
}
