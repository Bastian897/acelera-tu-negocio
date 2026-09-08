import { siteContent } from "../../lib/site-content";

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
  return (
    <section id="proceso" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="reveal-up max-w-md text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            {siteContent.process.heading}
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
