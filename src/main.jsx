import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { SettingsProvider } from './lib/settings.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
)
