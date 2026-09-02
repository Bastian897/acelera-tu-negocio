import { useEffect, useState } from "react";

import { getStoredCookieConsent, loadGA4, storeCookieConsent } from "@/lib/analytics";

// GA4 usa cookies para medir sesiones/tiempo en el sitio, así que legalmente
// necesita consentimiento previo (GDPR para visitantes europeos; la nueva ley
// chilena de protección de datos va en la misma línea). Antes de este banner,
// gtag.js cargaba siempre, sin preguntar. Cloudflare Web Analytics no necesita
// esto: no usa cookies ni guarda nada en el navegador.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredCookieConsent();
    if (stored === "accepted") {
      loadGA4();
    } else if (stored === null) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    storeCookieConsent("accepted");
    loadGA4();
    setVisible(false);
  }

  function handleReject() {
    storeCookieConsent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-bg)] p-5 shadow-[var(--shadow-elevation)]">
      <p className="text-sm text-[var(--brand-ink)]">
        Usamos cookies para medir cómo se usa el sitio y mejorar tu experiencia. Puedes
        aceptarlas o rechazarlas cuando quieras.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={handleReject}
          className="rounded-[10px] border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
        >
          Rechazar
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-[10px] bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-[var(--ac-white)]"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
