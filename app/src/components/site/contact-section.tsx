import { useState, type FormEvent } from "react";

import { submitContact } from "@/lib/api/leads.functions";

import { SubmitCta } from "./cta";

const FIELD_CLASS =
  "h-11 w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]/70 focus-visible:border-[var(--brand-accent)]";
const LABEL_CLASS =
  "font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--brand-muted)]";

const INDUSTRY_OPTIONS = [
  "Marketing",
  "E-commerce",
  "Gastronomía",
  "Salud y estética",
  "Fotografía",
  "Otro",
];

const REVENUE_OPTIONS = [
  "$3M - $5M CLP",
  "$5M - $10M CLP",
  "Sobre $10M CLP",
];

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    try {
      await submitContact({
        data: {
          email: String(form.get("email") ?? ""),
          industry: String(form.get("industry") ?? ""),
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          revenue: String(form.get("revenue") ?? ""),
        },
      });
      setStatus("done");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contacto" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand-muted)]">
            Contacto
          </p>
          <h2 className="reveal-up mt-4 max-w-md text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
            Agenda tu llamada de calibración.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
            30 minutos para revisar tu negocio y decirte, sin vueltas, si podemos ayudarte a
            acelerar.
          </p>

          {status === "done" ? (
            <p className="mt-10 max-w-sm text-base text-[var(--brand-ink)]">
              Recibimos tus datos. Te contactamos dentro de las próximas 24 horas hábiles.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 flex max-w-sm flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className={LABEL_CLASS}>
                  Nombre
                </label>
                <input id="name" name="name" type="text" required className={FIELD_CLASS} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={LABEL_CLASS + " flex items-center gap-1.5"}>
                  <img src="/assets/icons/icon-email.png" alt="" className="h-3.5 w-3.5 opacity-70" width={14} height={14} />
                  Email
                </label>
                <input id="email" name="email" type="email" required className={FIELD_CLASS} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className={LABEL_CLASS + " flex items-center gap-1.5"}>
                  <img src="/assets/icons/icon-telefono.png" alt="" className="h-3.5 w-3.5 opacity-70" width={14} height={14} />
                  Teléfono
                </label>
                <input id="phone" name="phone" type="tel" required className={FIELD_CLASS} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="industry" className={LABEL_CLASS}>
                  Industria
                </label>
                <select id="industry" name="industry" required className={FIELD_CLASS}>
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
                <select id="revenue" name="revenue" required className={FIELD_CLASS}>
                  <option value="">Selecciona una opción</option>
                  {REVENUE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <SubmitCta loading={status === "loading"} className="mt-2">
                Enviar
              </SubmitCta>

              {status === "error" ? (
                <p className="text-sm text-[var(--brand-ink)]">
                  No pudimos enviar el formulario. Intenta de nuevo.
                </p>
              ) : null}
            </form>
          )}
        </div>

        <div className="relative min-h-[20rem] overflow-hidden rounded-2xl border border-[var(--brand-border)] md:min-h-[32rem]">
          <img
            src="/assets/plates/contacto-dial.jpg"
            alt="Macro fotografía de un cronómetro de titanio cepillado"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-bg)] via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 right-6 font-mono text-xs uppercase tracking-[0.15em] text-[var(--brand-muted)]">
            Herramientas de precisión. Decisiones claras.
          </p>
        </div>
      </div>
    </section>
  );
}
