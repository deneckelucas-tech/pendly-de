import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initPushNotifications } from "./lib/push-service";

createRoot(document.getElementById("root")!).render(<App />);

// Initialize native push notifications (no-op on web)
initPushNotifications().catch(err => console.error('[push] init failed:', err));
