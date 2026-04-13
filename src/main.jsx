import { StrictMode, Suspense  } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
const DriverDashboard = lazy(() => import('./App.jsx'))
// import DriverDashboard from './dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div>Loading....</div>}>
    <DriverDashboard />
      </Suspense>
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
