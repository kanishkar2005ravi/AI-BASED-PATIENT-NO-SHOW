import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ Clear all stale cached data on every app start (when not in demo mode)
// This ensures data deleted from Supabase never ghost-appears in the UI
if (import.meta.env.VITE_DEMO_MODE !== 'true') {
  const APP_STORAGE_KEYS = [
    'ai_cs_patients',
    'ai_cs_doctors',
    'ai_cs_availability',
    'ai_cs_appointments',
    'ai_cs_waitlist',
    'ai_cs_notifications',
    'ai_cs_analytics',
    'ai_cs_model_perf',
    'ai_cs_users'
  ];
  APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

