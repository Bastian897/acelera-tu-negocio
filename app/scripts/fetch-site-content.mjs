#!/usr/bin/env node
// Pide el texto del sitio editado en /admin/content (acelera-backend) y lo
// escribe en src/site-content.json antes de compilar. El sitio es 100%
// estático, así que esto es lo único que hace que "Guardar y publicar" en el
// panel realmente cambie el texto en vivo — el build de Vercel corre esto
// antes de vite build.
//
// Nunca debe romper el build: si el fetch falla (backend caído, sin red, URL
// mal puesta), se deja el archivo tal como está commiteado en el repo (el
// último contenido conocido) y solo se avisa por consola.
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Debe coincidir con src/lib/backend.ts.
const BACKEND_URL = "https://acelera-backend.morenobastian897.workers.dev";
const OUT_PATH = fileURLToPath(new URL("../src/site-content.json", import.meta.url));

try {
  const res = await fetch(`${BACKEND_URL}/api/site-content`, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const content = await res.json();

  // Sanity check mínimo: si el shape viene vacío o corrupto, mejor quedarse
  // con lo commiteado que escribir un JSON vacío que rompa todos los textos.
  if (!content || typeof content !== "object" || Object.keys(content).length === 0) {
    throw new Error("respuesta vacía o con forma inesperada");
  }

  writeFileSync(OUT_PATH, JSON.stringify(content, null, 2) + "\n");
  console.log("[fetch-site-content] Contenido actualizado desde el panel.");
} catch (err) {
  const current = readFileSync(OUT_PATH, "utf8");
  console.warn(
    `[fetch-site-content] No se pudo obtener el contenido del panel (${err.message}). ` +
      `Se sigue con el último contenido commiteado (${current.length} bytes).`,
  );
}
