import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import App from './App.jsx'
import ScrollToTop from '@/components/common/ScrollToTop'
import { AdminAuthProvider } from '@/context/AdminAuthContext'
import { TraderAuthProvider } from '@/context/TraderAuthProvider'
import { SiteProvider } from '@/context/SiteProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <TraderAuthProvider>
          <SiteProvider>
            <ScrollToTop />
            <App />
          </SiteProvider>
        </TraderAuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
