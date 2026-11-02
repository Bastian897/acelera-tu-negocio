import { useState, type FormEvent, type ReactNode } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { getAttributionPayload } from "@/lib/attribution";
import { newMetaEventId, trackMetaEvent } from "@/lib/meta-pixel";
import { SubmitCta } from "./cta";
import { CHIP_CLASS, SlotPicker } from "./llamada-slot-picker";

// Formulario "Agenda tu llamada" (/agenda), destino de los anuncios de Meta
// (2026-10-31). Manda todo a /api/llamada, que registra exactamente lo mismo que el
// chat cuando termina (acelera-backend/src/routes/llamada.ts): lead, correo de
// confirmación, dossier al equipo y ruta según facturación. Desde 2026-11-01 la persona
// elige un horario real en que Bastian e Ignacio están libres (SlotPicker) y la
// llamada queda agendada con invitación y Meet; si el calendario no responde, elige
// día y hora como preferencia y el equipo la confirma por WhatsApp.
//
// withAgenda={false} (/solicitud, 2026-11-02, recomendación de Fernando para los ads):
// mismo formulario sin elegir horario. El equipo califica el caso primero y después
// coordina la llamada por WhatsApp, para que no se llene la agenda de gente que no llega.

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]/70 focus-visible:border-[var(--brand-accent)]";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";
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

type Result = {
  track: "consultoria" | "asesoria" | "por_verificar" | null;
  alreadyRequested: boolean;
  booked: { whenLabel: string; meetLink: string | null } | null;
};
type Status = "idle" | "loading" | "done" | "error";

export function LlamadaForm({ withAgenda = true }: { withAgenda?: boolean } = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [firstName, setFirstName] = useState("");
  const [industry, setIndustry] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");
  // Se incrementa para que SlotPicker vuelva a pedir horarios (el elegido se ocupó).
  const [slotsReloadKey, setSlotsReloadKey] = useState(0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // "martes, 4 de noviembre a las 10:00"; slotIso vacío = modo respaldo (sin calendario).
    const times = withAgenda ? String(form.get("slotLabel") ?? "") : "";
    const slotIso = withAgenda ? String(form.get("slotIso") ?? "") : "";
    if (withAgenda && !times) {
      setStatus("error");
      setErrorMessage("Elige el día y la hora de tu llamada.");
      return;
    }
    setStatus("loading");
    setErrorMessage("");

    const name = String(form.get("name") ?? "").trim();
    const metaEventId = newMetaEventId();
    const payload = {
      name,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      industry: industry === "Otro" ? String(form.get("industryOther") ?? "").trim() || "Otro" : industry,
      website: String(form.get("website") ?? ""),
      instagram: String(form.get("instagram") ?? ""),
      revenueText: String(form.get("revenue") ?? ""),
      decisionRole: String(form.get("decisionRole") ?? ""),
      businessState: String(form.get("businessState") ?? ""),
      mainChallenge: String(form.get("mainChallenge") ?? ""),
      preferredTimes: times,
      slotIso: slotIso || undefined,
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
      const data = (await res.json().catch(() => ({}))) as Partial<Result> & { error?: string; slotTaken?: boolean };
      if (!res.ok) {
        if (data.slotTaken) setSlotsReloadKey((k) => k + 1);
        setStatus("error");
        setErrorMessage(data.error ?? "No pudimos enviar tu solicitud. Intenta de nuevo en un momento.");
        return;
      }
      setResult({ track: data.track ?? null, alreadyRequested: data.alreadyRequested === true, booked: data.booked ?? null });
      setFirstName(name.split(/\s+/)[0] ?? "");
      setPreferredTimes(times);
      setStatus("done");
      if (!data.alreadyRequested) trackMetaEvent("Lead", { content_name: withAgenda ? "llamada" : "solicitud" }, metaEventId);
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

      {/* Opcionales: no todo negocio tiene sitio o Instagram. */}
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
          <input id="instagram" name="instagram" type="text" autoCapitalize="none" placeholder="@tuempresa" className={FIELD_CLASS + " h-11"} />
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

      <Field label="¿Cómo describirías el estado actual de tu negocio?" htmlFor="businessState">
        <textarea
          id="businessState"
          name="businessState"
          required
          rows={3}
          maxLength={1500}
          placeholder="Ej: llevamos 4 años, vendemos bien, pero el equipo está colapsado y yo estoy metido en todo."
          className={FIELD_CLASS + " resize-none py-3"}
        />
      </Field>

      <Field
        label="¿Cuáles son los principales dolores en tu negocio, qué has intentado y cuáles fueron los resultados?"
        htmlFor="mainChallenge"
      >
        <textarea
          id="mainChallenge"
          name="mainChallenge"
          required
          rows={4}
          maxLength={1500}
          placeholder="Ej: no sabemos cuánto ganamos realmente. Probamos con un contador externo y planillas, pero seguimos sin números claros."
          className={FIELD_CLASS + " resize-none py-3"}
        />
      </Field>

      {withAgenda ? <SlotPicker reloadKey={slotsReloadKey} /> : null}

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

      <SubmitCta loading={status === "loading"} trackingId={withAgenda ? "agendar_llamada" : "solicitar_llamada"}>
        {status === "loading" ? "Enviando…" : withAgenda ? "Agendar mi llamada" : "Solicitar mi llamada"}
      </SubmitCta>
      <p className="text-xs leading-relaxed text-[var(--brand-muted)]">
        {withAgenda
          ? "30 minutos por videollamada, sin costo."
          : "30 minutos por videollamada, sin costo. Revisamos tu caso y te escribimos por WhatsApp para coordinar el horario."}
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
  if (result.booked) {
    body = `Tu llamada quedó agendada para el ${result.booked.whenLabel}. Te enviamos la invitación con el link de la videollamada.`;
  } else if (result.alreadyRequested) {
    body = "Ya teníamos registrada tu solicitud de llamada. El equipo te va a contactar para coordinar el horario.";
  } else if (result.track === "asesoria") {
    // Bajo el mínimo de consultoría: no se promete llamada (mismo criterio que el chat).
    body = "Recibimos tu solicitud. El equipo va a revisar tu caso y te escribirá con la mejor forma de ayudarte.";
  } else if (preferredTimes) {
    body = `Recibimos tu solicitud para el ${preferredTimes}. Te escribiremos por WhatsApp para confirmarla.`;
  } else {
    // Formulario sin agenda (/solicitud): no hubo horario elegido.
    body = "Recibimos tu solicitud. El equipo va a revisar tu caso y te escribirá por WhatsApp para coordinar la llamada.";
  }
  return (
    <div role="status" className="rounded-[var(--ac-radius-lg)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-8">
      <p className="text-2xl font-semibold tracking-tighter text-[var(--brand-ink)]">{greeting}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">{body}</p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">También te llegó un correo de confirmación.</p>
    </div>
  );
}
