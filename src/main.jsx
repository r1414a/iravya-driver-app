import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DriverDashboard from './App.jsx'
// import DriverDashboard from './dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DriverDashboard />
  </StrictMode>,
)

// ✅ ADD THIS BELOW
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("PWA Ready"))
      .catch((err) => console.log("PWA Error", err));
  });
}