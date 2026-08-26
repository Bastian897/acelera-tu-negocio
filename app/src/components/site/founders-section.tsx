const FOUNDERS = [
  {
    photo: "assets/team/felipe-nancupil.png",
    name: "Felipe Ñancupil",
    role: "Cofundador",
    bio: "El divulgador de contenido de emprendimiento más grande de Chile.",
    handle: "@nancupil.oficial",
    followers: "+900K",
    href: "https://instagram.com/nancupil.oficial",
  },
  {
    photo: "assets/team/ignacio-ruiz.png",
    name: "Ignacio Ruiz",
    role: "Cofundador",
    bio: "Fundador de +20 empresas y ex-millonario.",
    handle: "@ignacioruizc",
    followers: "+500K",
    href: "https://instagram.com/ignacioruizc",
  },
];

export function FoundersSection() {
  return (
    <section id="fundadores" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <h2 className="reveal-up max-w-xl text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Quiénes calibran el panel.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--brand-muted)]">
          Dos personas con negocio propio y comunidad real detrás de cada recomendación.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {FOUNDERS.map((founder) => (
            <a
              key={founder.name}
              href={founder.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] sm:flex-row"
            >
              <div className="relative h-72 shrink-0 overflow-hidden bg-[var(--brand-bg)] sm:h-auto sm:w-56">
                <img
                  src={founder.photo}
                  alt={founder.name}
                  className="absolute inset-0 h-full w-full object-cover object-top grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-surface)] via-transparent to-transparent sm:bg-gradient-to-r" />
              </div>

              <div className="flex flex-1 flex-col justify-center gap-3 p-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--brand-accent)]">
                    {founder.role}
                  </p>
                  <h3 className="mt-1 text-xl font-medium tracking-tight text-[var(--brand-ink)]">
                    {founder.name}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--brand-muted)]">{founder.bio}</p>
                <div className="mt-2 flex items-center gap-2 border-t border-[var(--brand-border)] pt-3 text-xs text-[var(--brand-muted)]">
                  <span>{founder.handle}</span>
                  <span className="text-[var(--brand-border)]">/</span>
                  <span className="font-medium text-[var(--brand-ink)]">{founder.followers} seguidores</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
