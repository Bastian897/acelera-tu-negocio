type TeamMember = {
  photo: string;
  name: string;
  role: string;
  bio: string;
  handle?: string;
  followers?: string;
  href?: string;
};

const FOUNDERS: TeamMember[] = [
  {
    photo: "assets/team/felipe-nancupil.jpg",
    name: "Felipe Ñancupil",
    role: "Cofundador",
    bio: "El divulgador de contenido de emprendimiento más grande de Chile.",
    handle: "@nancupil.oficial",
    followers: "+900K",
    href: "https://instagram.com/nancupil.oficial",
  },
  {
    photo: "assets/team/ignacio-ruiz.jpg",
    name: "Ignacio Ruiz",
    role: "Cofundador",
    bio: "Fundador de +20 empresas.",
    handle: "@ignacioruizc",
    followers: "+500K",
    href: "https://instagram.com/ignacioruizc",
  },
  {
    photo: "assets/team/bastian-moreno-card.jpg",
    name: "Bastián Moreno",
    role: "Cofundador",
    bio: "Tecnología e IA.",
    handle: "@bastian_morenog",
    href: "https://instagram.com/bastian_morenog",
  },
];

function TeamCard({ member }: { member: TeamMember }) {
  const Wrapper = member.href ? "a" : "div";
  const wrapperProps = member.href
    ? { href: member.href, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)]"
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-[var(--brand-bg)]">
        <img
          src={member.photo}
          alt={member.name}
          className="absolute inset-0 h-full w-full object-cover object-top grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-accent)]">
            {member.role}
          </p>
          <h3 className="mt-1 text-xl font-medium tracking-tight text-[var(--brand-ink)]">
            {member.name}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[var(--brand-muted)]">{member.bio}</p>
        {member.handle ? (
          <div className="mt-2 flex items-center gap-2 border-t border-[var(--brand-border)] pt-3 text-xs text-[var(--brand-muted)]">
            <span>{member.handle}</span>
            {member.followers ? (
              <>
                <span className="text-[var(--brand-border)]">/</span>
                <span className="font-medium text-[var(--brand-ink)]">
                  {member.followers} seguidores
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </Wrapper>
  );
}

export function FoundersSection() {
  return (
    <section id="fundadores" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <h2 className="reveal-up max-w-xl text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Quiénes calibran el panel.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--brand-muted)]">
          Tres personas con negocio propio y tecnología real detrás de cada recomendación.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FOUNDERS.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
