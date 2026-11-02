import { ClientsSection } from "./clients-section";
import { LlamadaForm } from "./llamada-form";
import { SectionKicker } from "./section-kicker";
import { siteContent } from "../../lib/site-content";

// Landing de los anuncios de Meta (/agenda y /solicitud, ver routes/): una sola acción,
// pedir la llamada de calibración, sin menú. /solicitud es la misma página sin elegir
// horario (withAgenda={false}): es la que van a usar los anuncios. Fotos de Felipe e
// Ignacio porque son quienes aparecen en los anuncios.
const CALL_POINTS = [
  "Revisamos tus números y dónde está la fricción real de tu negocio.",
  "Te decimos, sin vueltas, si podemos ayudarte y cómo.",
  "Si no somos la mejor opción para ti, también te lo decimos.",
];

const HOSTS = [
  { photo: "/assets/team/felipe-nancupil-card.webp", name: siteContent.founders.founder1Name, detail: "+900K en Instagram" },
  { photo: "/assets/team/ignacio-ruiz-card.webp", name: siteContent.founders.founder2Name, detail: siteContent.founders.founder2Bio },
];

export function AgendaPage({ withAgenda = true }: { withAgenda?: boolean } = {}) {
  return (
    <main className="bg-[var(--brand-bg)]">
      <header className="border-b border-[var(--brand-border)] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <img src="/assets/brand/acelera-icon-ink.svg" alt="" className="h-7 w-7" width={28} height={28} />
          <span className="ml-2 text-sm font-semibold tracking-tight text-[var(--brand-ink)]">{siteContent.nav.brandText}</span>
        </div>
      </header>

      <section className="px-6 py-12 md:py-20">
        {/* Móvil: título → formulario → detalles, para que quien llega desde un anuncio vea
         * el formulario sin tener que bajar tanto. Escritorio: título y detalles a la
         * izquierda, formulario a la derecha ocupando las dos filas. */}
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_minmax(0,34rem)] md:grid-rows-[auto_1fr] md:gap-x-16 md:gap-y-0">
          <div className="md:col-start-1 md:row-start-1 md:pt-4">
            <SectionKicker>Llamada de calibración</SectionKicker>
            <h1 className="text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
              {withAgenda ? siteContent.contact.heading : "Solicita tu llamada de calibración."}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
              {siteContent.contact.paragraph}
            </p>
          </div>

          <div className="self-start rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-bg)] p-6 shadow-[var(--shadow-elevation)] md:col-start-2 md:row-span-2 md:row-start-1 md:p-8">
            <LlamadaForm withAgenda={withAgenda} />
          </div>

          <div className="md:col-start-1 md:row-start-2">
            <ul className="flex flex-col gap-3 md:mt-8">
              {CALL_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-relaxed text-[var(--brand-ink)]">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)]" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4">
              {HOSTS.map((host) => (
                <div key={host.name} className="flex items-center gap-4">
                  <img
                    src={host.photo}
                    alt={host.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-full border border-[var(--brand-border)] object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--brand-ink)]">{host.name}</p>
                    <p className="text-xs text-[var(--brand-muted)]">{host.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 max-w-lg text-xs leading-relaxed text-[var(--brand-muted)]">{siteContent.results.paragraph}</p>
          </div>
        </div>
      </section>

      <ClientsSection />
    </main>
  );
}
