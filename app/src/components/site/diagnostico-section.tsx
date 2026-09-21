import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

import { BACKEND_URL } from "@/lib/backend";
import { captureReferralFromUrl, claimReferral } from "@/lib/referral";
import { SubmitCta } from "./cta";
import { DiagnosticoConfirmation, type DiagnosticoScheduled } from "./diagnostico-confirmation";
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

const SALES_CHANNEL_OPTIONS = [
  "Tienda física",
  "E-commerce propio",
  "Marketplace (Mercado Libre, etc.)",
  "Redes sociales / WhatsApp",
  "Venta B2B directa",
  "Otro",
];

const GOAL_OPTIONS = [
  "Vender más",
  "Ordenar la operación",
  "Reducir costos",
  "Escalar el equipo",
  "Automatizar procesos con IA",
  "Otro",
];

const TEAM_SIZE_OPTIONS = ["Solo yo", "2-5 personas", "6-15 personas", "16-50 personas", "Más de 50 personas"];

// Preguntas del puntaje del negocio (2026-09-20, ampliadas 2026-09-21 para medir el negocio
// completo y no solo lo digital). Al backend NO viaja el texto de la opción sino su nivel
// (1 = la primera, 4 = la última), así que retocar la redacción de acá no cambia el cálculo.
// El significado de cada nivel vive en el backend (MATURITY_QUESTIONS en src/lib/maturity.ts):
// si se cambia el sentido de una opción, hay que cambiarlo en los dos lados. Van agrupadas por
// área: finanzas, ventas (2), operación, equipo (2) y datos.
const MATURITY_QUESTIONS = [
  {
    key: "finance",
    label: "¿Cómo llevas hoy las finanzas del negocio (caja, márgenes y costos)?",
    options: [
      "No tengo claro cuánto gano; me guío por lo que hay en la cuenta",
      "Llevo ingresos y gastos en una planilla, pero sin ver márgenes",
      "Tengo la contabilidad al día y reviso mis márgenes cada mes",
      "Tengo presupuesto, flujo de caja proyectado y márgenes por producto o servicio",
    ],
  },
  {
    key: "acquisition",
    label: "¿Cómo consigues y das seguimiento a tus clientes?",
    options: [
      "Me llegan por recomendación o redes, sin un registro ordenado",
      "Llevo una lista de clientes en una planilla o cuaderno",
      "Tengo un método para conseguir clientes, pero el seguimiento es manual",
      "Tengo un proceso comercial con seguimiento, metas y resultados que reviso",
    ],
  },
  {
    key: "sales",
    label: "¿Cómo gestionas las consultas y las ventas a tus clientes?",
    options: [
      "Por WhatsApp o correo, sin un registro ordenado",
      "Llevo una lista de clientes en una planilla o cuaderno",
      "Uso un CRM o sistema, pero el seguimiento es manual",
      "Tengo un CRM con seguimiento y respuestas automatizadas",
    ],
  },
  {
    key: "processes",
    label: "¿Cómo se hacen hoy los procesos clave (cotizar, vender, entregar y cobrar)?",
    options: [
      "Depende de la memoria y de cada persona",
      "Cada uno lo hace a su manera, con algunas notas o planillas",
      "Están definidos y escritos, pero no siempre se cumplen",
      "Están documentados, se cumplen y se mejoran cada cierto tiempo",
    ],
  },
  {
    key: "dependence",
    label: "¿Qué pasa con el negocio si te ausentas una semana? (si trabajas solo, responde por ti)",
    options: [
      "Casi todo se detiene: todo depende de mí",
      "Se apagan incendios, pero las decisiones importantes esperan",
      "Funciona lo básico; el equipo sabe qué hacer en lo habitual",
      "Funciona con normalidad: hay roles claros, metas y responsables",
    ],
  },
  {
    key: "team",
    label: "¿Cómo usa tu equipo las herramientas digitales? (si trabajas solo, responde por ti)",
    options: [
      "Prefieren lo manual y cuesta que adopten algo nuevo",
      "Usan algunas herramientas, pero cada quien las suyas",
      "Usan las mismas herramientas, con una capacitación básica",
      "Todos usan las herramientas del negocio y proponen mejoras",
    ],
  },
  {
    key: "data",
    label: "¿Con qué datos tomas decisiones (ventas, márgenes, caja)?",
    options: [
      "Con la intuición y lo que recuerdo",
      "Reviso cifras cuando las necesito, armadas a mano",
      "Tengo un informe periódico, pero hay que armarlo a mano",
      "Tengo un panel o reporte al día que se actualiza solo",
    ],
  },
] as const;

type Status = "idle" | "loading" | "done" | "error";

export function DiagnosticoSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<DiagnosticoScheduled | null>(null);
  // Para saludar por nombre y empresa en la confirmación (lo que la persona escribió al enviar).
  const [person, setPerson] = useState<{ name: string; companyName: string }>({ name: "", companyName: "" });

  // Guarda el código de referido de la URL (?ref=) para atribuirlo al enviar
  // el formulario; vive en un efecto porque el sitio se prerenderiza sin window.
  useEffect(() => {
    captureReferralFromUrl();
  }, []);

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
      salesChannel: String(form.get("salesChannel") ?? ""),
      goal: String(form.get("goal") ?? ""),
      teamSize: String(form.get("teamSize") ?? ""),
      triedTools: String(form.get("triedTools") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      website: String(form.get("website") ?? ""),
      instagram: String(form.get("instagram") ?? ""),
      permanentClients: String(form.get("permanentClients") ?? ""),
      newClients: String(form.get("newClients") ?? ""),
      bestMonth: String(form.get("bestMonth") ?? ""),
      bestMonthAmount: String(form.get("bestMonthAmount") ?? ""),
      worstMonth: String(form.get("worstMonth") ?? ""),
      problem: String(form.get("problem") ?? ""),
      // Consentimiento explícito (casilla obligatoria): el backend guarda la fecha en el lead.
      privacyAccepted: form.get("privacy") === "on",
      // Niveles 1 a 4 (ver MATURITY_QUESTIONS). Si una viniera vacía, el
      // backend simplemente la ignora.
      maturityAnswers: Object.fromEntries(
        MATURITY_QUESTIONS.map((q) => [q.key, Number(form.get(`maturity_${q.key}`)) || null]),
      ),
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnostico`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as DiagnosticoScheduled;
      setResult(data);
      setPerson({ name: payload.name, companyName: payload.companyName });
      setStatus("done");
      claimReferral(payload.email);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
        >
          <span aria-hidden="true">←</span> Volver al inicio
        </Link>
        <SectionKicker>Diagnóstico gratis</SectionKicker>
        <h1 className="text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Cuéntanos de tu negocio.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
          Responde estas preguntas y te enviamos por correo el puntaje de tu negocio y un
          informe generado a partir de tus respuestas. Lo recibes el próximo día hábil a las 9:00 am.
        </p>

        {status === "done" && result ? (
          <DiagnosticoConfirmation result={result} name={person.name} companyName={person.companyName} />
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
                <label htmlFor="companyName" className={LABEL_CLASS}>
                  Nombre de tu empresa
                </label>
                <input id="companyName" name="companyName" type="text" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="website" className={LABEL_CLASS}>
                  Página web
                </label>
                <input id="website" name="website" type="text" required className={FIELD_CLASS + " h-11"} />
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

            <div className="grid gap-5 sm:grid-cols-2">
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
                <label htmlFor="salesChannel" className={LABEL_CLASS}>
                  Canal de venta principal
                </label>
                <select id="salesChannel" name="salesChannel" required className={FIELD_CLASS + " h-11"}>
                  <option value="">Selecciona una opción</option>
                  {SALES_CHANNEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="goal" className={LABEL_CLASS}>
                  Objetivo principal (próximos 6-12 meses)
                </label>
                <select id="goal" name="goal" required className={FIELD_CLASS + " h-11"}>
                  <option value="">Selecciona una opción</option>
                  {GOAL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="teamSize" className={LABEL_CLASS}>
                  Tamaño del equipo
                </label>
                <select id="teamSize" name="teamSize" required className={FIELD_CLASS + " h-11"}>
                  <option value="">Selecciona una opción</option>
                  {TEAM_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="instagram" className={LABEL_CLASS}>
                  Instagram
                </label>
                <input id="instagram" name="instagram" type="text" placeholder="@tuempresa" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="permanentClients" className={LABEL_CLASS}>
                  Clientes permanentes
                </label>
                <input id="permanentClients" name="permanentClients" type="text" required className={FIELD_CLASS + " h-11"} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="newClients" className={LABEL_CLASS}>
                  Clientes nuevos o variables al mes
                </label>
                <input id="newClients" name="newClients" type="text" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="bestMonth" className={LABEL_CLASS}>
                  Mes que más facturaste en el año
                </label>
                <input id="bestMonth" name="bestMonth" type="text" placeholder="Ej: Diciembre" required className={FIELD_CLASS + " h-11"} />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="bestMonthAmount" className={LABEL_CLASS}>
                  Monto facturado ese mes
                </label>
                <input id="bestMonthAmount" name="bestMonthAmount" type="text" required className={FIELD_CLASS + " h-11"} />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="worstMonth" className={LABEL_CLASS}>
                  Mes que menos facturaste en el año
                </label>
                <input id="worstMonth" name="worstMonth" type="text" placeholder="Ej: Marzo" required className={FIELD_CLASS + " h-11"} />
              </div>
            </div>

            <fieldset className="flex flex-col gap-5 rounded-[16px] border border-[var(--brand-border)] p-5">
              <legend className="px-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-accent)]">
                Cómo funciona tu negocio hoy
              </legend>
              <p className="text-sm leading-relaxed text-[var(--brand-muted)]">
                Siete preguntas rápidas sobre finanzas, ventas, operación, equipo y datos. Elige la opción que más
                se parezca a tu negocio hoy y te damos un puntaje de 0 a 100.
              </p>
              {MATURITY_QUESTIONS.map((q) => (
                <div key={q.key} className="flex flex-col gap-2">
                  <label htmlFor={`maturity_${q.key}`} className="text-sm font-medium text-[var(--brand-ink)]">
                    {q.label}
                  </label>
                  <select id={`maturity_${q.key}`} name={`maturity_${q.key}`} required className={FIELD_CLASS + " h-11"}>
                    <option value="">Selecciona una opción</option>
                    {q.options.map((option, i) => (
                      <option key={option} value={i + 1}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </fieldset>

            <div className="flex flex-col gap-2">
              <label htmlFor="problem" className={LABEL_CLASS}>
                ¿Cuál es tu principal problema u objetivo hoy?
              </label>
              <textarea id="problem" name="problem" required rows={4} className={FIELD_CLASS + " py-3"} />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="triedTools" className={LABEL_CLASS}>
                ¿Qué has intentado o qué herramientas usan hoy? (opcional)
              </label>
              <textarea id="triedTools" name="triedTools" rows={3} className={FIELD_CLASS + " py-3"} />
            </div>

            {status === "error" ? (
              <p className="text-sm text-[var(--brand-muted)]">
                No pudimos generar tu diagnóstico. Intenta de nuevo en un momento.
              </p>
            ) : null}

            <label className="flex items-start gap-3 text-sm leading-relaxed text-[var(--brand-muted)]">
              <input type="checkbox" name="privacy" required className="mt-1 size-4 shrink-0 accent-[var(--brand-primary)]" />
              <span>
                He leído y acepto la{" "}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="underline">
                  Política de Privacidad
                </a>
                y que mis respuestas se procesen con herramientas de inteligencia artificial para generar mi diagnóstico.
              </span>
            </label>
            <SubmitCta loading={status === "loading"} trackingId="diagnostico_gratis">Quiero mi diagnóstico gratis</SubmitCta>
            <p className="text-xs leading-relaxed text-[var(--brand-muted)]">
              Llega a tu correo el próximo día hábil a las 9:00 am (1 día hábil).
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
