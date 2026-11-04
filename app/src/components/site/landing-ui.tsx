import { type ReactNode } from "react";

import { siteContent } from "../../lib/site-content";

// Piezas compartidas de las landings de anuncios (/agenda y /postula, rediseño
// 2026-11-04 para que se vean premium). Escala de espaciado 4/8/16/24/32, un solo
// acento (el azul de marca, solo en la acción principal) y grises; el cyan queda para
// los kickers, igual que en el resto del sitio.

export const HOSTS = [
  {
    photo: "/assets/team/felipe-nancupil-card.webp",
    name: siteContent.founders.founder1Name,
    role: "+900K seguidores en Instagram",
  },
  {
    photo: "/assets/team/ignacio-ruiz-card.webp",
    name: siteContent.founders.founder2Name,
    role: siteContent.founders.founder2Bio,
  },
];

export const CTA_PILL_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-[999px] bg-[var(--brand-primary)] px-8 py-4 text-base font-semibold text-[var(--ac-white)] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_16px_40px_-12px_rgb(1_11_248/0.7)] transition-transform duration-150 hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none";

/** Encabezado mínimo sobre el hero oscuro: solo el logo, sin menú (no hay salidas). */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4 md:px-6">
        <img src="/assets/brand/acelera-logo.svg" alt={siteContent.nav.brandText} width={116} height={40} className="h-8 w-auto" />
      </div>
    </header>
  );
}

/** El filtro arriba del título: a quién le habla la página. */
export function FilterPill({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-[999px] border border-[var(--dark-border)] bg-[rgb(255_255_255/0.04)] px-4 py-2 text-xs font-medium text-[var(--dark-ink)] backdrop-blur">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--brand-accent)]" />
      {children}
    </p>
  );
}

/** Fotos superpuestas + quiénes atienden (sobre fondo oscuro). */
export function HostsStack({ align = "left" }: { align?: "left" | "center" }) {
  return (
    <div className={"flex items-center gap-4 " + (align === "center" ? "justify-center" : "")}>
      <div className="flex -space-x-2">
        {HOSTS.map((host) => (
          <img
            key={host.name}
            src={host.photo}
            alt={host.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border-2 border-[var(--ac-ink)] object-cover"
          />
        ))}
      </div>
      <p className="text-left text-xs leading-snug text-[var(--dark-muted)]">
        <span className="font-semibold text-[var(--dark-ink)]">
          {HOSTS[0].name} e {HOSTS[1].name}
        </span>
        <br />
        {HOSTS[0].role} · {HOSTS[1].role}
      </p>
    </div>
  );
}

/** Tarjetas grandes de quiénes atienden (sobre fondo claro). */
export function HostCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {HOSTS.map((host) => (
        <figure
          key={host.name}
          className="flex items-center gap-4 rounded-[var(--ac-radius-md)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4"
        >
          <img src={host.photo} alt={host.name} width={64} height={64} className="h-16 w-16 rounded-[12px] object-cover" />
          <figcaption>
            <p className="text-base font-semibold tracking-tight text-[var(--brand-ink)]">{host.name}</p>
            <p className="mt-1 text-sm text-[var(--brand-muted)]">{host.role}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Lista con marca de verificación sobria (sin verde: el acento es solo el CTA). */
export function CheckList({ items, tone = "light" }: { items: readonly string[]; tone?: "light" | "dark" }) {
  const text = tone === "dark" ? "text-[var(--dark-ink)]" : "text-[var(--brand-ink)]";
  const mark =
    tone === "dark"
      ? "border-[var(--dark-border)] text-[var(--brand-accent)]"
      : "border-[var(--brand-border)] text-[var(--brand-primary)]";
  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item} className={"flex gap-4 text-sm leading-relaxed md:text-base " + text}>
          <span
            aria-hidden="true"
            className={"mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold " + mark}
          >
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
