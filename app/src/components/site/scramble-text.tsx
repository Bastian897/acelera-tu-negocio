import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "../../hooks/use-reveal";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%/";
const FRAMES = 22;
const FRAME_MS = 40;

/**
 * Texto de kicker que se «decodifica» al entrar en pantalla: pasa por
 * caracteres aleatorios y se asienta de izquierda a derecha en el texto real,
 * como una lectura digital que se estabiliza. El servidor renderiza el texto
 * real, así Google lee el texto correcto; la animación dura menos de 1 s.
 * Los frames se escriben directo al DOM, sin estado de React.
 */
export function ScrambleText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    const target = text.toUpperCase();
    let timer = 0;

    const run = () => {
      let frame = 0;
      const tick = () => {
        const reveal = Math.floor((target.length * frame) / FRAMES);
        el.textContent = Array.from(target, (c, i) =>
          i < reveal || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        ).join("");
        if (frame++ < FRAMES) timer = window.setTimeout(tick, FRAME_MS);
        else el.textContent = text;
      };
      tick();
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
      el.textContent = text;
    };
  }, [text]);

  return <span ref={ref}>{text}</span>;
}
