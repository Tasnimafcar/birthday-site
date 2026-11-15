import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/gloock'
import '@fontsource/great-vibes'
import '@fontsource/hind-siliguri/400.css'
import '@fontsource/hind-siliguri/600.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
