import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "../../hooks/use-reveal";
import { siteContent } from "../../lib/site-content";

// Distancia desde el borde superior de cada paso hasta su punto en el riel.
const DOT_TOP_PX = 44;

/**
 * Riel vertical que se llena con el scroll: cada paso se enciende cuando la
 * línea lo alcanza (lectura a ~65% del alto de la ventana). Escribe directo
 * al DOM en un requestAnimationFrame, sin estado de React por frame. El
 * servidor renderiza el riel lleno y los tres pasos encendidos, que es
 * también lo que queda con prefers-reduced-motion.
 */
function useScrollRail() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || prefersReducedMotion()) return;
    const steps = Array.from(list.querySelectorAll<HTMLElement>(".process-step"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();
      const reach = window.innerHeight * 0.65 - rect.top;
      const p = Math.min(1, Math.max(0, reach / rect.height));
      list.style.setProperty("--p", String(p));
      for (const step of steps) {
        step.dataset.on = String(reach >= step.offsetTop + DOT_TOP_PX);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return listRef;
}

const STEPS = [
  {
    number: "01",
    title: siteContent.process.step1Title,
    body: siteContent.process.step1Body,
  },
  {
    number: "02",
    title: siteContent.process.step2Title,
    body: siteContent.process.step2Body,
  },
  {
    number: "03",
    title: siteContent.process.step3Title,
    body: siteContent.process.step3Body,
  },
];

export function ProcessSection() {
  const listRef = useScrollRail();

  return (
    <section
      id="proceso"
      className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="reveal-up max-w-md text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            {siteContent.process.heading}
          </h2>

          <div ref={listRef} className="relative mt-10">
            <span aria-hidden="true" className="process-rail">
              <span className="process-rail__fill" />
            </span>
            <ol className="divide-y divide-[var(--brand-border)] border-t border-[var(--brand-border)]">
              {STEPS.map((step) => (
                <li
                  key={step.number}
                  data-on="true"
                  className="process-step relative flex gap-6 py-8 pl-8"
                >
                  <span
                    aria-hidden="true"
                    className="process-step__dot"
                    style={{ top: DOT_TOP_PX - 6 }}
                  />
                  <span className="process-step__num font-[var(--font-display)] text-4xl font-bold leading-none tracking-tighter text-[var(--brand-accent)] md:text-6xl">
                    {step.number}
                  </span>
                  <div className="process-step__body">
                    <h3 className="text-lg font-medium tracking-tight text-[var(--brand-ink)]">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="relative min-h-[20rem] overflow-hidden rounded-2xl border border-[var(--brand-border)] md:min-h-[28rem]">
          <img
            src="assets/plates/proceso-detail.jpg"
            alt="Macro fotografía de engranajes de acero cepillado interconectados"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
