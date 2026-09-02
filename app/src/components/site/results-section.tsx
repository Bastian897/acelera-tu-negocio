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
        <h2 className="reveal-up text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
          A quién ayudamos
        </h2>
        <span aria-hidden="true" className="mb-8 mt-2 block h-[3px] w-10 rounded-full bg-[var(--brand-accent)] opacity-70" />

        {/* Dark impact block: solid dark surface, white copy, brand-blue number. */}
        <div className="relative mt-8 overflow-hidden rounded-[24px] bg-[var(--dark-bg)]">
          <img
            src="assets/plates/casos-atmosphere.jpg"
            alt="Instrumentos de precisión sobre una mesa de trabajo en un taller oscuro"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[var(--dark-bg)]/70" />

          <div className="relative flex flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
            <p className="font-[var(--font-display)] text-6xl font-extrabold tracking-tighter text-[var(--brand-primary)] md:text-8xl">
              $10M+
            </p>
            <p className="max-w-lg text-base leading-relaxed text-[var(--dark-muted)]">
              Trabajamos con empresas chilenas que ya facturan sobre $10M CLP mensuales y
              quieren ordenar su crecimiento con dirección clara, no con más ruido.
            </p>
          </div>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((industry) => (
            <li
              key={industry}
              className="rounded-full bg-[var(--ac-blue-soft)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--brand-secondary)]"
            >
              {industry}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
