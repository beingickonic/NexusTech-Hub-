import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { initSentry } from './utils/sentry.js'
import * as Sentry from '@sentry/react'

// Initialize Sentry before rendering
initSentry()

const ErrorFallback = ({ error, componentStack }) => (
  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>An error has occurred. Please refresh.</h1>
    <p style={{ marginBottom: '1.5rem' }}>
      <button
        onClick={() => window.location.reload()}
        style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#f59e0b', color: '#1a1a1a', fontWeight: 600 }}
      >
        Reload page
      </button>
    </p>
    {error && (
      <details style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'left', fontSize: '0.8rem', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.75rem' }}>
        <summary style={{ cursor: 'pointer' }}>Error details</summary>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0.5rem 0 0' }}>
          {String(error?.stack || error?.message || error)}
          {componentStack ? `\n\nComponent stack:\n${componentStack}` : ''}
        </pre>
      </details>
    )}
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
