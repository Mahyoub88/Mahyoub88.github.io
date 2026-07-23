import type { ReactNode } from 'react'

export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-[1600px] px-6 lg:px-12 xl:px-16 ${className}`}>{children}</div>
}
