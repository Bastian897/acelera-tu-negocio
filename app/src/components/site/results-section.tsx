const INDUSTRIES = [
  "Marketing",
  "E-commerce",
  "Gastronomía",
  "Salud y estética",
  "Fotografía",
];

export function ResultsSection() {
  return (
    <section id="casos" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <h2 className="reveal-up font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand-muted)]">
          A quién ayudamos
        </h2>

        <div className="relative mt-8 overflow-hidden rounded-2xl border border-[var(--brand-border)]">
          <img
            src="assets/plates/casos-atmosphere.jpg"
            alt="Instrumentos de precisión sobre una mesa de trabajo en un taller oscuro"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[var(--brand-bg)]/70" />

          <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
            <p className="font-mono text-6xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-8xl">
              $3M+
            </p>
            <p className="max-w-lg text-base leading-relaxed text-[var(--brand-muted)]">
              Trabajamos con empresas chilenas que ya facturan sobre $3M CLP mensuales y
              quieren ordenar su crecimiento con dirección clara, no con más ruido.
            </p>
          </div>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((industry) => (
            <li
              key={industry}
              className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2 font-mono text-xs uppercase tracking-wide text-[var(--brand-muted)]"
            >
              {industry}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
