import { ClientsSection } from "./clients-section";
import { CTA_PILL_CLASS, CheckList, FilterPill, HostCards, HostsStack, LandingHeader } from "./landing-ui";
import { PostulaForm } from "./postula-form";
import { SectionKicker } from "./section-kicker";

// Landing B de los anuncios (/postula). La A es /agenda. B es la versión FILTRADA: el
// formulario corta a quien no califica antes de pedir datos (postula-form.tsx), así que
// solo los calificados disparan el evento Lead.
//
// Rediseño + copy 2026-11-04. Estructura tomada de la página de workshop de Alex Hormozi
// (acquisition.com/workshop), que le habla exactamente a nuestro cliente (dueño que ya
// factura y es el cuello de botella):
//  1. Filtro + resultado en el título + el síntoma en una frase + CTA "Postula".
//  2. Prueba: logos de clientes reales.
//  3. Síntomas ("si eres el que más trabaja en tu empresa, ese es el problema").
//  4. Qué ordenamos (3 frentes).
//  5. Quiénes somos.
//  6. Es para ti / no es para ti (el que no califica se va solo, al Instagram de Felipe
//     y NO al diagnóstico, que también dispara Lead y ensuciaría la optimización).
//  7. Postulación (con el "qué pasa después" al lado) → FAQ → cierre.
//
// Todo lo que dice esta página es verdad hoy. NO hay testimonios ni cifras de resultados
// porque todavía no tenemos casos con permiso: cuando los haya, van en CASES (se muestran
// solos arriba del formulario). No inventar.

type Case = { name: string; company: string; result: string; quote: string };
const CASES: Case[] = [];

const INSTAGRAM_FELIPE = "https://instagram.com/nancupil.oficial";
const ANCHOR = "#postular";

const SYMPTOMS = [
  { title: "Vendes más, pero no sabes cuánto ganas.", body: "La caja sube y baja, y no tienes claro dónde se va la plata." },
  { title: "Todo pasa por ti.", body: "Si te tomas una semana, el negocio se detiene o se desordena." },
  { title: "Tu equipo apaga incendios.", body: "Cada uno hace lo que puede, sin roles ni metas claras." },
  { title: "Decides con intuición.", body: "No tienes números confiables para saber qué palanca mover." },
];

const PILLARS = [
  { n: "01", title: "Números", body: "Sabes cuánto ganas, dónde se va la plata y qué decisión mueve la aguja." },
  { n: "02", title: "Equipo y procesos", body: "Roles claros y una operación que funciona aunque tú no estés encima." },
  { n: "03", title: "Plan de crecimiento", body: "Metas concretas, prioridades y seguimiento para crecer con control." },
];

const FOR_YOU = [
  "Tu empresa factura sobre $10M al mes y ya tiene clientes y equipo.",
  "Sientes que el negocio depende demasiado de ti.",
  "Quieres un plan concreto y estás dispuesto a implementarlo.",
];
const NOT_FOR_YOU = [
  "Estás empezando o facturas menos de $10M al mes.",
  "Buscas una receta mágica para crecer sin cambiar nada.",
  "No tienes tiempo para ejecutar lo que se decida.",
];

const NEXT_STEPS = [
  { title: "Postulas", body: "Unas preguntas sobre tu negocio. Menos de 2 minutos." },
  { title: "Revisamos tu caso", body: "Si calificas, te escribimos por WhatsApp para coordinar." },
  { title: "Llamada de calibración", body: "30 minutos, sin costo. Te decimos sin vueltas si podemos ayudarte." },
];

const FAQ = [
  {
    q: "¿Cuánto cuesta la llamada?",
    a: "Nada. Son 30 minutos por videollamada para entender tu negocio y ver si tiene sentido trabajar juntos.",
  },
  {
    q: "¿Cuánto cuesta trabajar con ustedes?",
    a: "Depende de la etapa de tu empresa y de lo que haya que resolver. En la llamada te decimos si podemos ayudarte y, si es así, cómo y con qué inversión.",
  },
  {
    q: "¿Qué pasa si mi empresa factura menos de $10M al mes?",
    a: "Por ahora este proceso es solo para empresas sobre $10M al mes. Si estás bajo esa cifra, en el Instagram de Felipe compartimos gratis cómo ordenar los números y crecer.",
  },
  {
    q: "¿Trabajan solo con empresas de Santiago?",
    a: "No. Las llamadas y el trabajo se hacen por videollamada, así que atendemos empresas de todo Chile.",
  },
];

export function PostulaPage() {
  return (
    <main className="bg-[var(--brand-bg)]">
      <LandingHeader />

      {/* 1. Hero: filtro + resultado + síntoma + CTA. */}
      <section className="landing-hero px-4 pb-16 pt-24 md:px-6 md:pb-24 md:pt-40">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <FilterPill>
              <span className="md:hidden">Para empresas que facturan +$10M al mes</span>
              <span className="hidden md:inline">Para dueños de empresas que facturan sobre $10M al mes</span>
            </FilterPill>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tighter text-[var(--dark-ink)] md:text-7xl">
            Haz crecer tu empresa sin que todo dependa de ti.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--dark-muted)] md:text-xl">
            Ya construiste algo real: ventas, equipo y clientes. El problema es que todo sigue pasando por ti.
          </p>
          <a href={ANCHOR} className={CTA_PILL_CLASS + " mt-8"}>
            <span className="md:hidden">Postula a tu llamada</span>
            <span className="hidden md:inline">Postula a una llamada de calibración</span>
            <span aria-hidden="true">→</span>
          </a>
          <p className="mt-4 text-xs text-[var(--dark-muted)]">30 minutos · Sin costo · Revisamos cada postulación</p>
          <div className="mt-12">
            <HostsStack align="center" />
          </div>
        </div>
      </section>

      {/* 2. Prueba: clientes reales. */}
      <ClientsSection />

      {/* 3. Síntomas. */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>Te suena</SectionKicker>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            Si eres el que más trabaja en tu empresa, ese es el problema.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            {SYMPTOMS.map((s) => (
              <div
                key={s.title}
                className="rounded-[var(--ac-radius-md)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6"
              >
                <p className="text-base font-semibold tracking-tight text-[var(--brand-ink)]">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Qué ordenamos (bloque oscuro para cortar el ritmo). */}
      <section className="landing-hero px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker tone="dark">Qué hacemos</SectionKicker>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tighter text-[var(--dark-ink)] md:text-5xl">
            Ordenamos tu empresa para que crezca con control.
          </h2>
          <div className="mt-8 grid gap-8 md:mt-16 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.n} className="border-t border-[var(--dark-border)] pt-6">
                <span className="font-mono text-sm text-[var(--brand-accent)]">{p.n}</span>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-[var(--dark-ink)]">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dark-muted)] md:text-base">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Quiénes somos + 6. ¿Es para ti? */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionKicker>Quiénes somos</SectionKicker>
          <h2 className="mb-8 max-w-3xl text-3xl font-semibold leading-tight tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            Las personas detrás de Acelera.
          </h2>
          <HostCards />

          <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-2">
            <div className="rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 md:p-8">
              <p className="mb-6 text-lg font-semibold tracking-tight text-[var(--brand-ink)]">Es para ti si…</p>
              <CheckList items={FOR_YOU} />
            </div>
            <div className="rounded-[var(--ac-radius-lg)] border border-dashed border-[var(--brand-border)] p-6 md:p-8">
              <p className="mb-6 text-lg font-semibold tracking-tight text-[var(--brand-muted)]">No es para ti si…</p>
              <ul className="flex flex-col gap-4">
                {NOT_FOR_YOU.map((item) => (
                  <li key={item} className="flex gap-4 text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
                    <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-xs">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-[var(--brand-muted)]">
                ¿Recién partiendo?{" "}
                <a
                  href={INSTAGRAM_FELIPE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--brand-ink)] underline underline-offset-4"
                >
                  Sigue a Felipe en Instagram
                </a>
                : compartimos gratis cómo ordenar los números y crecer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Postulación. */}
      <section id="postular" className="scroll-mt-4 border-t border-[var(--brand-border)] bg-[var(--ac-graybg)] px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_minmax(0,32rem)] md:gap-16">
          <div className="md:pt-4">
            <SectionKicker>Postulación</SectionKicker>
            <h2 className="text-3xl font-semibold leading-tight tracking-tighter text-[var(--brand-ink)] md:text-5xl">
              Postula a tu llamada de calibración.
            </h2>

            {CASES.length > 0 ? (
              <div className="mt-8 flex flex-col gap-4">
                {CASES.map((c) => (
                  <figure key={c.name} className="rounded-[var(--ac-radius-md)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6">
                    <p className="text-sm font-semibold text-[var(--brand-primary)]">{c.result}</p>
                    <blockquote className="mt-2 text-sm leading-relaxed text-[var(--brand-ink)]">“{c.quote}”</blockquote>
                    <figcaption className="mt-4 text-xs text-[var(--brand-muted)]">
                      {c.name} · {c.company}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}

            <ol className="mt-8 flex flex-col gap-6">
              {NEXT_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-sm font-semibold text-[var(--brand-ink)]">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold tracking-tight text-[var(--brand-ink)]">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--brand-muted)]">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="self-start rounded-[var(--ac-radius-lg)] bg-[var(--brand-bg)] p-6 shadow-[var(--shadow-elevation)] ring-1 ring-[var(--brand-border)] md:p-8">
            <PostulaForm />
          </div>
        </div>
      </section>

      {/* 8. Preguntas frecuentes. */}
      <section className="px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-3xl">
          <SectionKicker>Preguntas frecuentes</SectionKicker>
          <div className="mt-4 divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-[var(--brand-ink)]">
                  {item.q}
                  <span aria-hidden="true" className="text-xl text-[var(--brand-muted)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Cierre. */}
      <section className="landing-hero px-4 py-16 text-center md:px-6 md:py-24">
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight tracking-tighter text-[var(--dark-ink)] md:text-5xl">
          ¿Listo para que tu empresa crezca sin depender de ti?
        </h2>
        <a href={ANCHOR} className={CTA_PILL_CLASS + " mt-8"}>
          Postula a una llamada de calibración
          <span aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}
