import { useState, type FormEvent, type ReactNode } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { getAttributionPayload } from "@/lib/attribution";
import { newMetaEventId, trackMetaEvent } from "@/lib/meta-pixel";
import { SubmitCta } from "./cta";

// Formulario "Agenda tu llamada" (/agenda), destino de los anuncios de Meta
// (2026-10-31). Manda todo a /api/llamada, que registra exactamente lo mismo que el
// chat cuando termina (acelera-backend/src/routes/llamada.ts): lead, correo de
// confirmación, dossier al equipo y ruta según facturación. Por ahora la persona deja
// días y franja preferidas y el equipo coordina; elegir un horario real del calendario
// queda para una segunda etapa.

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]/70 focus-visible:border-[var(--brand-accent)]";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";
const CHIP_CLASS =
  "flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-center text-sm leading-tight text-[var(--brand-ink)] transition-colors has-[:checked]:border-[var(--brand-primary)] has-[:checked]:bg-[var(--brand-primary)] has-[:checked]:text-[var(--ac-white)] has-[:focus-visible]:border-[var(--brand-accent)]";

const INDUSTRY_OPTIONS = ["Marketing", "E-commerce", "Gastronomía", "Salud y estética", "Fotografía", "Otro"];

// Mismas franjas que el diagnóstico más una bajo el mínimo: bajo $10M no se rechaza, el
// backend lo deja en ruta "asesoría" para que el equipo evalúe. El texto tiene que
// seguir leyéndose con parseMonthlyRevenueClp del backend (lo cubre tests/llamada.test.ts).
const REVENUE_OPTIONS = ["Menos de $10M CLP", "$10M - $20M CLP", "$20M - $50M CLP", "Sobre $50M CLP"];

const DECISION_OPTIONS = [
  { value: "decide", label: "Sí, yo decido" },
  { value: "comparte", label: "Lo decido con un socio" },
  { value: "no_decide", label: "Decide otra persona" },
] as const;

const DAY_OPTIONS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const SLOT_OPTIONS = [
  { value: "en la mañana (9:00 a 13:00)", label: "Mañana" },
  { value: "en la tarde (14:00 a 18:00)", label: "Tarde" },
  { value: "a cualquier hora", label: "Cualquiera" },
];

type Result = { track: "consultoria" | "asesoria" | "por_verificar" | null; alreadyRequested: boolean };
type Status = "idle" | "loading" | "done" | "error";

// "martes o jueves, en la tarde (14:00 a 18:00)" — mismo formato libre que guarda el chat.
function formatPreferredTimes(days: string[], slot: string): string {
  const dayText =
    days.length === DAY_OPTIONS.length
      ? "cualquier día de la semana"
      : days
          .map((d) => d.toLowerCase())
          .join(", ")
          .replace(/, ([^,]*)$/, " o $1");
  return `${dayText}, ${slot}`;
}

export function LlamadaForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [firstName, setFirstName] = useState("");
  const [industry, setIndustry] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const days = form.getAll("days").map(String);
    if (days.length === 0) {
      setStatus("error");
      setErrorMessage("Elige al menos un día en que te acomode la llamada.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    const times = formatPreferredTimes(days, String(form.get("slot") ?? "a cualquier hora"));
    const name = String(form.get("name") ?? "").trim();
    const metaEventId = newMetaEventId();
    const payload = {
      name,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      industry: industry === "Otro" ? String(form.get("industryOther") ?? "").trim() || "Otro" : industry,
      revenueText: String(form.get("revenue") ?? ""),
      decisionRole: String(form.get("decisionRole") ?? ""),
      mainChallenge: String(form.get("mainChallenge") ?? ""),
      preferredTimes: times,
      privacyAccepted: form.get("privacy") === "on",
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
        setErrorMessage(data.error ?? "No pudimos enviar tu solicitud. Intenta de nuevo en un momento.");
        return;
      }
      setResult({ track: data.track ?? null, alreadyRequested: data.alreadyRequested === true });
      setFirstName(name.split(/\s+/)[0] ?? "");
      setPreferredTimes(times);
      setStatus("done");
      if (!data.alreadyRequested) trackMetaEvent("Lead", { content_name: "llamada" }, metaEventId);
    } catch {
      setStatus("error");
      setErrorMessage("No pudimos enviar tu solicitud. Revisa tu conexión e intenta de nuevo.");
    }
  }

  if (status === "done" && result) {
    return <LlamadaConfirmation result={result} firstName={firstName} preferredTimes={preferredTimes} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="name">
          <input id="name" name="name" type="text" required autoComplete="name" className={FIELD_CLASS + " h-11"} />
        </Field>
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
      </div>

      <Field label="Correo" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="email" className={FIELD_CLASS + " h-11"} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Empresa" htmlFor="companyName">
          <input id="companyName" name="companyName" type="text" required autoComplete="organization" className={FIELD_CLASS + " h-11"} />
        </Field>
        <Field label="Rubro" htmlFor="industry">
          <select
            id="industry"
            name="industry"
            required
            className={FIELD_CLASS + " h-11"}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {industry === "Otro" ? (
            <input name="industryOther" type="text" required placeholder="¿Cuál es tu rubro?" className={FIELD_CLASS + " h-11"} />
          ) : null}
        </Field>
      </div>

      <Field label="Facturación mensual" htmlFor="revenue">
        <select id="revenue" name="revenue" required defaultValue="" className={FIELD_CLASS + " h-11"}>
          <option value="" disabled>
            Selecciona una opción
          </option>
          {REVENUE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className={LABEL_CLASS + " mb-2"}>¿Eres quien toma las decisiones del negocio?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {DECISION_OPTIONS.map((option) => (
            <label key={option.value} className={CHIP_CLASS}>
              <input type="radio" name="decisionRole" value={option.value} required className="sr-only" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="¿Qué te gustaría resolver en tu negocio?" htmlFor="mainChallenge">
        <textarea
          id="mainChallenge"
          name="mainChallenge"
          required
          rows={3}
          maxLength={500}
          placeholder="Ej: vendemos bien, pero no sabemos cuánto ganamos realmente ni dónde se nos va la plata."
          className={FIELD_CLASS + " resize-none py-3"}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className={LABEL_CLASS + " mb-2"}>¿Qué días te acomoda la llamada?</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {DAY_OPTIONS.map((day) => (
            <label key={day} className={CHIP_CLASS}>
              <input type="checkbox" name="days" value={day} className="sr-only" />
              {day}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={LABEL_CLASS + " mb-2"}>¿En qué horario?</legend>
        <div className="grid grid-cols-3 gap-2">
          {SLOT_OPTIONS.map((slot) => (
            <label key={slot.value} className={CHIP_CLASS}>
              <input type="radio" name="slot" value={slot.value} required className="sr-only" />
              {slot.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-xs leading-relaxed text-[var(--brand-muted)]">
        <input type="checkbox" name="privacy" required className="mt-0.5 size-4 shrink-0 accent-[var(--brand-primary)]" />
        <span>
          He leído y acepto la{" "}
          <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline">
            Política de Privacidad
          </a>
          .
        </span>
      </label>

      {status === "error" && errorMessage ? (
        <p role="alert" className="text-sm text-[var(--brand-ink)]">
          {errorMessage}
        </p>
      ) : null}

      <SubmitCta loading={status === "loading"} trackingId="agendar_llamada">
        {status === "loading" ? "Enviando…" : "Agendar mi llamada"}
      </SubmitCta>
      <p className="text-xs leading-relaxed text-[var(--brand-muted)]">
        Te escribimos por WhatsApp o correo para confirmar el horario. 30 minutos, sin costo.
      </p>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
    </div>
  );
}

function LlamadaConfirmation({ result, firstName, preferredTimes }: { result: Result; firstName: string; preferredTimes: string }) {
  const greeting = firstName ? `Listo, ${firstName}.` : "Listo.";
  let body: string;
  if (result.alreadyRequested) {
    body = "Ya teníamos registrada tu solicitud de llamada. El equipo te va a contactar para coordinar el horario.";
  } else if (result.track === "asesoria") {
    // Bajo el mínimo de consultoría: no se promete llamada (mismo criterio que el chat).
    body = "Recibimos tu solicitud. El equipo va a revisar tu caso y te escribirá con la mejor forma de ayudarte.";
  } else {
    body = `Recibimos tu solicitud. Te escribiremos por WhatsApp o correo para confirmar la hora: nos dijiste que te acomoda ${preferredTimes}.`;
  }
  return (
    <div role="status" className="rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-8">
      <p className="text-2xl font-semibold tracking-tighter text-[var(--brand-ink)]">{greeting}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">{body}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">También te llegó un correo de confirmación.</p>
    </div>
  );
}
