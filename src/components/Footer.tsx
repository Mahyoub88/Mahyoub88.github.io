import { useContent } from '../context/ContentContext'
import { Container } from './Container'

export function Footer() {
  const { content } = useContent()

  return (
    <footer className="border-t border-[var(--border-1)] py-8">
      <Container className="flex flex-col items-center justify-between gap-3 text-sm text-[var(--text-3)] sm:flex-row">
        <p>
          © {new Date().getFullYear()} {content.brand.name}. All rights reserved.
        </p>
        <p>Built with React &amp; Tailwind CSS.</p>
      </Container>
    </footer>
  )
}
