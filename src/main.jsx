import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './styles/globals.css'
import './styles/challan.css'
import './styles/challan-print.css'
import './styles/challan-landscape.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 2500,
      }}
    />
  </StrictMode>,
)
