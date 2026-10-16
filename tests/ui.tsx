// Development-only fixture. Not a Vite build entry and never copied to public/.
// Exercises editors without creating or unlocking anyone's credential vault.
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ContentProvider, useContent } from '../src/context/ContentContext'
import { AuthProvider } from '../src/context/AuthContext'
import { ThemeProvider } from '../src/context/ThemeContext'
import { SiteAppearance } from '../src/components/SiteAppearance'
import { SiteSection } from '../src/admin/sections/SiteSection'
import { ProjectsSection } from '../src/admin/sections/ProjectsSection'
import { EducationSection } from '../src/admin/sections/EducationSection'
import { CertificationsSection } from '../src/admin/sections/CertificationsSection'
import { FilesSection } from '../src/admin/sections/FilesSection'
import { AdvancedSection } from '../src/admin/sections/AdvancedSection'
import { DeploymentSection } from '../src/admin/sections/DeploymentSection'
import '../src/index.css'
function Fixture() {
  const { content, setContent } = useContent()
  const [tab, setTab] = useState('Site')
  const [fileDirty, setFileDirty] = useState(false)
  const props = { content, onChange: (patch: Partial<typeof content>) => setContent({ ...content, ...patch }) }
  return <div className="mx-auto max-w-5xl space-y-5 p-6"><h1 className="text-2xl font-bold">Admin editor QA (local fixture)</h1><nav className="flex flex-wrap gap-3">{['Site', 'Projects', 'Education', 'Certificates', 'Files', 'Complete Content', 'Deployment'].map(label => <button key={label} className="rounded border px-3 py-2" onClick={() => setTab(label)}>{label}</button>)}</nav>
    {tab === 'Site' && <SiteSection {...props} />}{tab === 'Projects' && <ProjectsSection {...props} />}{tab === 'Education' && <EducationSection {...props} />}{tab === 'Certificates' && <CertificationsSection {...props} />}{tab === 'Files' && <FilesSection onDirtyChange={setFileDirty} />}{tab === 'Complete Content' && <AdvancedSection {...props} />}{tab === 'Deployment' && <DeploymentSection />}<span className="sr-only">{fileDirty ? 'Unsaved file' : ''}</span></div>
}
createRoot(document.getElementById('root')!).render(<ContentProvider><SiteAppearance /><ThemeProvider><AuthProvider><Fixture /></AuthProvider></ThemeProvider></ContentProvider>)
