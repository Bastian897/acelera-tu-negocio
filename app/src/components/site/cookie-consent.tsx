import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

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

  // Modal centrado en pantalla en vez de esquina: mientras está abierto,
  // bloquea el scroll de fondo como cualquier diálogo modal real.
  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#010b18]/55 p-4 backdrop-blur-sm"
    >
      <div className="chat-panel-in w-full max-w-sm rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-bg)] p-8 shadow-[var(--shadow-elevation)]">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]"
        >
          <Cookie className="h-6 w-6" style={{ color: "var(--brand-primary)" }} strokeWidth={1.75} />
        </span>

        <h2
          id="cookie-consent-title"
          style={{ fontFamily: "var(--font-display)" }}
          className="mt-4 text-lg font-semibold text-[var(--brand-ink)]"
        >
          Usamos cookies
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">
          Las usamos para medir cómo se usa el sitio y mejorar tu experiencia. Puedes
          aceptarlas o rechazarlas cuando quieras, sin que eso cambie lo que puedes hacer en el sitio.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleReject}
            className="h-11 flex-1 rounded-[var(--ac-radius-sm)] border border-[var(--brand-border)] text-sm font-medium text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-surface)]"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="h-11 flex-1 rounded-[var(--ac-radius-sm)] bg-[var(--brand-primary)] text-sm font-medium text-[var(--ac-white)] transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.98]"
          >
            Aceptar
          </button>
        </div>

        <a
          href="/privacidad"
          className="mt-4 block text-center text-xs text-[var(--brand-muted)] underline underline-offset-2 hover:text-[var(--brand-ink)]"
        >
          Ver política de privacidad
        </a>
      </div>
    </div>
  );
}
