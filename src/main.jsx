import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReadilyApp from './readily-app.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReadilyApp />
  </StrictMode>,
)