import { useState, type FormEvent } from "react";

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
  "$3M - $5M CLP",
  "$5M - $10M CLP",
  "Sobre $10M CLP",
];

const CONTACT_EMAIL = "contacto@aceleratunegocio.cl";

export function ContactSection() {
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const industry = String(form.get("industry") ?? "");
    const revenue = String(form.get("revenue") ?? "");
    const description = String(form.get("description") ?? "");

    const subject = `Consulta de ${name || "un visitante"}, ${industry}`;
    const body = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Telefono: ${phone}`,
      `Industria: ${industry}`,
      `Facturacion mensual: ${revenue}`,
      `Sobre el negocio: ${description}`,
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("done");
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

          {status === "done" ? (
            <p className="mt-10 max-w-sm text-base text-[var(--brand-ink)]">
              Se abrió tu cliente de correo con tus datos. Envíalo y te contactamos dentro de
              las próximas 24 horas hábiles.
            </p>
          ) : (
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

              <SubmitCta className="mt-2">Enviar</SubmitCta>
            </form>
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
