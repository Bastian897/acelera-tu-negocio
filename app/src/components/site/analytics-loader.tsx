import { useEffect } from "react";

import { getStoredCookieConsent, loadGA4 } from "@/lib/analytics";
import { loadMetaPixel } from "@/lib/meta-pixel";

// Carga GA4 y el Meta Pixel al entrar. Hasta 2026-11-04 esperaban a que la persona
// aceptara un aviso de cookies; el equipo decidió sacarlo por ahora (Bastian: "no es
// necesario aún"), así que se cargan siempre. Si alguien rechazó las cookies cuando el
// aviso existía, se respeta esa decisión.
// OJO: revisar antes de que entre en vigencia la Ley 21.719 (1 de diciembre de 2026).
export function AnalyticsLoader() {
  useEffect(() => {
    if (getStoredCookieConsent() === "rejected") return;
    loadGA4();
    loadMetaPixel();
  }, []);
  return null;
}
