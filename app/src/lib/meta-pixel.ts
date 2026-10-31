// Meta Pixel (2026-10-31, preparación para Meta Ads). Igual que GA4, usa cookies, así
// que solo se carga cuando la persona acepta el aviso (ver cookie-consent.tsx). Las
// conversiones importantes también salen desde el backend por la Conversions API
// (acelera-backend/src/lib/meta-capi.ts) con el mismo event_id, así que Meta las ve
// aunque el Pixel esté bloqueado, sin contarlas dos veces.
//
// Vacío = Pixel apagado: nada de este archivo hace algo hasta que se pegue acá el ID del
// Pixel (Events Manager → Orígenes de datos → el Pixel/dataset de Acelera).
export const META_PIXEL_ID = "";

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let pixelLoaded = false;

// Equivalente al snippet oficial de Meta, sin el <noscript> (el sitio entero necesita JS).
export function loadMetaPixel() {
  if (pixelLoaded || !META_PIXEL_ID) return;
  pixelLoaded = true;

  const queue: unknown[] = [];
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else queue.push(args);
  }) as Fbq;
  fbq.queue = queue;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

export function newMetaEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// Nunca bloquea lo que la persona está haciendo: sin Pixel cargado (sin consentimiento,
// bloqueador de anuncios o ID vacío) simplemente no hace nada.
export function trackMetaEvent(name: string, params?: Record<string, unknown>, eventId?: string) {
  try {
    if (!pixelLoaded) return;
    window.fbq?.("track", name, params ?? {}, eventId ? { eventID: eventId } : undefined);
  } catch {
    // ignorado a propósito
  }
}

export function trackMetaCustomEvent(name: string, params?: Record<string, unknown>) {
  try {
    if (!pixelLoaded) return;
    window.fbq?.("trackCustom", name, params ?? {});
  } catch {
    // ignorado a propósito
  }
}

// El Pixel solo registra el PageView de la carga inicial; las navegaciones internas del
// router (home → /diagnostico) se avisan desde __root.tsx.
export function trackMetaPageView() {
  trackMetaEvent("PageView");
}
