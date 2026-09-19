import type { ReactNode } from 'react'

const DEFAULT_MAX_WIDTH = 'max-w-[1440px]'

/**
 * Two max-w utilities on one element are resolved by stylesheet order, not by
 * the order they appear in the class string — so a caller passing `max-w-4xl`
 * was silently losing to this component's own arbitrary-value default. The
 * default is therefore omitted whenever the caller supplies its own width.
 */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const callerSetsWidth = /(?:^|\s)max-w-/.test(className)

  return (
    <div
      className={`mx-auto w-full ${callerSetsWidth ? '' : DEFAULT_MAX_WIDTH} px-6 lg:px-14 xl:px-20 ${className}`}
    >
      {children}
    </div>
  )
}
