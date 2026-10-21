import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ContentProvider } from './context/ContentContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Home } from './pages/Home'
import { SiteAppearance } from './components/SiteAppearance'

// The admin dashboard (vault crypto, GitHub client, editors) is only needed on /admin, so it stays out of the home page bundle.
const Admin = lazy(() => import('./pages/Admin').then((m) => ({ default: m.Admin })))

function App() {
  return (
    <ContentProvider>
      <SiteAppearance />
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/admin"
                element={
                  <Suspense fallback={null}>
                    <Admin />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ContentProvider>
  )
}

export default App
