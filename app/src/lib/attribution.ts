import { getStoredCookieConsent } from "@/lib/analytics";

// De dónde llegó la persona (2026-10-31, preparación para Meta Ads). Al entrar se
// guardan los utm_* y el fbclid de la URL; después viajan junto con el diagnóstico y el
// chat, y el backend los deja en el lead (leads.attribution) y en el Sheet, así se ve
// qué anuncio trajo a cada lead y cuáles terminaron siendo clientes. Sin esto, un lead
// que llega desde un anuncio y navega a /diagnostico pierde los parámetros en el camino.
const STORAGE_KEY = "acelera_attribution";
const URL_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

type StoredAttribution = Partial<Record<(typeof URL_KEYS)[number], string>> & {
  landing_page?: string;
  referrer?: string;
  captured_at?: number;
};

function readStored(): StoredAttribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAttribution) : null;
  } catch {
    return null;
  }
}

// Una visita con utm/fbclid siempre reemplaza lo guardado (el último anuncio en el que
// hizo clic es el que lo trajo esta vez). Una visita sin parámetros solo se guarda si no
// había nada, para no borrar el anuncio de origen cuando vuelve directo días después.
export function captureAttribution() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl: StoredAttribution = {};
    for (const key of URL_KEYS) {
      const value = params.get(key);
      if (value) fromUrl[key] = value.slice(0, 500);
    }
    const hasCampaign = Object.keys(fromUrl).length > 0;
    if (!hasCampaign && readStored()) return;
    const externalReferrer =
      document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : undefined;
    if (!hasCampaign && !externalReferrer) return;
    const entry: StoredAttribution = {
      ...fromUrl,
      landing_page: window.location.href.slice(0, 500),
      referrer: externalReferrer?.slice(0, 500),
      captured_at: Date.now(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage bloqueado (modo privado): se pierde la atribución, nada más.
  }
}

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Lo que se manda al backend. _fbp/_fbc son las cookies del Pixel. Si la persona
// rechazó las cookies en el antiguo aviso (ver analytics-loader.tsx), no se manda el fbclid:
// solo los utm_*, que identifican la campaña y no a la persona.
export function getAttributionPayload(): Record<string, unknown> | undefined {
  try {
    const stored = readStored() ?? {};
    if (getStoredCookieConsent() === "rejected") {
      const { fbclid: _fbclid, ...rest } = stored;
      return Object.keys(rest).length > 0 ? rest : undefined;
    }
    const payload: Record<string, unknown> = { ...stored };
    const fbp = readCookie("_fbp");
    const fbc = readCookie("_fbc");
    if (fbp) payload.fbp = fbp;
    if (fbc) payload.fbc = fbc;
    return Object.keys(payload).length > 0 ? payload : undefined;
  } catch {
    return undefined;
  }
}
