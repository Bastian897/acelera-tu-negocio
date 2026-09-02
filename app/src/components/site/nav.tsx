import { useState } from "react";

import { PrimaryCta } from "./cta";

const LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#fundadores", label: "Equipo" },
  { href: "#proceso", label: "Cómo trabajamos" },
  { href: "#casos", label: "Casos" },
  { href: "#recursos", label: "Diagnóstico" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--brand-border)] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2" aria-label="Acelera tu Negocio">
          <img
            src="assets/brand/acelera-icon-ink.svg"
            alt=""
            className="h-7 w-7"
            width={28}
            height={28}
          />
          <span className="hidden text-sm font-semibold tracking-tight text-[var(--brand-ink)] sm:inline">
            Acelera tu Negocio
          </span>
        </a>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <PrimaryCta className="!px-5 !py-2.5 text-[13px]" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-border)] text-[var(--brand-ink)] md:hidden"
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 h-px w-4 bg-current transition-transform duration-200 ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-1.5 h-px w-4 bg-current transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 h-px w-4 bg-current transition-transform duration-200 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      {open ? (
        <nav
          aria-label="Principal móvil"
          className="flex flex-col gap-1 border-t border-[var(--brand-border)]/60 bg-[var(--brand-bg)] px-6 py-4 md:hidden"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-[var(--brand-muted)]"
            >
              {link.label}
            </a>
          ))}
          <PrimaryCta className="mt-3 w-full" />
        </nav>
      ) : null}
    </header>
  );
}
