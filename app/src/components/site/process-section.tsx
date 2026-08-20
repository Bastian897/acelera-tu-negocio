const STEPS = [
  {
    number: "01",
    title: "Diagnóstico",
    body: "Revisamos tu operación, tus números y tu mercado para identificar dónde está la fricción real.",
  },
  {
    number: "02",
    title: "Dirección",
    body: "Definimos un plan de acción concreto: costos, oportunidades comerciales y estrategia de marketing.",
  },
  {
    number: "03",
    title: "Ejecución",
    body: "Implementamos junto a tu equipo y medimos resultados con KPIs que se revisan cada semana.",
  },
];

export function ProcessSection() {
  return (
    <section id="proceso" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="reveal-up max-w-md text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            Cómo trabajamos
          </h2>

          <ol className="mt-10 divide-y divide-[var(--brand-border)] border-t border-[var(--brand-border)]">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-6 py-8">
                <span className="font-[var(--font-display)] text-4xl font-bold leading-none tracking-tighter text-[var(--brand-accent)] md:text-6xl">
                  {step.number}
                </span>
                <div>
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
