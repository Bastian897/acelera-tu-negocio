import { InstagramLogo } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { BrandIcon } from "./icon";
import { openAceleraChat } from "./chat-widget";
import { siteContent } from "../../lib/site-content";

const COLUMNS = [
  {
    title: "Servicios",
    links: [
      { href: "#servicios", label: "Dirección estratégica" },
      { href: "#servicios", label: "Consultoría ejecutiva" },
      { href: "#servicios", label: "Automatización con IA" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "#fundadores", label: "Equipo" },
      { href: "#proceso", label: "Cómo trabajamos" },
      { href: "#casos", label: "A quién ayudamos" },
      { href: "#recursos", label: "Diagnóstico" },
    ],
  },
  {
    title: "Contacto",
    links: [
      {
        href: "#contacto",
        openChat: true,
        icon: "assets/icons/icon-agendar.png",
        label: "Agendar llamada",
      },
      {
        href: "mailto:contacto@aceleratunegocio.cl",
        icon: "assets/icons/icon-email.png",
        label: "contacto@aceleratunegocio.cl",
      },
      {
        href: "https://www.instagram.com/acelera.cl/",
        label: "@acelera.cl",
        instagram: true,
      },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--dark-bg)] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img
              src="assets/brand/acelera-logo.svg"
              alt="Acelera tu Negocio"
              className="h-9 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--dark-muted)]">
              {siteContent.footer.tagline}
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-accent)]">
                {column.title}
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {column.links.map((link) =>
                  "openChat" in link && link.openChat ? (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => openAceleraChat()}
                        className="inline-flex items-center gap-2 text-sm text-[var(--dark-ink)]/90 transition-colors hover:text-[var(--brand-accent)]"
                      >
                        {"icon" in link && link.icon ? (
                          <BrandIcon src={link.icon} color="var(--dark-muted)" size={14} />
                        ) : null}
                        {link.label}
                      </button>
                    </li>
                  ) : link.href.startsWith("#") ? (
                    <li key={link.label}>
                      <Link
                        to="/"
                        hash={link.href.slice(1)}
                        className="inline-flex items-center gap-2 text-sm text-[var(--dark-ink)]/90 transition-colors hover:text-[var(--brand-accent)]"
                      >
                        {"icon" in link && link.icon ? (
                          <BrandIcon src={link.icon} color="var(--dark-muted)" size={14} />
                        ) : null}
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-flex items-center gap-2 text-sm text-[var(--dark-ink)]/90 transition-colors hover:text-[var(--brand-accent)]"
                      >
                        {"icon" in link && link.icon ? (
                          <BrandIcon src={link.icon} color="var(--dark-muted)" size={14} />
                        ) : null}
                        {"instagram" in link && link.instagram ? (
                          <InstagramLogo
                            size={15}
                            aria-label="Instagram"
                            className="text-[var(--dark-muted)]"
                          />
                        ) : null}
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-[var(--dark-border)] pt-6 text-xs text-[var(--dark-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteContent.nav.brandText}. Todos los derechos reservados.
          </p>
          <p>{siteContent.footer.location}</p>
        </div>
      </div>
    </footer>
  );
}
