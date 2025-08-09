import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './App.css'
import { validateConfig } from './config/airtable.ts'

if (!validateConfig()) {
  console.warn('⚠️ Aplicação iniciada com configuração incompleta do Airtable');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
