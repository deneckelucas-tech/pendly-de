import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Native app: go straight to register
      navigate("/auth", { replace: true });
    } else {
      // Web: show landing page
      window.location.href = "/landing.html";
    }
  }, [navigate]);

  return null;
}
