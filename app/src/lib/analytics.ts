// Token del beacon de Cloudflare Web Analytics (gratis, sin cookies, funciona
// aunque el sitio esté en Vercel). Sitio creado vía API el 2026-09-01
// (site_tag 83a41c75431e47b89eef4f503257fcd9, host
// acelera-tu-negocio.vercel.app) — las estadísticas se leen en
// acelera-backend (/admin/stats), no hace falta el dashboard de Cloudflare
// para nada de esto.
export const CF_BEACON_TOKEN = "9e0e77f2994a4c1595ac2e688c6d3fdb";

// Google Analytics 4 — a diferencia de Cloudflare Web Analytics, SÍ usa cookies y
// mide tiempo en el sitio / interacción / sesiones. Propiedad "Acelera - Sitio web"
// creada el 2026-09-01 (cuenta "Acelera tu Negocio", Chile/CLP). Panel:
// analytics.google.com. No hay lectura de vuelta en /admin todavía — por ahora
// se revisa directo en el dashboard de Google Analytics.
export const GA4_MEASUREMENT_ID = "G-0CMHBRBFPJ";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// "Tasa de interacción" en /admin/stats se redefinió a partir de esto: en vez de
// la métrica genérica de GA4 (10s en el sitio, 2+ páginas...), Bastian pidió que
// sea específicamente clics en los botones reales de la página (diagnóstico,
// agendar, contacto, chat, descarga). Cada botón manda un evento GA4 propio
// ("cta_click" con el nombre del botón) — acelera-backend lo lee de vuelta vía
// la Data API filtrando por ese evento.
export function trackCtaClick(name: string) {
  try {
    window.gtag?.("event", "cta_click", { cta_name: name });
  } catch {
    // gtag puede no existir aún (bloqueadores de anuncios, script no cargado) — no bloquear el clic real por esto.
  }
}

// GA4 usa cookies, así que legalmente necesita consentimiento previo (GDPR para
// visitantes europeos, y la nueva ley chilena de protección de datos apunta en
// la misma línea) — Cloudflare Web Analytics no, porque no usa cookies ni
// almacenamiento del navegador, así que ese sigue cargando siempre.
const COOKIE_CONSENT_KEY = "acelera_cookie_consent";
export type CookieConsent = "accepted" | "rejected";

export function getStoredCookieConsent(): CookieConsent | null {
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function storeCookieConsent(value: CookieConsent) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // si falla, se le vuelve a preguntar en la próxima visita — no es grave.
  }
}

let ga4Loaded = false;

// Inyecta gtag.js recién cuando hay consentimiento — antes no existía ninguna
// forma de negar el consentimiento y GA4 cargaba siempre, sin preguntar.
export function loadGA4() {
  if (ga4Loaded || !GA4_MEASUREMENT_ID) return;
  ga4Loaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID);
}
