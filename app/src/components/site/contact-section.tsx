import { useState, type FormEvent } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { SubmitCta } from "./cta";
import { BrandIcon } from "./icon";
import { SectionKicker } from "./section-kicker";

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]/70 focus-visible:border-[var(--brand-accent)]";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";

const INDUSTRY_OPTIONS = [
  "Marketing",
  "E-commerce",
  "Gastronomía",
  "Salud y estética",
  "Fotografía",
  "Otro",
];

const REVENUE_OPTIONS = [
  "$10M - $20M CLP",
  "$20M - $50M CLP",
  "Sobre $50M CLP",
];

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  industry: string;
  revenue: string;
  description: string;
};

type AvailabilitySlot = { iso: string; label: string };

type Step =
  | { kind: "form" }
  | { kind: "loading_slots" }
  | { kind: "slots"; slots: AvailabilitySlot[] }
  | { kind: "booking"; slot: AvailabilitySlot }
  | { kind: "done"; whenLabel: string }
  | { kind: "not_qualified" }
  | { kind: "slot_taken" }
  | { kind: "error" };

export function ContactSection() {
  const [step, setStep] = useState<Step>({ kind: "form" });
  const [formData, setFormData] = useState<ContactFormData | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data: ContactFormData = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      industry: String(form.get("industry") ?? ""),
      revenue: String(form.get("revenue") ?? ""),
      description: String(form.get("description") ?? ""),
    };
    setFormData(data);
    setStep({ kind: "loading_slots" });

    try {
      const res = await fetch(`${BACKEND_URL}/api/availability`);
      const result = (await res.json()) as { configured: boolean; slots: AvailabilitySlot[] };
      if (!result.configured || result.slots.length === 0) {
        setStep({ kind: "error" });
        return;
      }
      setStep({ kind: "slots", slots: result.slots });
    } catch {
      setStep({ kind: "error" });
    }
  }

  async function handlePickSlot(slot: AvailabilitySlot) {
    if (!formData) return;
    setStep({ kind: "booking", slot });

    try {
      const res = await fetch(`${BACKEND_URL}/api/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, startIso: slot.iso }),
      });
      const result = (await res.json()) as
        | { ok: true; whenLabel: string }
        | { ok: false; reason: "not_qualified" | "slot_taken" }
        | { error: string };

      if ("ok" in result && result.ok) {
        setStep({ kind: "done", whenLabel: result.whenLabel });
      } else if ("reason" in result && result.reason === "not_qualified") {
        setStep({ kind: "not_qualified" });
      } else if ("reason" in result && result.reason === "slot_taken") {
        setStep({ kind: "slot_taken" });
      } else {
        setStep({ kind: "error" });
      }
    } catch {
      setStep({ kind: "error" });
    }
  }

  return (
    <section id="contacto" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <SectionKicker>Contacto</SectionKicker>
          <h2 className="reveal-up max-w-md text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            Agenda tu llamada de calibración.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
            30 minutos para revisar tu negocio y decirte, sin vueltas, si podemos ayudarte a
            acelerar.
          </p>

          {step.kind === "form" && (
            <form onSubmit={handleSubmit} className="mt-10 flex max-w-sm flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className={LABEL_CLASS}>
                  Nombre
                </label>
                <input id="name" name="name" type="text" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={LABEL_CLASS + " flex items-center gap-1.5"}>
                  <BrandIcon src="assets/icons/icon-email.png" color="var(--brand-muted)" size={14} />
                  Email
                </label>
                <input id="email" name="email" type="email" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className={LABEL_CLASS + " flex items-center gap-1.5"}>
                  <BrandIcon src="assets/icons/icon-telefono.png" color="var(--brand-muted)" size={14} />
                  Teléfono
                </label>
                <input id="phone" name="phone" type="tel" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="industry" className={LABEL_CLASS}>
                  Industria
                </label>
                <select id="industry" name="industry" required className={FIELD_CLASS + " h-11"}>
                  <option value="">Selecciona una opción</option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="revenue" className={LABEL_CLASS}>
                  Facturación mensual
                </label>
                <select id="revenue" name="revenue" required className={FIELD_CLASS + " h-11"}>
                  <option value="">Selecciona una opción</option>
                  {REVENUE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="description" className={LABEL_CLASS}>
                  Cuéntanos de tu negocio
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="A que se dedica tu empresa, que quieres lograr..."
                  className={FIELD_CLASS + " resize-none py-3"}
                />
              </div>

              <SubmitCta className="mt-2" trackingId="contacto_enviar">Ver horarios disponibles</SubmitCta>
            </form>
          )}

          {step.kind === "loading_slots" && (
            <p className="mt-10 max-w-sm text-sm text-[var(--brand-muted)]">
              Buscando horarios disponibles...
            </p>
          )}

          {step.kind === "slots" && (
            <div className="mt-10 max-w-sm">
              <p className={LABEL_CLASS}>Elige un horario</p>
              <div className="mt-4 flex flex-col gap-2">
                {step.slots.map((slot) => (
                  <button
                    key={slot.iso}
                    type="button"
                    onClick={() => handlePickSlot(slot)}
                    className="rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-left text-sm text-[var(--brand-ink)] transition hover:border-[var(--brand-accent)]"
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step.kind === "booking" && (
            <p className="mt-10 max-w-sm text-sm text-[var(--brand-muted)]">Agendando tu llamada...</p>
          )}

          {step.kind === "done" && (
            <p className="mt-10 max-w-sm text-base text-[var(--brand-ink)]">
              Listo, quedó agendada tu llamada de calibración para el {step.whenLabel}. Te llegará
              la confirmación a tu correo.
            </p>
          )}

          {step.kind === "not_qualified" && (
            <p className="mt-10 max-w-sm text-sm text-[var(--brand-ink)]">
              Por ahora el acompañamiento estructurado de Acelera está pensado para negocios que ya
              facturan desde $10.000.000 CLP mensuales. Te recomendamos revisar la asesoría personal
              de Ignacio Ruiz, que tiene un formato más simple y accesible.
            </p>
          )}

          {step.kind === "slot_taken" && (
            <div className="mt-10 max-w-sm">
              <p className="text-sm text-[var(--brand-ink)]">
                Justo ese horario ya no está disponible. Elige otro:
              </p>
              <button
                type="button"
                onClick={() => setStep({ kind: "form" })}
                className="mt-4 text-sm font-semibold text-[var(--brand-accent)] underline"
              >
                Ver horarios de nuevo
              </button>
            </div>
          )}

          {step.kind === "error" && (
            <div className="mt-10 max-w-sm">
              <p className="text-sm text-[var(--brand-ink)]">
                Tuvimos un problema técnico agendando tu llamada. Escríbenos directamente a{" "}
                <a href="mailto:contacto@aceleratunegocio.cl" className="underline">
                  contacto@aceleratunegocio.cl
                </a>{" "}
                y coordinamos por ese medio.
              </p>
              <button
                type="button"
                onClick={() => setStep({ kind: "form" })}
                className="mt-4 text-sm font-semibold text-[var(--brand-accent)] underline"
              >
                Intentar de nuevo
              </button>
            </div>
          )}
        </div>

        <div className="relative min-h-[20rem] overflow-hidden rounded-2xl border border-[var(--brand-border)] md:min-h-[32rem]">
          <img
            src="assets/plates/contacto-dial.jpg"
            alt="Macro fotografía de un cronómetro de titanio cepillado"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-bg)] via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--dark-muted)]">
            Herramientas de precisión. Decisiones claras.
          </p>
        </div>
      </div>
    </section>
  );
}
