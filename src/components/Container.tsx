import type { ReactNode } from 'react'

export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-[2000px] px-6 lg:px-14 xl:px-20 ${className}`}>{children}</div>
}
