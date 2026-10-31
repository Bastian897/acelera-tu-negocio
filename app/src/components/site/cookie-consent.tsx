import { useEffect, useRef, useState } from "react";

import { getStoredCookieConsent, loadGA4, storeCookieConsent } from "@/lib/analytics";
import { loadMetaPixel } from "@/lib/meta-pixel";

// GA4 y el Meta Pixel usan cookies para medir sesiones y conversiones, así que
// legalmente necesitan consentimiento previo (GDPR para visitantes europeos; la nueva
// ley chilena de protección de datos va en la misma línea). Cloudflare Web Analytics
// no necesita esto: no usa cookies ni guarda nada en el navegador.
//
// Barra inferior que no bloquea la página (2026-10-31): antes era un modal centrado
// que tapaba todo y bloqueaba el scroll. Con tráfico pagado desde Instagram/Facebook
// eso es justo lo primero que ve alguien que viene de un anuncio — se puede leer y
// navegar el sitio sin responder el aviso.
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getStoredCookieConsent();
    if (stored === "accepted") {
      loadGA4();
      loadMetaPixel();
    } else if (stored === null) {
      setVisible(true);
    }
  }, []);

  // Mientras la barra está visible, publica su alto en --cookie-bar-h para que el chat
  // flotante (chat-widget.tsx) se suba por encima en vez de taparla.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = barRef.current;
    if (!visible || !bar) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => root.style.setProperty("--cookie-bar-h", `${bar.offsetHeight + 16}px`));
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--cookie-bar-h");
    };
  }, [visible]);

  function handleAccept() {
    storeCookieConsent("accepted");
    loadGA4();
    loadMetaPixel();
    setVisible(false);
  }

  function handleReject() {
    storeCookieConsent("rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    // cookie-consent-overlay: espera a que termine la intro del logo (styles.css).
    <div
      ref={barRef}
      role="region"
      aria-label="Aviso de cookies"
      className="cookie-consent-overlay chat-panel-in fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-bg)] p-4 shadow-[var(--shadow-elevation)] sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-[var(--brand-muted)]">
          Usamos cookies para medir cómo se usa el sitio y el resultado de nuestros anuncios.{" "}
          <a
            href="/privacidad"
            className="underline underline-offset-2 hover:text-[var(--brand-ink)]"
          >
            Política de privacidad
          </a>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReject}
            className="h-10 flex-1 rounded-[var(--ac-radius-sm)] border border-[var(--brand-border)] px-4 text-sm font-medium text-[var(--brand-ink)] transition-colors hover:bg-[var(--brand-surface)] sm:flex-none"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="h-10 flex-1 rounded-[var(--ac-radius-sm)] bg-[var(--brand-primary)] px-4 text-sm font-medium text-[var(--ac-white)] transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.98] sm:flex-none"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
