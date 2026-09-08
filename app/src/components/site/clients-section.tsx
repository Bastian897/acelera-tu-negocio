import { siteContent } from "../../lib/site-content";

// Logos migrados desde el sitio anterior (aceleratunegocio.cl, WordPress) a
// pedido de Bastian — mismos clientes reales, solo trasladados al sitio nuevo.
// "viraly-32" (Hotumatur Rapanui) se sacó de la lista a pedido explícito.
const CLIENT_LOGOS = [
  "viraly-02",
  "viraly-03",
  "viraly-04",
  "viraly-05",
  "viraly-06",
  "viraly-07",
  "viraly-08",
  "viraly-09",
  "viraly-22",
  "viraly-23",
  "viraly-25",
  "viraly-26",
  "viraly-28",
  "viraly-29",
  "viraly-30",
  "viraly-31",
  "viraly-33",
  "viraly-34",
  "viraly-35",
  "viraly-36",
];

// Carrusel horizontal continuo (patrón "logo marquee", pedido explícito de
// Bastian: "como lo tienen los de indies", indies.la) en vez de la grilla
// estática anterior. La lista se duplica una vez: la animación traslada la
// pista exactamente -50% de su ancho total, así el segundo tramo (idéntico
// al primero) entra justo cuando el primero termina de salir — el loop se ve
// perfectamente continuo sin ningún salto.
const MARQUEE_LOGOS = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

function LogoTile({ logo }: { logo: string }) {
  return (
    <div className="flex aspect-square w-32 shrink-0 items-center justify-center rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 sm:w-36">
      <img src={`assets/clients/${logo}.webp`} alt="" loading="lazy" className="h-full w-full object-contain" />
    </div>
  );
}

export function ClientsSection() {
  return (
    <section className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
          {siteContent.clients.heading}
        </h2>
      </div>

      {/* Full-bleed (no max-w) a propósito — el scroll infinito se siente
       * genuinamente "sin límites" solo si no queda encajonado en el
       * mismo ancho de lectura que el resto de la página. El fade en los
       * bordes (mask-image) es lo que evita que un logo se vea cortado a
       * la mitad al entrar o salir. */}
      <div
        className="relative mt-10 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="clients-marquee-track flex w-max gap-6 px-6">
          {MARQUEE_LOGOS.map((logo, i) => (
            <LogoTile key={`${logo}-${i}`} logo={logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
