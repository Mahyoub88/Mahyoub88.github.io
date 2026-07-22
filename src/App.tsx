import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ContentProvider } from './context/ContentContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Home } from './pages/Home'
import { Admin } from './pages/Admin'

function App() {
  return (
    <ContentProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ContentProvider>
  )
}

export default App
