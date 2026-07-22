import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { SiteContent } from '../types/content'
import { defaultContent } from '../data/defaultContent'

const STORAGE_KEY = 'portfolio-content-v1'

function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultContent
    const parsed = JSON.parse(raw)
    return { ...defaultContent, ...parsed }
  } catch {
    return defaultContent
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
    setLastSavedAt(Date.now())
  }, [])

  const resetContent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setContentState(defaultContent)
    setLastSavedAt(Date.now())
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setContentState({ ...defaultContent, ...JSON.parse(e.newValue) })
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
