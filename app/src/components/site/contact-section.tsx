import { useEffect, useState, type FormEvent } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { BACKEND_URL } from "@/lib/backend";
import { claimReferral } from "@/lib/referral";
import { siteContent } from "@/lib/site-content";
import { SubmitCta } from "./cta";
import { SectionKicker } from "./section-kicker";

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]/70 focus-visible:border-[var(--brand-accent)]";
const LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";

const INDUSTRY_OPTIONS = [
  "Marketing",
  "E-commerce",
  "Gastronomía",
  "Salud y estética",
  "Fotografía",
  "Otro",
];

const DEFAULT_MIN_REVENUE_CLP = 10_000_000;

type RevenueOption = { label: string; floorClp: number };

// Las franjas se arman a partir del mínimo real configurado en /admin/agents
// (vía /api/agent-config) en vez de estar copiadas a mano acá — así, si cambian
// el mínimo para calificar, el dropdown y el filtro real de agendamiento nunca
// quedan desincronizados.
function buildRevenueOptions(minClp: number): RevenueOption[] {
  const fmtM = (n: number) => `$${Math.round(n / 1_000_000)}M`;
  return [
    { label: `${fmtM(minClp)} - ${fmtM(minClp * 2)} CLP`, floorClp: minClp },
    { label: `${fmtM(minClp * 2)} - ${fmtM(minClp * 5)} CLP`, floorClp: minClp * 2 },
    { label: `Sobre ${fmtM(minClp * 5)} CLP`, floorClp: minClp * 5 },
  ];
}

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  industry: string;
  monthlyRevenueClp: number;
  revenueLabel: string;
  description: string;
};

type AvailabilitySlot = { iso: string; label: string };

function groupSlotsByDay(slots: AvailabilitySlot[]) {
  const groups: { dayLabel: string; slots: (AvailabilitySlot & { timeLabel: string })[] }[] = [];
  for (const slot of slots) {
    const date = new Date(slot.iso);
    const dayLabel = date.toLocaleDateString("es-CL", {
      timeZone: "America/Santiago",
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const timeLabel = date.toLocaleTimeString("es-CL", {
      timeZone: "America/Santiago",
      hour: "2-digit",
      minute: "2-digit",
    });
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dayLabel === dayLabel) {
      lastGroup.slots.push({ ...slot, timeLabel });
    } else {
      groups.push({ dayLabel, slots: [{ ...slot, timeLabel }] });
    }
  }
  return groups;
}

type Step =
  | { kind: "form" }
  | { kind: "loading_slots" }
  | { kind: "slots"; slots: AvailabilitySlot[] }
  | { kind: "booking"; slot: AvailabilitySlot }
  | { kind: "done"; whenLabel: string }
  | { kind: "not_qualified"; minRequiredClp: number }
  | { kind: "slot_taken" }
  | { kind: "error" };

// Qué pasa en la llamada: reemplaza la foto del reloj para que la columna
// izquierda acompañe al formulario con información útil. Es la secuencia
// real de la llamada, por eso va numerada.
const CALL_STEPS = [
  {
    title: "Revisamos tu negocio",
    body: "Tus números, tu operación y dónde sientes que se traba el crecimiento.",
  },
  {
    title: "Te decimos dónde vemos la oportunidad",
    body: "Una lectura concreta de qué movería la aguja primero.",
  },
  {
    title: "Te respondemos sin vueltas",
    body: "Si podemos ayudarte a acelerar, te proponemos cómo. Si no, también te lo decimos.",
  },
];

const TEAM_AVATARS = [
  { src: "assets/team/felipe-nancupil-card.jpg", name: "Felipe Ñancupil" },
  { src: "assets/team/ignacio-ruiz-card.jpg", name: "Ignacio Ruiz" },
  { src: "assets/team/bastian-moreno-card-v2.jpg", name: "Bastián Moreno" },
];

function CallAgenda() {
  return (
    <div className="max-w-md lg:mt-10">
      <p className={LABEL_CLASS}>Qué pasa en los 30 minutos</p>
      <ol className="mt-5 flex flex-col gap-5">
        {CALL_STEPS.map((item, i) => (
          <li key={item.title} className="grid grid-cols-[28px_1fr] gap-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ac-blue-soft)] text-xs font-semibold text-[var(--brand-primary)]">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--brand-ink)]">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--brand-muted)]">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-center gap-4 border-t border-[var(--brand-border)] pt-6">
        <div className="flex -space-x-3">
          {TEAM_AVATARS.map((member) => (
            <span
              key={member.name}
              className="block h-11 w-11 overflow-hidden rounded-full border-2 border-[var(--brand-bg)] bg-[var(--brand-surface)]"
            >
              {/* Las fotos "-card" tienen la cabeza en el mismo lugar (ver
               * founders-section.tsx): zoom x2.2 centrado en la cara. */}
              <img
                src={member.src}
                alt={member.name}
                width={44}
                height={44}
                loading="lazy"
                className="h-full w-full origin-[50%_28%] scale-[2.2] object-cover grayscale"
              />
            </span>
          ))}
        </div>
        <p className="text-sm leading-snug text-[var(--brand-muted)]">
          El equipo detrás de Acelera.
          <br />
          <a
            href="mailto:contacto@aceleratunegocio.cl"
            className="text-[var(--brand-ink)] underline-offset-2 hover:underline"
          >
            contacto@aceleratunegocio.cl
          </a>
        </p>
      </div>
    </div>
  );
}

export function ContactSection() {
  const [step, setStep] = useState<Step>({ kind: "form" });
  const [formData, setFormData] = useState<ContactFormData | null>(null);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [minRevenueClp, setMinRevenueClp] = useState(DEFAULT_MIN_REVENUE_CLP);
  const revenueOptions = buildRevenueOptions(minRevenueClp);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/agent-config`)
      .then((res) => res.json())
      .then((data: { minQualifyingRevenueClp?: number }) => {
        if (typeof data.minQualifyingRevenueClp === "number")
          setMinRevenueClp(data.minQualifyingRevenueClp);
      })
      .catch(() => {
        // Se queda con DEFAULT_MIN_REVENUE_CLP si el backend no responde — mejor
        // ofrecer franjas razonables que dejar el dropdown vacío.
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedFloor = Number(form.get("revenue"));
    const selectedOption = revenueOptions.find((opt) => opt.floorClp === selectedFloor);
    const data: ContactFormData = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: phone ?? "",
      industry: String(form.get("industry") ?? ""),
      monthlyRevenueClp: selectedFloor,
      revenueLabel: selectedOption?.label ?? "",
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
        | { ok: false; reason: "not_qualified"; minRequiredClp: number }
        | { ok: false; reason: "slot_taken" }
        | { error: string };

      if ("ok" in result && result.ok) {
        claimReferral(formData.email);
        setStep({ kind: "done", whenLabel: result.whenLabel });
      } else if ("reason" in result && result.reason === "not_qualified") {
        setStep({ kind: "not_qualified", minRequiredClp: result.minRequiredClp });
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
    <section
      id="contacto"
      className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32"
    >
      {/* Celular: título → formulario → qué pasa en la llamada (el formulario
       * no queda enterrado). Escritorio: título y pasos a la izquierda, el
       * formulario ocupa toda la columna derecha. */}
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.35fr] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0">
        <div className="lg:col-start-1 lg:row-start-1">
          <SectionKicker>{siteContent.contact.kicker}</SectionKicker>
          <h2 className="reveal-up max-w-md text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            {siteContent.contact.heading}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
            {siteContent.contact.paragraph}
          </p>
        </div>

        <div className="max-lg:order-last lg:col-start-1 lg:row-start-2">
          <CallAgenda />
        </div>

        <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-[var(--shadow-elevation)] md:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          {step.kind === "form" && (
            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className={LABEL_CLASS}>
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={formData?.name}
                  className={FIELD_CLASS + " h-11"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={LABEL_CLASS}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={formData?.email}
                  className={FIELD_CLASS + " h-11"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className={LABEL_CLASS}>
                  Teléfono
                </label>
                <PhoneInput
                  id="phone"
                  international
                  defaultCountry="CL"
                  value={phone}
                  onChange={setPhone}
                  className="acelera-phone-input"
                  numberInputProps={{ required: true }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="industry" className={LABEL_CLASS}>
                  Industria
                </label>
                <select
                  id="industry"
                  name="industry"
                  required
                  defaultValue={formData?.industry ?? ""}
                  className={FIELD_CLASS + " h-11"}
                >
                  <option value="">Selecciona una opción</option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="revenue" className={LABEL_CLASS}>
                  Facturación mensual
                </label>
                <select
                  id="revenue"
                  name="revenue"
                  required
                  defaultValue={formData ? String(formData.monthlyRevenueClp) : ""}
                  className={FIELD_CLASS + " h-11"}
                >
                  <option value="">Selecciona una opción</option>
                  {revenueOptions.map((option) => (
                    <option key={option.floorClp} value={option.floorClp}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="description" className={LABEL_CLASS}>
                  Cuéntanos de tu negocio
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="A que se dedica tu empresa, que quieres lograr..."
                  defaultValue={formData?.description}
                  className={FIELD_CLASS + " resize-none py-3"}
                />
              </div>

              <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--brand-muted)] sm:col-span-2">
                <input
                  type="checkbox"
                  name="privacy"
                  required
                  className="mt-1 size-4 shrink-0 accent-[var(--brand-primary)]"
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
                  </a>{" "}
                  y que usen mis datos para contactarme.
                </span>
              </label>
              <SubmitCta className="sm:col-span-2" trackingId="contacto_enviar">
                Ver horarios disponibles
              </SubmitCta>
            </form>
          )}

          {step.kind === "loading_slots" && (
            <p className="text-sm text-[var(--brand-muted)]">Buscando horarios disponibles...</p>
          )}

          {step.kind === "slots" && (
            <div>
              <div className="flex items-center justify-between">
                <p className={LABEL_CLASS}>Elige un horario</p>
                <button
                  type="button"
                  onClick={() => setStep({ kind: "form" })}
                  className="text-xs font-semibold text-[var(--brand-accent)] underline"
                >
                  Volver
                </button>
              </div>
              <div className="mt-4 flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
                {groupSlotsByDay(step.slots).map((group) => (
                  <div key={group.dayLabel}>
                    <p className="text-xs font-medium capitalize text-[var(--brand-muted)]">
                      {group.dayLabel}
                    </p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {group.slots.map((slot) => (
                        <button
                          key={slot.iso}
                          type="button"
                          onClick={() => handlePickSlot(slot)}
                          className="rounded-[8px] border border-[var(--brand-border)] bg-[var(--brand-surface)] py-2 text-xs font-medium text-[var(--brand-ink)] transition hover:border-[var(--brand-accent)]"
                        >
                          {slot.timeLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step.kind === "booking" && (
            <p className="text-sm text-[var(--brand-muted)]">Agendando tu llamada...</p>
          )}

          {step.kind === "done" && (
            <p className="text-base text-[var(--brand-ink)]">
              Listo, quedó agendada tu llamada de calibración para el {step.whenLabel}. Te llegará
              la confirmación a tu correo.
            </p>
          )}

          {step.kind === "not_qualified" && (
            <p className="text-sm text-[var(--brand-ink)]">
              Por ahora el acompañamiento estructurado de Acelera está pensado para negocios que ya
              facturan desde ${step.minRequiredClp.toLocaleString("es-CL")} CLP mensuales. Te
              recomendamos revisar la asesoría personal de Ignacio Ruiz, que tiene un formato más
              simple y accesible.
            </p>
          )}

          {step.kind === "slot_taken" && (
            <div>
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
            <div>
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
      </div>
    </section>
  );
}
