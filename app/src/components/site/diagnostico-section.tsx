import { useState, type FormEvent } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { SubmitCta } from "./cta";
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

const REVENUE_OPTIONS = ["$10M - $20M CLP", "$20M - $50M CLP", "Sobre $50M CLP"];

const DIGITALIZATION_OPTIONS = [
  "Todo manual (papel, planillas sueltas)",
  "Algunas herramientas digitales sueltas (Excel, WhatsApp)",
  "Sistemas conectados pero poco automatizados",
  "Altamente digitalizado y automatizado",
];

type Status = "idle" | "loading" | "done" | "error";
type DiagnosticoResult = { observations: string[]; pdfBase64: string };

export function DiagnosticoSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DiagnosticoResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      industry: String(form.get("industry") ?? ""),
      revenue: String(form.get("revenue") ?? ""),
      digitalization: String(form.get("digitalization") ?? ""),
      problem: String(form.get("problem") ?? ""),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as DiagnosticoResult;
      setResult(data);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <SectionKicker>Diagnóstico gratis</SectionKicker>
        <h1 className="text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Cuéntanos de tu negocio.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
          Responde estas preguntas y te devolvemos un informe generado a partir de tus
          respuestas — también te lo enviamos por correo.
        </p>

        {status === "done" && result ? (
          <div className="mt-12 rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6">
            <p className={LABEL_CLASS}>Tu diagnóstico</p>
            <ul className="mt-4 flex flex-col gap-3">
              {result.observations.map((observation, i) => (
                <li
                  key={i}
                  className="border-l-2 border-[var(--brand-accent)] bg-[var(--brand-bg)] py-2 pl-4 text-sm leading-relaxed text-[var(--brand-ink)]"
                >
                  {observation}
                </li>
              ))}
            </ul>
            <a
              href={`data:application/pdf;base64,${result.pdfBase64}`}
              download="diagnostico-acelera.pdf"
              className="mt-6 inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none"
            >
              Descargar mi diagnóstico en PDF
            </a>
            <p className="mt-6 text-sm text-[var(--brand-muted)]">
              Te lo enviamos también a tu correo. Si quieres profundizar, respóndelo y
              coordinamos una llamada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className={LABEL_CLASS}>
                  Nombre
                </label>
                <input id="name" name="name" type="text" className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className={LABEL_CLASS}>
                  Correo de la empresa
                </label>
                <input id="email" name="email" type="email" required className={FIELD_CLASS + " h-11"} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className={LABEL_CLASS}>
                  Teléfono (opcional)
                </label>
                <input id="phone" name="phone" type="tel" className={FIELD_CLASS + " h-11"} />
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
              <label htmlFor="digitalization" className={LABEL_CLASS}>
                Nivel de digitalización
              </label>
              <select id="digitalization" name="digitalization" required className={FIELD_CLASS + " h-11"}>
                <option value="">Selecciona una opción</option>
                {DIGITALIZATION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="problem" className={LABEL_CLASS}>
                ¿Cuál es tu principal problema u objetivo hoy?
              </label>
              <textarea id="problem" name="problem" required rows={4} className={FIELD_CLASS + " py-3"} />
            </div>

            {status === "error" ? (
              <p className="text-sm text-[var(--brand-muted)]">
                No pudimos generar tu diagnóstico. Intenta de nuevo en un momento.
              </p>
            ) : null}

            <SubmitCta loading={status === "loading"} trackingId="diagnostico_gratis">Quiero mi diagnóstico gratis</SubmitCta>
          </form>
        )}
      </div>
    </section>
  );
}
