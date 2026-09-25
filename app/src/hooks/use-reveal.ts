import { useEffect, useRef, useState } from "react";

/**
 * Fases de una animación de entrada de la landing:
 * - "rest": estado final. Es lo que renderiza el servidor, lo que ve Google y
 *   lo que queda si hay prefers-reduced-motion o el JS no carga.
 * - "armed": ya hidratado y el elemento todavía no entra al viewport; se
 *   oculta/pone en su estado inicial (fuera de pantalla, así no se nota).
 * - "play": entró al viewport; corre la animación una sola vez por visita.
 */
export type RevealPhase = "rest" | "armed" | "play";

export function useReveal<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<RevealPhase>("rest");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    setPhase("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("play");
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, phase] as const;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
