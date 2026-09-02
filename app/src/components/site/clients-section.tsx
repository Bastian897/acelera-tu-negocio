// Logos migrados desde el sitio anterior (aceleratunegocio.cl, WordPress) a
// pedido de Bastian — mismos clientes reales, solo trasladados al sitio nuevo.
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
  "viraly-32",
  "viraly-33",
  "viraly-34",
  "viraly-35",
  "viraly-36",
];

export function ClientsSection() {
  return (
    <section className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
          Empresas con las que hemos trabajado
        </h2>
        <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {CLIENT_LOGOS.map((logo) => (
            <div
              key={logo}
              className="flex aspect-square items-center justify-center rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4"
            >
              <img
                src={`assets/clients/${logo}.webp`}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
