import { BrandIcon } from "./icon";
import { SectionKicker } from "./section-kicker";

const SERVICES = [
  {
    icon: "assets/icons/icon-direccion.png",
    title: "Dirección estratégica",
    body: "Planificación financiera, reducción de costos y generación de oportunidades comerciales para fortalecer tu estrategia de marketing.",
  },
  {
    icon: "assets/icons/icon-consultoria.png",
    title: "Consultoría ejecutiva",
    body: "Diseño e implementación de proyectos en ventas, marketing, finanzas y operaciones, con seguimiento de KPIs.",
  },
  {
    icon: "assets/icons/icon-produccion-video.png",
    title: "Producción de video",
    body: "Reels para retail, contenido UGC y videos promocionales para restaurantes y gastronomía.",
  },
];

export function ServicesSection() {
  return (
    <section id="servicios" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionKicker>Servicios</SectionKicker>
        <h2 className="reveal-up max-w-2xl text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Tres instrumentos. Un mismo panel.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-[1.3fr_1fr] md:items-stretch">
          <figure className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-[var(--brand-border)]">
            <img
              src="assets/plates/servicios-texture.jpg"
              alt="Detalle macro de un instrumento de precisión de acero cepillado"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-bg)] via-[var(--dark-bg)]/20 to-transparent" />
            <figcaption className="relative flex h-full items-end p-8">
              <p className="max-w-xs text-xl font-medium leading-snug tracking-tight text-[var(--dark-ink)]">
                Cada servicio calibrado a la etapa real de tu negocio.
              </p>
            </figcaption>
          </figure>

          <div className="flex flex-col gap-4">
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className="flex flex-1 flex-col justify-between gap-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-[var(--shadow-elevation)]"
              >
                <BrandIcon src={service.icon} />
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-[var(--brand-ink)]">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">
                    {service.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
