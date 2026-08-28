import { PrimaryCta } from "./cta";

const PROOF_POINTS = [
  {
    label: "A partir de tus respuestas",
    detail: "No un formulario que cae en un cajón: cada respuesta alimenta el informe.",
  },
  {
    label: "3 a 4 observaciones concretas",
    detail: "Escritas para tu negocio, con tus números y tu mercado — no una plantilla genérica.",
  },
  {
    label: "Gratis, sin letra chica",
    detail: "Así trabajamos cuando ya eres cliente: entregamos, no conversamos.",
  },
];

export function ResourcesSection() {
  return (
    <section id="recursos" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
          Diagnóstico gratis
        </p>
        <h2 className="reveal-up mt-4 text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Tu diagnóstico, calibrado a tu negocio.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
          Respondes unas preguntas sobre tu operación y tus números. Te devolvemos un informe
          real, generado a partir de tus respuestas — la primera prueba de que en Acelera
          entregamos cosas concretas, no conversación.
        </p>

        <div className="mt-14 grid gap-8 text-left sm:grid-cols-3">
          {PROOF_POINTS.map((point) => (
            <div key={point.label} className="border-t border-[var(--brand-border)] pt-4">
              <p className="text-sm font-medium text-[var(--brand-ink)]">{point.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">{point.detail}</p>
            </div>
          ))}
        </div>

        <PrimaryCta href="#contacto" className="mt-14">
          Quiero mi diagnóstico gratis
        </PrimaryCta>
      </div>
    </section>
  );
}
