import { BACKEND_URL } from "./backend";

// Apagado junto con el módulo de satisfacción y referidos del backend
// (FEEDBACK_MODULE_ENABLED en feature-flags.ts): mientras ese endpoint no exista,
// no hay nada que capturar ni reclamar. Reactivar ambos a la vez.
const REFERRALS_ENABLED = false;

const STORAGE_KEY = "acelera_ref";
// Mismo largo máximo razonable que valida el backend; evita guardar basura si
// alguien manipula la URL a mano.
const MAX_CODE_LENGTH = 32;

// Corre en el cliente (el sitio es prerender estático): todo acceso a
// localStorage va en try/catch porque puede lanzar en ventanas privadas o con
// datos de sitio bloqueados, y el formulario debe funcionar igual sin esto.
export function captureReferralFromUrl(): void {
  if (!REFERRALS_ENABLED) return;
  try {
    const code = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (code && code.length <= MAX_CODE_LENGTH) window.localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Sin storage no hay atribución, pero nada más se rompe.
  }
}

// Se llama recién cuando el diagnóstico o la agenda ya salieron bien. El
// backend responde siempre igual exista o no el código, así que no hay nada
// que mostrarle a la persona ni motivo para bloquear el flujo si esto falla.
export function claimReferral(email: string): void {
  if (!REFERRALS_ENABLED) return;
  try {
    const code = window.localStorage.getItem(STORAGE_KEY);
    if (!code || !email) return;
    void fetch(`${BACKEND_URL}/api/referral/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, email }),
    }).catch(() => {});
  } catch {
    // Igual que arriba: la atribución es opcional.
  }
}
