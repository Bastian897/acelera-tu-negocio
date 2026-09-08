import { Link } from "@tanstack/react-router";
import { siteContent } from "../../lib/site-content";

const PROOF_POINTS = [
  {
    label: siteContent.resources.point1Label,
    detail: siteContent.resources.point1Detail,
  },
  {
    label: siteContent.resources.point2Label,
    detail: siteContent.resources.point2Detail,
  },
  {
    label: siteContent.resources.point3Label,
    detail: siteContent.resources.point3Detail,
  },
];

export function ResourcesSection() {
  return (
    <section id="recursos" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
          {siteContent.resources.kicker}
        </p>
        <h2 className="reveal-up mt-4 text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          {siteContent.resources.heading}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
          {siteContent.resources.paragraph}
        </p>

        <div className="mt-14 grid gap-8 text-left sm:grid-cols-3">
          {PROOF_POINTS.map((point) => (
            <div key={point.label} className="border-t border-[var(--brand-border)] pt-4">
              <p className="text-sm font-medium text-[var(--brand-ink)]">{point.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">{point.detail}</p>
            </div>
          ))}
        </div>

        <Link
          to="/diagnostico"
          className="mt-14 inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none"
        >
          {siteContent.resources.ctaText}
        </Link>
      </div>
    </section>
  );
}
