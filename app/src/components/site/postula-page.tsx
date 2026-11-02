import { ClientsSection } from "./clients-section";
import { PostulaForm } from "./postula-form";
import { SectionKicker } from "./section-kicker";
import { siteContent } from "../../lib/site-content";

// Versión B de la landing de los anuncios (/postula, 2026-11-02). La A es /agenda.
// Estructura tomada de lo que funciona en Haciéndola (Oski) y en las consultoras de alto
// valor de EE. UU. ("application funnel"):
//  1. Título que habla del resultado + filtro explícito arriba ("solo para…").
//  2. Prueba: logos de clientes reales y quiénes atienden.
//  3. "Es para ti / no es para ti": el que no califica se va solo (y se le ofrece el
//     diagnóstico gratis en vez de perderlo).
//  4. Qué pasa después de postular, en 3 pasos: baja la ansiedad de dejar los datos.
//  5. Postulación en 3 pasos (postula-form.tsx) y preguntas frecuentes.
//
// Todo lo que dice esta página es verdad hoy. NO hay testimonios ni cifras de resultados
// porque todavía no tenemos casos con permiso: cuando los haya, van en CASES (se muestran
// solos arriba del formulario). No inventar.

type Case = { name: string; company: string; result: string; quote: string };
const CASES: Case[] = [];

const FOR_YOU = [
  "Tu empresa factura sobre $10M al mes y ya tiene clientes y equipo.",
  "Vendes, pero no tienes claro cuánto ganas realmente ni dónde se te va la plata.",
  "Todo pasa por ti y el negocio no avanza si no estás encima.",
  "Quieres un plan concreto y estás dispuesto a implementarlo.",
];
const NOT_FOR_YOU = [
  "Estás empezando o tu empresa todavía factura menos de $10M al mes.",
  "Buscas una receta mágica para crecer sin cambiar nada.",
  "No tienes tiempo ni disposición para ejecutar lo que se decida.",
];

const STEPS = [
  { title: "Postulas", body: "Respondes unas preguntas sobre tu negocio. Toma menos de 2 minutos." },
  { title: "Revisamos tu caso", body: "El equipo lee tu postulación y te escribe por WhatsApp para coordinar la llamada." },
  {
    title: "Llamada de calibración",
    body: "30 minutos por videollamada, sin costo. Te decimos, sin vueltas, si podemos ayudarte y cómo.",
  },
];

const HOSTS = [
  { photo: "/assets/team/felipe-nancupil-card.webp", name: siteContent.founders.founder1Name, detail: siteContent.founders.founder1Bio },
  { photo: "/assets/team/ignacio-ruiz-card.webp", name: siteContent.founders.founder2Name, detail: siteContent.founders.founder2Bio },
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
    a: "Igual puedes postular: el equipo revisa tu caso y te escribe si hay una forma de ayudarte. También puedes empezar con nuestro diagnóstico gratuito.",
  },
  {
    q: "¿Qué tengo que preparar para la llamada?",
    a: "Nada especial. Si tienes a mano tus números aproximados (ventas, gastos, márgenes), la conversación rinde más.",
  },
  {
    q: "¿Trabajan solo con empresas de Santiago?",
    a: "No. Las llamadas y el trabajo se hacen por videollamada, así que atendemos empresas de todo Chile.",
  },
];

const ANCHOR = "#postular";

export function PostulaPage() {
  return (
    <main className="bg-[var(--brand-bg)]">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          {/* Logo claro (el mismo del footer): el encabezado va sobre el hero oscuro. */}
          <img src="/assets/brand/acelera-logo.svg" alt={siteContent.nav.brandText} width={130} height={45} className="h-9 w-auto" />
        </div>
      </header>

      {/* 1. Hero: resultado + filtro. */}
      <section className="bg-[var(--dark-bg)] px-6 pb-16 pt-28 md:pb-24 md:pt-36">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex rounded-[999px] border border-[var(--dark-border)] px-4 py-1.5 text-xs font-medium text-[var(--dark-muted)]">
            Solo para dueños de empresas que facturan sobre $10M al mes
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tighter text-[var(--dark-ink)] md:text-6xl">
            Tu empresa ya vende. Ahora hay que hacerla crecer con control.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[var(--dark-muted)] md:text-lg">
            Dirección y consultoría estratégica para ordenar tus números, tu equipo y tus ventas, y dejar de ser el cuello de
            botella de tu propio negocio.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href={ANCHOR}
              className="inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-8 py-3.5 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none"
            >
              Postula a una llamada de calibración
            </a>
            <p className="text-xs text-[var(--dark-muted)]">30 minutos · Sin costo · Revisamos cada postulación</p>
          </div>
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="flex -space-x-3">
              {HOSTS.map((host) => (
                <img
                  key={host.name}
                  src={host.photo}
                  alt={host.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full border-2 border-[var(--dark-bg)] object-cover"
                />
              ))}
            </div>
            <p className="text-left text-xs leading-snug text-[var(--dark-muted)]">
              Con {siteContent.founders.founder1Name} e {siteContent.founders.founder2Name}
              <br />
              {siteContent.founders.founder2Bio}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Prueba: clientes reales. */}
      <ClientsSection />

      {/* 3. ¿Es para ti? */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionKicker>Antes de postular</SectionKicker>
          <h2 className="text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-4xl">¿Es para ti?</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 md:p-8">
              <p className="text-sm font-semibold text-[var(--brand-ink)]">Es para ti si…</p>
              <ul className="mt-4 flex flex-col gap-3">
                {FOR_YOU.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--brand-ink)]">
                    <span aria-hidden="true" className="mt-0.5 font-semibold text-[var(--ac-good)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] p-6 md:p-8">
              <p className="text-sm font-semibold text-[var(--brand-ink)]">No es para ti si…</p>
              <ul className="mt-4 flex flex-col gap-3">
                {NOT_FOR_YOU.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--brand-muted)]">
                    <span aria-hidden="true" className="mt-0.5 font-semibold">
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-relaxed text-[var(--brand-muted)]">
                ¿Recién partiendo?{" "}
                <a href="/diagnostico" className="font-medium text-[var(--brand-primary)] underline-offset-4 hover:underline">
                  Haz el diagnóstico gratuito
                </a>{" "}
                y recibe un informe de tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Qué pasa después. */}
      <section className="border-y border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <SectionKicker>Cómo funciona</SectionKicker>
          <h2 className="text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-4xl">Qué pasa cuando postulas</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[var(--brand-primary)]">0{i + 1}</span>
                <p className="text-lg font-semibold tracking-tight text-[var(--brand-ink)]">{s.title}</p>
                <p className="text-sm leading-relaxed text-[var(--brand-muted)]">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. Postulación. */}
      <section id="postular" className="scroll-mt-4 px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_minmax(0,32rem)] md:gap-16">
          <div className="md:pt-4">
            <SectionKicker>Postulación</SectionKicker>
            <h2 className="text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-4xl">
              Postula a tu llamada de calibración.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
              {siteContent.contact.paragraph}
            </p>

            {CASES.length > 0 ? (
              <div className="mt-8 flex flex-col gap-4">
                {CASES.map((c) => (
                  <figure key={c.name} className="rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
                    <p className="text-sm font-semibold text-[var(--brand-primary)]">{c.result}</p>
                    <blockquote className="mt-2 text-sm leading-relaxed text-[var(--brand-ink)]">“{c.quote}”</blockquote>
                    <figcaption className="mt-3 text-xs text-[var(--brand-muted)]">
                      {c.name} · {c.company}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-4">
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
          </div>

          <div className="self-start rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-bg)] p-6 shadow-[var(--shadow-elevation)] md:p-8">
            <PostulaForm />
          </div>
        </div>
      </section>

      {/* 6. Preguntas frecuentes. */}
      <section className="px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <SectionKicker>Preguntas frecuentes</SectionKicker>
          <div className="mt-2 divide-y divide-[var(--brand-border)] border-y border-[var(--brand-border)]">
            {FAQ.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--brand-ink)]">
                  {item.q}
                  <span aria-hidden="true" className="text-lg text-[var(--brand-muted)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Cierre. */}
      <section className="bg-[var(--dark-bg)] px-6 py-16 text-center md:py-20">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tighter text-[var(--dark-ink)] md:text-4xl">
          Crecer sin control sale caro. Ordenarlo empieza con una llamada.
        </h2>
        <a
          href={ANCHOR}
          className="mt-8 inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-8 py-3.5 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none"
        >
          Postula a una llamada de calibración
        </a>
      </section>
    </main>
  );
}
