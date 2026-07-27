import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
console.log("NEXUSTECH ADMIN DEBUG BUILD 2026-06-15");
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { initSentry } from './utils/sentry.js'
import * as Sentry from '@sentry/react'

// Initialize Sentry before rendering
initSentry()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred. Please refresh.</p>}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
