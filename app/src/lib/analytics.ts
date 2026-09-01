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
