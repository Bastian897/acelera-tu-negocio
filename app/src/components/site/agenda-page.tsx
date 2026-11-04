import { ClientsSection } from "./clients-section";
import { CheckList, FilterPill, HostCards, HostsStack, LandingHeader } from "./landing-ui";
import { LlamadaForm } from "./llamada-form";
import { SectionKicker } from "./section-kicker";
import { siteContent } from "../../lib/site-content";

// Landing A de los anuncios de Meta (/agenda, ver routes/agenda.tsx): una sola acción,
// pedir la llamada de calibración, sin menú. Publicada con withAgenda={false} (sin elegir
// horario, 2026-11-02); withAgenda={true} es la versión con agenda directa, guardada.
//
// Rediseño 2026-11-04 (feedback de Fernando: el formulario tiene que verse en la primera
// pantalla y hay demasiado texto). Copy inspirado en la página de workshop de Hormozi
// (acquisition.com/workshop): filtro arriba ("dueños de empresas sobre X"), el resultado
// que quiere el dueño en el título y nada más antes del formulario. En móvil: filtro →
// título → formulario. Fotos de Felipe e Ignacio porque son quienes aparecen en los anuncios.
const CALL_POINTS = [
  "Revisamos tus números y dónde se está trabando tu crecimiento.",
  "Te decimos, sin vueltas, si podemos ayudarte y cómo.",
  "Si no somos la mejor opción para ti, también te lo decimos.",
];

export function AgendaPage({ withAgenda = true }: { withAgenda?: boolean } = {}) {
  return (
    <main className="bg-[var(--brand-bg)]">
      <LandingHeader />

      <section className="landing-hero px-4 pb-16 pt-20 md:px-6 md:pb-24 md:pt-32">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_minmax(0,32rem)] md:grid-rows-[auto_1fr] md:gap-x-16 md:gap-y-0">
          <div className="md:col-start-1 md:row-start-1">
            <FilterPill>
              <span className="md:hidden">Para empresas que facturan +$10M al mes</span>
              <span className="hidden md:inline">Para dueños de empresas que facturan sobre $10M al mes</span>
            </FilterPill>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-tighter text-[var(--dark-ink)] md:mt-6 md:text-6xl">
              {withAgenda ? siteContent.contact.heading : "Haz crecer tu empresa sin que todo dependa de ti."}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--dark-muted)] md:text-lg">
              <span className="md:hidden">Llamada de calibración · 30 minutos · Sin costo</span>
              <span className="hidden md:inline">
                Pide una llamada de calibración de 30 minutos, sin costo. Revisamos tu negocio y te decimos si podemos
                ayudarte a crecer con control.
              </span>
            </p>
          </div>

          <div className="self-start rounded-[var(--ac-radius-lg)] bg-[var(--brand-bg)] p-6 shadow-[0_32px_64px_-24px_rgb(0_0_0/0.6)] ring-1 ring-[rgb(255_255_255/0.1)] md:col-start-2 md:row-span-2 md:row-start-1 md:p-8">
            <p className="text-lg font-semibold tracking-tight text-[var(--brand-ink)]">Solicita tu llamada</p>
            <p className="mb-6 mt-1 text-sm text-[var(--brand-muted)]">Toma 2 minutos. Te escribimos por WhatsApp.</p>
            <LlamadaForm withAgenda={withAgenda} />
          </div>

          <div className="flex flex-col gap-8 md:col-start-1 md:row-start-2 md:mt-8">
            <div className="hidden md:block">
              <CheckList items={CALL_POINTS} tone="dark" />
            </div>
            <HostsStack />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:hidden">
        <SectionKicker>En la llamada</SectionKicker>
        <CheckList items={CALL_POINTS} />
      </section>

      <section className="hidden px-6 py-24 md:block">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>Quiénes somos</SectionKicker>
          <h2 className="mb-8 max-w-2xl text-4xl font-semibold tracking-tighter text-[var(--brand-ink)]">
            Las personas detrás de Acelera.
          </h2>
          <HostCards />
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-[var(--brand-muted)]">{siteContent.results.paragraph}</p>
        </div>
      </section>

      <ClientsSection />
    </main>
  );
}
