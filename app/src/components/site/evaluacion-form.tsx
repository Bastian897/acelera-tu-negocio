import { useState, type FormEvent, type ReactNode } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { SubmitCta } from "./cta";

// Formulario oculto /evaluacion (sin link desde la landing): Ignacio Ruiz se lo manda a
// leads que le llegan por otros medios. Cada envío le llega por correo con un Word (las
// respuestas tal cual) y un PDF ejecutivo con un puntaje de calce; la persona recibe un
// correo de confirmación. Las preguntas y las opciones tienen que calzar EXACTO con
// backend/acelera-backend/src/lib/evaluacion.ts (el puntaje se calcula por texto de opción).

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none transition-colors placeholder:text-[var(--brand-muted)]/60 focus-visible:border-[var(--brand-primary)] focus-visible:ring-4 focus-visible:ring-[var(--brand-primary)]/10";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";

const YEARS_OPTIONS = ["Menos de 1 año", "1-3 años", "3-5 años", "5-10 años", "Más de 10 años"];
const TEAM_SIZE_OPTIONS = ["Solo yo", "2-5 personas", "6-15 personas", "16-50 personas", "Más de 50 personas"];
const REVENUE_OPTIONS = [
  "Menos de $5M CLP",
  "$5M - $10M CLP",
  "$10M - $20M CLP",
  "$20M - $50M CLP",
  "$50M - $150M CLP",
  "Sobre $150M CLP",
  "Prefiero no decirlo",
];
const GOAL_OPTIONS = [
  "Vender más",
  "Ordenar la operación",
  "Mejorar rentabilidad y finanzas",
  "Escalar el equipo",
  "Automatizar procesos con IA",
  "Preparar la empresa para crecer o vender",
];
const URGENCY_OPTIONS = ["Lo necesito ya", "En 1 a 3 meses", "En 3 a 6 meses", "Solo estoy explorando"];
const DECISION_OPTIONS = ["Sí, decido yo", "Decido junto a un socio o directorio", "No, decide otra persona"];
const BUDGET_OPTIONS = [
  "Menos de $500 mil al mes",
  "$500 mil - $1M al mes",
  "$1M - $2M al mes",
  "Más de $2M al mes",
  "Aún no lo tengo claro",
];
const SOURCE_OPTIONS = ["Referido / recomendación", "Evento o charla", "LinkedIn", "Instagram", "WhatsApp", "Otro"];

// Obligatorios, para la barra de avance (los mismos `required` del backend).
const REQUIRED = [
  "name", "role", "email", "phone",
  "companyName", "industry", "yearsOperating", "teamSize", "revenue",
  "problem", "goal",
  "urgency", "decisionRole", "budget", "source",
];

type Status = "idle" | "loading" | "done" | "error";

function Field({ id, label, optional, children }: { id: string; label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {optional ? <span className="ml-1 normal-case tracking-normal text-[var(--brand-muted)]/70">(opcional)</span> : null}
      </label>
      {children}
    </div>
  );
}

/** Opciones como pastillas (radio) en vez de <select>: se responden con un toque en el
 * celular y se ve todo de una. `required` en el primer radio basta para el grupo. */
function Pills({
  name,
  label,
  options,
  onSelect,
}: {
  name: string;
  label: string;
  options: string[];
  onSelect?: (value: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2.5" onChange={onSelect ? (e) => onSelect((e.target as unknown as HTMLInputElement).value) : undefined}>
      <legend className={LABEL_CLASS + " mb-2.5"}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => (
          <label key={option} className="cursor-pointer">
            <input type="radio" name={name} value={option} required={i === 0} className="peer sr-only" />
            <span className="inline-flex min-h-10 items-center rounded-[999px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-primary)]/50 peer-checked:border-[var(--brand-primary)] peer-checked:bg-[var(--brand-primary)] peer-checked:text-[var(--ac-white)] peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--brand-primary)]/20">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Section({ n, title, hint, children }: { n: number; title: string; hint: string; children: ReactNode }) {
  return (
    <section className="border-t border-[var(--brand-border)] pt-8 first-of-type:border-t-0 first-of-type:pt-0">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ac-blue-soft)] text-sm font-semibold text-[var(--brand-primary)]">
          {n}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--brand-ink)]">{title}</h2>
          <p className="mt-0.5 text-sm text-[var(--brand-muted)]">{hint}</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function EvaluacionForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [person, setPerson] = useState({ name: "", email: "" });
  const [source, setSource] = useState("");

  function updateProgress(form: HTMLFormElement) {
    const data = new FormData(form);
    const filled = REQUIRED.filter((key) => String(data.get(key) ?? "").trim()).length;
    setProgress(filled / REQUIRED.length);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)]));

    try {
      const res = await fetch(`${BACKEND_URL}/api/evaluacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request_failed");
      setPerson({ name: (payload.name ?? "").split(" ")[0] ?? "", email: payload.email ?? "" });
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--ac-graybg)]">
      {/* Banda superior tinta con el logo, mismo lenguaje que la portada de los PDFs. */}
      <header className="relative overflow-hidden bg-[var(--ac-ink)] px-4 pb-28 pt-8 sm:px-6 md:pb-36 md:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[var(--brand-primary)] opacity-25 blur-[120px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-[-120px] h-[320px] w-[320px] rounded-full bg-[var(--brand-accent)] opacity-15 blur-[110px]"
        />
        <div className="relative mx-auto max-w-2xl">
          <img src="/assets/brand/acelera-logo.svg" alt="Acelera" width={150} height={52} className="h-11 w-auto md:h-12" />
          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
            {status === "done" ? "Solicitud recibida" : "Evaluación de negocio"}
          </p>
          <span aria-hidden="true" className="mt-2 block h-[3px] w-10 rounded-full bg-[var(--brand-accent)]" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tighter text-[var(--ac-white)] md:text-5xl">
            {status === "done" ? `¡Gracias${person.name ? `, ${person.name}` : ""}!` : "Cuéntanos de tu negocio."}
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65 md:text-base">
            {status === "done"
              ? "Recibimos tus respuestas correctamente."
              : "Ignacio Ruiz revisará tus respuestas personalmente antes de conversar contigo. Te toma unos 4 minutos."}
          </p>
        </div>
      </header>

      <main className="relative mx-auto -mt-20 max-w-2xl px-4 pb-16 sm:px-6 md:-mt-24">
        <div className="rounded-[24px] bg-[var(--brand-surface)] p-6 shadow-[0_24px_60px_-20px_rgb(1_12_40_/_0.25)] sm:p-10">
          {status === "done" ? (
            <div className="flex flex-col items-start gap-5 py-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ac-good-soft)] text-[var(--ac-good)]">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--brand-ink)]">Ignacio Ruiz te contactará pronto.</h2>
              <p className="text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
                Va a revisar tu información y te escribirá por WhatsApp o correo para coordinar una conversación.
                {person.email ? (
                  <>
                    {" "}Te enviamos una confirmación a <strong className="text-[var(--brand-ink)]">{person.email}</strong>.
                  </>
                ) : null}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              onChange={(e) => updateProgress(e.currentTarget)}
              className="flex flex-col gap-10"
            >
              {/* Avance: se queda pegado arriba mientras se baja por el formulario. */}
              <div className="sticky top-0 z-10 -mx-6 -mt-6 rounded-t-[24px] bg-[var(--brand-surface)]/95 px-6 pb-4 pt-6 backdrop-blur sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-8">
                <div className="flex items-center justify-between text-xs text-[var(--brand-muted)]">
                  <span>Tu avance</span>
                  <span className="font-semibold text-[var(--brand-primary)]">{Math.round(progress * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ac-graybg)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-primary)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              {/* Trampa para bots: invisible para personas, un bot la rellena. */}
              <input type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

              <Section n={1} title="Sobre ti" hint="Para saber con quién vamos a conversar.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="name" label="Nombre y apellido">
                    <input id="name" name="name" type="text" required autoComplete="name" className={FIELD_CLASS + " h-11"} />
                  </Field>
                  <Field id="role" label="Cargo">
                    <input id="role" name="role" type="text" required placeholder="Ej: Fundador, Gerente general" className={FIELD_CLASS + " h-11"} />
                  </Field>
                  <Field id="email" label="Correo">
                    <input id="email" name="email" type="email" required autoComplete="email" className={FIELD_CLASS + " h-11"} />
                  </Field>
                  <Field id="phone" label="WhatsApp">
                    <input id="phone" name="phone" type="tel" required autoComplete="tel" placeholder="+56 9 1234 5678" className={FIELD_CLASS + " h-11"} />
                  </Field>
                </div>
                <Field id="city" label="Ciudad / región" optional>
                  <input id="city" name="city" type="text" className={FIELD_CLASS + " h-11"} />
                </Field>
              </Section>

              <Section n={2} title="Tu empresa" hint="Una foto rápida del tamaño y momento del negocio.">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="companyName" label="Nombre de la empresa">
                    <input id="companyName" name="companyName" type="text" required autoComplete="organization" className={FIELD_CLASS + " h-11"} />
                  </Field>
                  <Field id="industry" label="Rubro">
                    <input id="industry" name="industry" type="text" required placeholder="Ej: Gastronomía, retail, servicios" className={FIELD_CLASS + " h-11"} />
                  </Field>
                </div>
                <Field id="website" label="Web o Instagram" optional>
                  <input id="website" name="website" type="text" placeholder="www.tuempresa.cl o @tuempresa" className={FIELD_CLASS + " h-11"} />
                </Field>
                <Pills name="yearsOperating" label="Años operando" options={YEARS_OPTIONS} />
                <Pills name="teamSize" label="Tamaño del equipo" options={TEAM_SIZE_OPTIONS} />
                <Pills name="revenue" label="Facturación mensual aproximada" options={REVENUE_OPTIONS} />
              </Section>

              <Section n={3} title="Tu situación" hint="Con tus palabras, sin formato: lo importante es entenderte.">
                <Field id="problem" label="¿Cuál es el principal desafío de tu negocio hoy?">
                  <textarea
                    id="problem"
                    name="problem"
                    required
                    rows={4}
                    placeholder="Ej: vendemos bien pero no sabemos cuánto ganamos realmente, y todo depende de mí."
                    className={FIELD_CLASS + " resize-y py-3 leading-relaxed"}
                  />
                </Field>
                <Field id="tried" label="¿Qué has intentado para resolverlo?" optional>
                  <textarea id="tried" name="tried" rows={3} className={FIELD_CLASS + " resize-y py-3 leading-relaxed"} />
                </Field>
                <Pills name="goal" label="Objetivo principal (próximos 6-12 meses)" options={GOAL_OPTIONS} />
                <Field id="success" label="¿Cómo se vería el éxito en 12 meses?" optional>
                  <textarea
                    id="success"
                    name="success"
                    rows={3}
                    placeholder="Ej: tener 2 locales más y poder tomarme vacaciones sin que nada se caiga."
                    className={FIELD_CLASS + " resize-y py-3 leading-relaxed"}
                  />
                </Field>
              </Section>

              <Section n={4} title="Próximos pasos" hint="Para proponerte algo que calce con tus tiempos.">
                <Pills name="urgency" label="¿Para cuándo necesitas resolverlo?" options={URGENCY_OPTIONS} />
                <Pills name="decisionRole" label="¿Tomas tú la decisión de contratar una asesoría?" options={DECISION_OPTIONS} />
                <Pills name="budget" label="Presupuesto mensual que podrías destinar a asesoría" options={BUDGET_OPTIONS} />
                <Pills name="source" label="¿Cómo llegaste a Ignacio?" options={SOURCE_OPTIONS} onSelect={setSource} />
                {source ? (
                  <Field id="sourceDetail" label={source === "Referido / recomendación" ? "¿Quién te recomendó?" : "Cuéntanos dónde"} optional>
                    <input id="sourceDetail" name="sourceDetail" type="text" className={FIELD_CLASS + " h-11"} />
                  </Field>
                ) : null}
                <Field id="notes" label="¿Algo más que Ignacio deba saber?" optional>
                  <textarea id="notes" name="notes" rows={3} className={FIELD_CLASS + " resize-y py-3 leading-relaxed"} />
                </Field>
              </Section>

              <div className="flex flex-col gap-3 border-t border-[var(--brand-border)] pt-8">
                {status === "error" ? (
                  <p className="rounded-[10px] bg-[var(--ac-bad-soft)] px-4 py-3 text-sm text-[var(--ac-bad)]">
                    No pudimos enviar tus respuestas. Revisa tu conexión e intenta de nuevo en un momento.
                  </p>
                ) : null}
                <SubmitCta loading={status === "loading"}>Enviar evaluación</SubmitCta>
                <p className="text-center text-xs leading-relaxed text-[var(--brand-muted)]">
                  Tus datos solo los usa Acelera para contactarte.{" "}
                  <a href="/privacidad" className="underline underline-offset-2 hover:text-[var(--brand-ink)]">
                    Política de privacidad
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
        <p className="mt-8 text-center text-xs text-[var(--brand-muted)]">© Acelera tu Negocio · aceleratunegocio.cl</p>
      </main>
    </div>
  );
}
