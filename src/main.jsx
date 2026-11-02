import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// eslint-disable-next-line react-refresh/only-export-components
const AdminUploads = lazy(() => import('./admin/AdminUploads.jsx'))
const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin/uploads'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <Suspense fallback={null}><AdminUploads /></Suspense> : <App />}
  </StrictMode>
)
