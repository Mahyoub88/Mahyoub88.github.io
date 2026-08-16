import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'

const STORAGE_KEY = 'portfolio-content-v1'
// Signature of the *published* content the local draft was based on. When we
// publish new content via Git, this signature changes, so any stale local draft
// is discarded automatically and every browser shows the freshly published site
// without the visitor having to clear storage.
const BASE_KEY = 'portfolio-content-base-v1'

function baseSignature(content: SiteContent): string {
  const json = JSON.stringify(content)
  let hash = 5381
  for (let i = 0; i < json.length; i++) {
    hash = (hash * 33) ^ json.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

// Safe fallbacks for fields that may be missing from content published before
// this field existed, so the site never crashes on stale published JSON.
const FIELD_FALLBACKS: Pick<
  SiteContent,
  'technicalExpertise' | 'education' | 'certifications' | 'footerLinks'
> = {
  technicalExpertise: [],
  education: [],
  certifications: [],
  footerLinks: { resumeUrl: '', orcidUrl: '' },
}

function withFallbacks(content: SiteContent): SiteContent {
  return {
    ...content,
    technicalExpertise: content.technicalExpertise ?? FIELD_FALLBACKS.technicalExpertise,
    education: content.education ?? FIELD_FALLBACKS.education,
    certifications: content.certifications ?? FIELD_FALLBACKS.certifications,
    footerLinks: content.footerLinks ?? FIELD_FALLBACKS.footerLinks,
    hero: { ...content.hero, currentFocus: content.hero?.currentFocus ?? [] },
  }
}

function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return withFallbacks(defaultContent)

    // If the published content changed since this draft was saved, the draft is
    // stale — drop it and use the freshly published content. This is what makes
    // Git-published updates appear for everyone, including the site owner.
    const savedBase = localStorage.getItem(BASE_KEY)
    if (savedBase !== baseSignature(defaultContent)) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(BASE_KEY)
      return withFallbacks(defaultContent)
    }

    const parsed = JSON.parse(raw)
    return withFallbacks({ ...defaultContent, ...parsed })
  } catch {
    return withFallbacks(defaultContent)
  }
}

interface ContentContextValue {
  content: SiteContent
  setContent: (next: SiteContent) => void
  resetContent: () => void
  lastSavedAt: number | null
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SiteContent>(() => loadContent())
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)

  const setContent = useCallback((next: SiteContent) => {
    setContentState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    // Stamp the draft with the current published base so it survives reloads
    // until the next Git publish supersedes it.
    localStorage.setItem(BASE_KEY, baseSignature(defaultContent))
    setLastSavedAt(Date.now())
  }, [])

  const resetContent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(BASE_KEY)
    setContentState(defaultContent)
    setLastSavedAt(Date.now())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setContentState(withFallbacks({ ...defaultContent, ...JSON.parse(e.newValue) }))
        } catch {
          /* ignore malformed external update */
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = useMemo(
    () => ({ content, setContent, resetContent, lastSavedAt }),
    [content, setContent, resetContent, lastSavedAt],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
