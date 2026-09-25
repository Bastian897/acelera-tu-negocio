import { useState } from "react";
import { Link } from "@tanstack/react-router";

import { PrimaryCta } from "./cta";
import { siteContent } from "../../lib/site-content";

const LINKS = [
  { href: "#servicios", label: siteContent.nav.link1 },
  { href: "#fundadores", label: siteContent.nav.link2 },
  { href: "#proceso", label: siteContent.nav.link3 },
  { href: "#casos", label: siteContent.nav.link4 },
  { href: "#recursos", label: siteContent.nav.link5 },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--brand-border)] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Acelera tu Negocio">
          <img
            src="assets/brand/acelera-icon-ink.svg"
            alt=""
            data-nav-logo-icon=""
            className="h-7 w-7"
            width={28}
            height={28}
          />
          <span className="hidden text-sm font-semibold tracking-tight text-[var(--brand-ink)] sm:inline">
            {siteContent.nav.brandText}
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to="/"
              hash={link.href.slice(1)}
              className="relative text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
            >
              {link.label}
            </Link>
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
            <Link
              key={link.href}
              to="/"
              hash={link.href.slice(1)}
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-[var(--brand-muted)]"
            >
              {link.label}
            </Link>
          ))}
          <PrimaryCta className="mt-3 w-full" />
        </nav>
      ) : null}
    </header>
  );
}
