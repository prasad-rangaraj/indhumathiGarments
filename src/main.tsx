import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Catch Vite preload errors (new deployments)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

// Catch dynamic import failures (Safari/older browsers)
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason && 
    event.reason.message && 
    event.reason.message.includes('Failed to fetch dynamically imported module')
  ) {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
