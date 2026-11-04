import { useRef, useState, type FormEvent, type ReactNode } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { trackCtaClick } from "@/lib/analytics";
import { getAttributionPayload } from "@/lib/attribution";
import { newMetaEventId, trackMetaEvent } from "@/lib/meta-pixel";
import { SubmitCta } from "./cta";
import { CHIP_CLASS } from "./llamada-slot-picker";
import {
  DECISION_OPTIONS,
  FIELD_CLASS,
  Field,
  INDUSTRY_OPTIONS,
  LABEL_CLASS,
  LlamadaConfirmation,
  REVENUE_OPTIONS,
  type Result,
} from "./llamada-form";

// Versión B de la landing de los anuncios (/postula, 2026-11-02): formulario de
// POSTULACIÓN en 3 pasos, inspirado en Haciéndola (Oski) y en los "application funnels"
// de consultoras de EE. UU. La idea:
//  - Paso 1 son preguntas fáciles de un clic sobre el negocio (pie en la puerta): quien
//    empieza tiende a terminar.
//  - Paso 2 califica: decisor, presupuesto y cuándo quiere empezar. Las opciones dejan
//    que el que solo está mirando se marque solo ("Solo estoy explorando").
//  - Paso 3 pide los datos de contacto, cuando la persona ya invirtió en responder.
// Manda lo mismo que la versión A (/api/llamada) más resourceCapacity, startTiming y
// landingVariant "postula", que el backend guarda en el lead y muestra en el dossier.
// Sin horario: el equipo revisa el caso y coordina la llamada por WhatsApp.
//
// Filtro duro (pedido de Fernando, 2026-11-04): quien no califica NO llega al paso de
// datos. Así el evento Lead (Pixel + CAPI) solo lo disparan leads calificados y Meta
// optimiza hacia ese perfil. Se corta al salir del paso 1 (factura menos de $10M) o del
// paso 2 (no decide, sin presupuesto o solo explorando). No se manda nada al backend.

const NO_BUDGET = "Hoy no tengo presupuesto";
const ONLY_EXPLORING = "Solo estoy explorando";
const BUDGET_OPTIONS = [
  "Sí, tengo presupuesto para invertir",
  "Si el plan lo justifica, lo destino",
  NO_BUDGET,
];
const TIMING_OPTIONS = ["Este mes", "En 1 a 3 meses", ONLY_EXPLORING];

// Respuestas que dejan fuera, por paso. REVENUE_OPTIONS[0] = "Menos de $10M CLP".
function isDisqualified(step: number, form: FormData): boolean {
  if (step === 0) return form.get("revenue") === REVENUE_OPTIONS[0];
  if (step === 1) {
    return (
      form.get("decisionRole") === "no_decide" ||
      form.get("budget") === NO_BUDGET ||
      form.get("timing") === ONLY_EXPLORING
    );
  }
  return false;
}

const FELIPE_INSTAGRAM = "https://instagram.com/nancupil.oficial";
const STEPS = ["Tu negocio", "Tu momento", "Tus datos"] as const;

type Status = "idle" | "loading" | "done" | "error";

export function PostulaForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [firstName, setFirstName] = useState("");
  const [industry, setIndustry] = useState("");
  const [disqualified, setDisqualified] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const topRef = useRef<HTMLDivElement | null>(null);

  // Valida solo los campos del paso visible antes de avanzar (los pasos siguen montados
  // para no perder lo escrito al volver atrás).
  function stepIsValid(index: number): boolean {
    const container = stepRefs.current[index];
    if (!container) return true;
    const fields = Array.from(
      container.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      ),
    );
    const invalid = fields.find((el) => !el.checkValidity());
    if (invalid) {
      setErrorMessage("Responde todas las preguntas de este paso para continuar.");
      setStatus("error");
      invalid.reportValidity();
      return false;
    }
    return true;
  }

  function goTo(index: number) {
    setStep(index);
    setErrorMessage("");
    setStatus("idle");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // noValidate en el <form>: la validación nativa revisaría también los pasos ocultos
    // y bloquearía el "Siguiente". Se valida a mano, paso por paso.
    if (!stepIsValid(step)) return;
    if (step < STEPS.length - 1) {
      if (isDisqualified(step, new FormData(event.currentTarget))) {
        trackCtaClick(`postula_no_califica_paso_${step + 1}`);
        setDisqualified(true);
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      goTo(step + 1);
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const metaEventId = newMetaEventId();
    const payload = {
      name,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      industry:
        industry === "Otro" ? String(form.get("industryOther") ?? "").trim() || "Otro" : industry,
      website: String(form.get("website") ?? ""),
      instagram: String(form.get("instagram") ?? ""),
      revenueText: String(form.get("revenue") ?? ""),
      decisionRole: String(form.get("decisionRole") ?? ""),
      resourceCapacity: String(form.get("budget") ?? ""),
      startTiming: String(form.get("timing") ?? ""),
      mainChallenge: String(form.get("mainChallenge") ?? ""),
      preferredTimes: "",
      privacyAccepted: form.get("privacy") === "on",
      landingVariant: "postula",
      attribution: getAttributionPayload(),
      metaEventId,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/llamada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<Result> & { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data.error ?? "No pudimos enviar tu postulación. Intenta de nuevo en un momento.",
        );
        return;
      }
      setResult({
        track: data.track ?? null,
        alreadyRequested: data.alreadyRequested === true,
        booked: null,
      });
      setFirstName(name.split(/\s+/)[0] ?? "");
      setStatus("done");
      if (!data.alreadyRequested) trackMetaEvent("Lead", { content_name: "postula" }, metaEventId);
    } catch {
      setStatus("error");
      setErrorMessage("No pudimos enviar tu postulación. Revisa tu conexión e intenta de nuevo.");
    }
  }

  if (status === "done" && result) {
    return <LlamadaConfirmation result={result} firstName={firstName} preferredTimes="" />;
  }

  // El formulario sigue montado (oculto) para que "Me equivoqué" vuelva con todo lo escrito.
  const disqualifiedPanel = disqualified ? (
    <div
      role="status"
      className="py-2"
    >
      <p className="text-2xl font-semibold tracking-tighter text-[var(--brand-ink)]">
        Gracias por tu interés.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">
        Por lo que nos cuentas, hoy no es el momento para este proceso: está pensado para empresas
        que facturan sobre $10M al mes y están listas para invertir en crecer ahora.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">
        Mientras tanto, en el Instagram de Felipe compartimos gratis cómo ordenar los números y
        hacer crecer un negocio.
      </p>
      <a
        href={FELIPE_INSTAGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] transition-transform duration-150 hover:brightness-110 active:scale-[0.97]"
      >
        Ver el Instagram de Felipe
      </a>
      <button
        type="button"
        onClick={() => setDisqualified(false)}
        className="mt-4 block text-sm text-[var(--brand-muted)] underline-offset-4 hover:underline"
      >
        Me equivoqué en una respuesta
      </button>
    </div>
  ) : null;

  const isLast = step === STEPS.length - 1;

  return (
    <div ref={topRef} className="scroll-mt-24">
      {disqualifiedPanel}
      <div className={disqualified ? "hidden" : undefined}>
        <Progress step={step} />

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
          {/* Paso 1: el negocio, casi todo con un clic. */}
          <StepPanel index={0} step={step} refs={stepRefs}>
            <ChipGroup
              legend="¿Cuánto factura tu empresa al mes?"
              name="revenue"
              options={REVENUE_OPTIONS}
              columns="sm:grid-cols-2"
            />
            <Field label="Rubro" htmlFor="industry">
              <select
                id="industry"
                name="industry"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={FIELD_CLASS + " h-11"}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {industry === "Otro" ? (
                <input
                  name="industryOther"
                  type="text"
                  required
                  placeholder="¿Cuál es tu rubro?"
                  className={FIELD_CLASS + " h-11"}
                />
              ) : null}
            </Field>
            <Field label="Nombre de tu empresa" htmlFor="companyName">
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                autoComplete="organization"
                className={FIELD_CLASS + " h-11"}
              />
            </Field>
          </StepPanel>

          {/* Paso 2: califica. */}
          <StepPanel index={1} step={step} refs={stepRefs}>
            <ChipGroup
              legend="¿Eres quien toma las decisiones del negocio?"
              name="decisionRole"
              options={DECISION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              columns="sm:grid-cols-3"
            />
            <ChipGroup
              legend="¿Tienes presupuesto para invertir en tu crecimiento este trimestre?"
              name="budget"
              options={BUDGET_OPTIONS}
              columns="sm:grid-cols-3"
            />
            <ChipGroup
              legend="¿Cuándo te gustaría empezar?"
              name="timing"
              options={TIMING_OPTIONS}
              columns="sm:grid-cols-3"
            />
            <Field label="¿Cuál es el principal desafío de tu negocio hoy?" htmlFor="mainChallenge">
              <textarea
                id="mainChallenge"
                name="mainChallenge"
                required
                rows={3}
                maxLength={1500}
                placeholder="Ej: vendemos bien, pero no sabemos cuánto ganamos y todo pasa por mí."
                className={FIELD_CLASS + " resize-none py-3"}
              />
            </Field>
          </StepPanel>

          {/* Paso 3: contacto. */}
          <StepPanel index={2} step={step} refs={stepRefs}>
            <Field label="Nombre y apellido" htmlFor="name">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className={FIELD_CLASS + " h-11"}
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp" htmlFor="phone">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+56 9 1234 5678"
                  className={FIELD_CLASS + " h-11"}
                />
              </Field>
              <Field label="Correo" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={FIELD_CLASS + " h-11"}
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Página web (opcional)" htmlFor="website">
                <input
                  id="website"
                  name="website"
                  type="text"
                  inputMode="url"
                  autoComplete="url"
                  autoCapitalize="none"
                  placeholder="tuempresa.cl"
                  className={FIELD_CLASS + " h-11"}
                />
              </Field>
              <Field label="Instagram (opcional)" htmlFor="instagram">
                <input
                  id="instagram"
                  name="instagram"
                  type="text"
                  autoCapitalize="none"
                  placeholder="@tuempresa"
                  className={FIELD_CLASS + " h-11"}
                />
              </Field>
            </div>
            <label className="flex items-start gap-3 text-xs leading-relaxed text-[var(--brand-muted)]">
              <input
                type="checkbox"
                name="privacy"
                required
                className="mt-0.5 size-4 shrink-0 accent-[var(--brand-primary)]"
              />
              <span>
                He leído y acepto la{" "}
                <a
                  href="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Política de Privacidad
                </a>
                .
              </span>
            </label>
          </StepPanel>

          {status === "error" && errorMessage ? (
            <p role="alert" className="text-sm text-[var(--brand-ink)]">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <SubmitCta
              loading={status === "loading"}
              trackingId={isLast ? "enviar_postulacion" : `postula_paso_${step + 1}`}
            >
              {isLast ? "Enviar mi postulación" : "Siguiente"}
            </SubmitCta>
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="self-center text-sm text-[var(--brand-muted)] underline-offset-4 hover:underline"
              >
                Volver
              </button>
            ) : null}
          </div>
          <p className="text-center text-xs leading-relaxed text-[var(--brand-muted)]">
            {isLast
              ? "Revisamos cada postulación y te escribimos por WhatsApp para coordinar la llamada."
              : "Toma menos de 2 minutos. Sin costo."}
          </p>
        </form>
      </div>
    </div>
  );
}

function Progress({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[var(--brand-ink)]">{STEPS[step]}</span>
        <span className="text-[var(--brand-muted)]">
          Paso {step + 1} de {STEPS.length}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={
              "h-1.5 rounded-full transition-colors " +
              (i <= step ? "bg-[var(--brand-primary)]" : "bg-[var(--brand-border)]")
            }
          />
        ))}
      </div>
    </div>
  );
}

function StepPanel({
  index,
  step,
  refs,
  children,
}: {
  index: number;
  step: number;
  refs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  children: ReactNode;
}) {
  return (
    <div
      ref={(el) => {
        refs.current[index] = el;
      }}
      className={index === step ? "flex flex-col gap-5" : "hidden"}
    >
      {children}
    </div>
  );
}

function ChipGroup({
  legend,
  name,
  options,
  columns,
}: {
  legend: string;
  name: string;
  options: readonly (string | { value: string; label: string })[];
  columns: string;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={LABEL_CLASS + " mb-2"}>{legend}</legend>
      <div className={"grid gap-2 " + columns}>
        {options.map((option) => {
          const { value, label } =
            typeof option === "string" ? { value: option, label: option } : option;
          return (
            <label key={value} className={CHIP_CLASS}>
              <input type="radio" name={name} value={value} required className="sr-only" />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
