import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Local cache clearing has been removed to allow appointments to persist across refreshes.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

