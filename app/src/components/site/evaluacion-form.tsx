import { useState, type FormEvent, type ReactNode } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { SubmitCta } from "./cta";

// Formulario oculto /evaluacion (sin link desde la landing): el cuestionario previo a la
// asesoría de Ignacio Ruiz, con sus preguntas TAL CUAL (2026-10-27). Cada envío le llega
// por correo con un Word (respuestas tal cual) y un PDF ejecutivo; la persona recibe una
// confirmación. Las preguntas, las opciones de la 3 y las keys tienen que calzar EXACTO con
// backend/acelera-backend/src/lib/evaluacion.ts, que es la fuente de verdad.

const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none transition-colors placeholder:text-[var(--brand-muted)]/60 focus-visible:border-[var(--brand-primary)] focus-visible:ring-4 focus-visible:ring-[var(--brand-primary)]/10";
const TEXTAREA_CLASS = FIELD_CLASS + " resize-y py-3 leading-relaxed";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";

const INTRO =
  "Hola, para preparar nuestra asesoría necesito conocer tu situación y entender qué buscas resolver conmigo. Sé concreto; los montos pueden ser aproximados. Si algo no corresponde a tu caso, escribe No aplica. Si no conoces algún dato, escribe No lo sé.";
const CLOSING =
  "Con tus respuestas prepararé nuestra reunión para enfocarnos en lo que necesitas resolver. En los días posteriores a la sesión recibirás un informe con el plan de acción basado en lo conversado.";

const SITUATION_OPTIONS = [
  "Tengo un negocio y quiero mejorarlo",
  "Mi negocio está en dificultades",
  "Quiero emprender",
  "Quiero dejar mi trabajo",
  "Quiero expandirme",
  "Necesito elegir entre varias opciones",
  "Otra situación",
];

// Preguntas de texto libre (todas menos la 2, 3, 15 y 16, que tienen campos propios).
const TEXT_QUESTIONS: Record<number, { key: string; text: string; rows?: number }> = {
  1: { key: "q1", text: "¿Cómo te llamas, en qué ciudad vives y a qué te dedicas actualmente?", rows: 2 },
  4: { key: "q4", text: "¿Qué te hizo buscar esta asesoría justo ahora? Cuéntame brevemente qué está pasando." },
  5: { key: "q5", text: "Completa esta frase con tu principal necesidad: Necesito que Ignacio me ayude a…", rows: 2 },
  6: { key: "q6", text: "¿Qué decisión necesitas tomar, qué opciones estás considerando y para cuándo debes resolverla?" },
  7: {
    key: "q7",
    text: "Describe tu negocio o idea en un máximo de cinco líneas: qué vendes o quieres vender, a quién y desde cuándo estás trabajando en ello. Si aún no tienes una idea definida, cuéntame qué te gustaría hacer.",
    rows: 5,
  },
  8: {
    key: "q8",
    text: "¿Qué experiencia, habilidades o recursos tienes para avanzar? Por ejemplo: experiencia vendiendo, conocimientos, contactos, clientes, herramientas o un espacio disponible.",
  },
  9: {
    key: "q9",
    text: "¿Cuáles son tus dos principales dificultades hoy? Pueden ser falta de dinero, clientes, tiempo, conocimientos, organización, apoyo, miedo a equivocarte u otras. Explica brevemente.",
  },
  10: { key: "q10", text: "¿Qué has intentado para mejorar tu situación y qué resultados obtuviste? Menciona hasta tres acciones concretas." },
  11: { key: "q11", text: "¿Cuánto dinero necesitas al mes para cubrir tus gastos personales y familiares? ¿De dónde provienen hoy esos ingresos?" },
  12: {
    key: "q12",
    text: "¿Con cuánto dinero propio cuentas para emprender o mejorar tu negocio sin comprometer los gastos básicos de tu hogar? Indica por separado si necesitarías financiamiento adicional.",
  },
  13: {
    key: "q13",
    text: "¿Tienes deudas o pagos atrasados que influyan en esta decisión? Indica el total aproximado, cuánto pagas mensualmente y qué compromiso es más urgente.",
  },
  14: {
    key: "q14",
    text: "¿Cuántas horas semanales puedes dedicar a este objetivo y quiénes te ayudarían? Si tienes socios o equipo, explica qué hace cada uno y qué tareas dependen de ti.",
  },
  17: {
    key: "q17",
    text: "Si ya vendes, ¿cuál es tu principal producto o servicio, qué precio tiene y por qué te eligen? Si aún no vendes, ¿has probado tu idea con posibles clientes? Cuéntame si alguien ha pagado o mostrado interés concreto.",
  },
  18: {
    key: "q18",
    text: "¿Cómo consigues clientes y cómo atiendes sus consultas hasta concretar una venta? Indica dónde sientes que se pierden oportunidades. Si aún no comienzas, cuéntame cómo piensas conseguir tus primeros clientes.",
  },
  19: {
    key: "q19",
    text: "¿Qué resultado concreto te gustaría lograr durante los próximos 90 días? Por ejemplo: probar una idea, ordenar tus números, conseguir cinco clientes, aumentar las ventas o decidir si puedes dejar tu trabajo.",
  },
  20: {
    key: "q20",
    text: "¿Qué otra información debería conocer para ayudarte bien? Incluye límites que debamos considerar, compromisos que no puedes descuidar o antecedentes importantes. Puedes adjuntar registros de ventas, gastos o propuestas relacionadas con tu consulta.",
  },
};

const Q2_FIELDS = [
  { key: "instagram", label: "Instagram", placeholder: "@usuario" },
  { key: "tiktok", label: "TikTok", placeholder: "@usuario" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/..." },
  { key: "web", label: "Página web", placeholder: "www.tunegocio.cl" },
  { key: "otras", label: "Otras", placeholder: "" },
];
const Q15_FIELDS = [
  { key: "ingreso", label: "Ingreso mensual actual" },
  { key: "motivo", label: "Motivo por el que quieres salir" },
  { key: "actividad", label: "Actividad con la que buscarías reemplazar ese ingreso" },
  { key: "meses", label: "Meses que podrías cubrir con tus ahorros sin recibir sueldo" },
];
const Q16_FIELDS = [
  { key: "nombre", label: "Nombre del negocio" },
  { key: "tiempo", label: "Tiempo funcionando" },
  { key: "ventas", label: "Ventas de cada uno de los últimos tres meses" },
  { key: "gastos", label: "Gastos mensuales del negocio" },
  { key: "retiro", label: "Dinero que retiras mensualmente para ti" },
  { key: "queda", label: "Dinero que queda después de gastos y retiros" },
  { key: "registro", label: "Cómo registras estos números" },
];

// Mismos límites que parseAttachments en el backend.
const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.txt";

type Status = "idle" | "loading" | "done" | "error";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Question({ n, text, optional, children }: { n: number; text: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-[var(--brand-border)] pt-7">
      <p className="flex gap-3 text-[15px] font-semibold leading-snug text-[var(--brand-ink)]">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ac-blue-soft)] text-xs font-semibold text-[var(--brand-primary)]">
          {n}
        </span>
        <span className="pt-0.5">
          {text}
          {optional ? <span className="ml-1.5 text-xs font-normal text-[var(--brand-muted)]">(opcional)</span> : null}
        </span>
      </p>
      <div className="flex flex-col gap-3 sm:pl-10">{children}</div>
    </div>
  );
}

/** Respuesta rápida "No aplica" / "No lo sé" (el cuestionario pide escribir eso tal cual). */
function QuickFill({ target, onFill }: { target: string; onFill: () => void }) {
  return (
    <div className="flex gap-2">
      {["No aplica", "No lo sé"].map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => {
            const el = document.getElementById(target) as HTMLTextAreaElement | null;
            if (el) el.value = label;
            onFill();
          }}
          className="rounded-[999px] border border-[var(--brand-border)] px-3 py-1 text-xs text-[var(--brand-muted)] transition-colors hover:border-[var(--brand-primary)]/50 hover:text-[var(--brand-ink)]"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Interruptor "No aplica" de las preguntas 15 y 16: oculta los subcampos. */
function NoAplicaToggle({ name, checked, onChange }: { name: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex w-fit cursor-pointer items-center gap-2.5 text-sm text-[var(--brand-ink)]">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--brand-primary)]"
      />
      No aplica
    </label>
  );
}

export function EvaluacionForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [person, setPerson] = useState({ name: "", email: "" });
  const [situations, setSituations] = useState<string[]>([]);
  const [q15na, setQ15na] = useState(false);
  const [q16na, setQ16na] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");

  function updateProgress() {
    const form = document.getElementById("evaluacion-form") as HTMLFormElement | null;
    if (!form) return;
    const data = new FormData(form);
    const has = (k: string) => String(data.get(k) ?? "").trim() !== "";
    const textKeys = ["name", "email", "phone", ...Object.values(TEXT_QUESTIONS).map((q) => q.key)];
    const groupDone = (na: boolean, prefix: string, fields: { key: string }[]) => na || fields.every((f) => has(`${prefix}_${f.key}`));
    const checks = [
      ...textKeys.map(has),
      data.getAll("q3").length > 0,
      groupDone(data.get("q15_na") === "on", "q15", Q15_FIELDS),
      groupDone(data.get("q16_na") === "on", "q16", Q16_FIELDS),
    ];
    setProgress(checks.filter(Boolean).length / checks.length);
  }

  function handleFiles(list: FileList | null) {
    setFileError("");
    const picked = [...(list ?? [])];
    const tooBig = picked.filter((f) => f.size > MAX_FILE_BYTES);
    const ok = picked.filter((f) => f.size <= MAX_FILE_BYTES).slice(0, MAX_FILES);
    if (tooBig.length) setFileError(`Cada archivo puede pesar hasta 5 MB (${tooBig.map((f) => f.name).join(", ")} no se adjuntará).`);
    else if (picked.length > MAX_FILES) setFileError(`Puedes adjuntar hasta ${MAX_FILES} archivos.`);
    setFiles(ok);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (situations.length === 0) {
      setErrorMsg("En la pregunta 3, elige al menos una situación.");
      setStatus("error");
      document.getElementById("q3-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStatus("loading");
    const data = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const [k, v] of data.entries()) if (typeof v === "string" && k !== "q3") payload[k] = v;
    payload.q3 = situations;
    payload.q15_na = q15na;
    payload.q16_na = q16na;

    try {
      payload.attachments = await Promise.all(files.map(async (f) => ({ filename: f.name, contentBase64: await fileToBase64(f) })));
      const res = await fetch(`${BACKEND_URL}/api/evaluacion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Link con ?prueba=1: el backend manda el Word y el PDF al equipo, no a Ignacio.
          ...(new URLSearchParams(window.location.search).get("prueba") === "1" ? { "X-Evaluacion-Test": "1" } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request_failed");
      setPerson({ name: String(payload.name ?? "").split(" ")[0] ?? "", email: String(payload.email ?? "") });
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrorMsg("No pudimos enviar tus respuestas. Revisa tu conexión e intenta de nuevo en un momento.");
      setStatus("error");
    }
  }

  const textQuestion = (n: number) => {
    const q = TEXT_QUESTIONS[n];
    return (
      <Question key={q.key} n={n} text={q.text}>
        <textarea id={q.key} name={q.key} required rows={q.rows ?? 3} aria-label={`Respuesta ${n}`} className={TEXTAREA_CLASS} />
        {n !== 1 && n !== 5 ? <QuickFill target={q.key} onFill={updateProgress} /> : null}
      </Question>
    );
  };

  const subFields = (prefix: string, fields: { key: string; label: string; placeholder?: string }[], required: boolean) => (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-2">
          <label htmlFor={`${prefix}_${f.key}`} className={LABEL_CLASS}>
            {f.label}
          </label>
          <input
            id={`${prefix}_${f.key}`}
            name={`${prefix}_${f.key}`}
            type="text"
            required={required}
            placeholder={f.placeholder ?? (required ? "Si no lo sabes, escribe No lo sé" : "")}
            className={FIELD_CLASS + " h-11"}
          />
        </div>
      ))}
    </div>
  );

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
            {status === "done" ? "Respuestas recibidas" : "Cuestionario previo a la asesoría"}
          </p>
          <span aria-hidden="true" className="mt-2 block h-[3px] w-10 rounded-full bg-[var(--brand-accent)]" />
          <h1 className="mt-5 text-3xl font-semibold tracking-tighter text-[var(--ac-white)] md:text-5xl">
            {status === "done" ? `¡Gracias${person.name ? `, ${person.name}` : ""}!` : "Preparemos tu asesoría."}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
            {status === "done" ? "Recibimos tus respuestas correctamente." : INTRO}
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
              <p className="text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">{CLOSING}</p>
              {person.email ? (
                <p className="text-sm text-[var(--brand-muted)]">
                  Te enviamos una confirmación a <strong className="text-[var(--brand-ink)]">{person.email}</strong>.
                </p>
              ) : null}
            </div>
          ) : (
            <form id="evaluacion-form" onSubmit={handleSubmit} onChange={updateProgress} className="flex flex-col gap-7">
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

              <p className="rounded-[12px] bg-[var(--ac-blue-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--brand-ink)]">
                Todas las preguntas son obligatorias, salvo las marcadas como <strong>(opcional)</strong>. Si algo no
                aplica a tu caso o no conoces el dato, usa los botones <strong>No aplica</strong> o <strong>No lo sé</strong>.
              </p>

              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold tracking-tight text-[var(--brand-ink)]">Tus datos de contacto</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { key: "name", label: "Nombre", type: "text", auto: "name" },
                    { key: "email", label: "Correo", type: "email", auto: "email" },
                    { key: "phone", label: "WhatsApp", type: "tel", auto: "tel" },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-col gap-2">
                      <label htmlFor={f.key} className={LABEL_CLASS}>
                        {f.label}
                      </label>
                      <input id={f.key} name={f.key} type={f.type} required autoComplete={f.auto} className={FIELD_CLASS + " h-11"} />
                    </div>
                  ))}
                </div>
              </div>

              {textQuestion(1)}

              <Question n={2} optional text="Comparte los enlaces de tus redes sociales personales y de tu negocio o proyecto, si tienes.">
                {subFields("q2", Q2_FIELDS, false)}
              </Question>

              <div id="q3-anchor">
                <Question
                  n={3}
                  text="¿Cuál de estas situaciones describe mejor tu momento? Puedes elegir más de una: tengo un negocio y quiero mejorarlo; mi negocio está en dificultades; quiero emprender; quiero dejar mi trabajo; quiero expandirme; necesito elegir entre varias opciones; otra situación."
                >
                  <div className="flex flex-wrap gap-2">
                    {SITUATION_OPTIONS.map((option) => (
                      <label key={option} className="cursor-pointer">
                        <input
                          type="checkbox"
                          name="q3"
                          value={option}
                          checked={situations.includes(option)}
                          onChange={(e) =>
                            setSituations((prev) => (e.target.checked ? [...prev, option] : prev.filter((s) => s !== option)))
                          }
                          className="peer sr-only"
                        />
                        <span className="inline-flex min-h-10 items-center rounded-[999px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-primary)]/50 peer-checked:border-[var(--brand-primary)] peer-checked:bg-[var(--brand-primary)] peer-checked:text-[var(--ac-white)] peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--brand-primary)]/20">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                  {situations.includes("Otra situación") ? (
                    <input name="q3_other" type="text" required placeholder="¿Cuál es tu situación?" className={FIELD_CLASS + " h-11"} />
                  ) : null}
                </Question>
              </div>

              {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(textQuestion)}

              <Question n={15} text="Si estás pensando en dejar tu trabajo, completa lo siguiente. Si no es tu caso, escribe No aplica.">
                <NoAplicaToggle name="q15_na" checked={q15na} onChange={setQ15na} />
                {q15na ? null : subFields("q15", Q15_FIELDS, true)}
              </Question>

              <Question
                n={16}
                text="Si tienes un negocio funcionando, completa estos datos. Si todavía no vendes, escribe No aplica. Distingue lo que sabes de lo que estás estimando."
              >
                <NoAplicaToggle name="q16_na" checked={q16na} onChange={setQ16na} />
                {q16na ? null : subFields("q16", Q16_FIELDS, true)}
              </Question>

              {[17, 18, 19].map(textQuestion)}

              <Question n={20} text={TEXT_QUESTIONS[20].text}>
                <textarea id="q20" name="q20" required rows={3} aria-label="Respuesta 20" className={TEXTAREA_CLASS} />
                <QuickFill target="q20" onFill={updateProgress} />
                <label className="flex cursor-pointer flex-col items-start gap-1 rounded-[12px] border border-dashed border-[var(--brand-border)] px-4 py-4 transition-colors hover:border-[var(--brand-primary)]/50">
                  <span className="text-sm font-medium text-[var(--brand-primary)]">+ Adjuntar archivos (opcional)</span>
                  <span className="text-xs text-[var(--brand-muted)]">Hasta 3 archivos de 5 MB: PDF, Word, Excel, imágenes.</span>
                  <input type="file" multiple accept={ACCEPT} onChange={(e) => handleFiles(e.target.files)} className="sr-only" />
                </label>
                {files.length ? (
                  <ul className="flex flex-col gap-1 text-sm text-[var(--brand-ink)]">
                    {files.map((f) => (
                      <li key={f.name}>📎 {f.name}</li>
                    ))}
                  </ul>
                ) : null}
                {fileError ? <p className="text-xs text-[var(--ac-bad)]">{fileError}</p> : null}
              </Question>

              <div className="flex flex-col gap-3 border-t border-[var(--brand-border)] pt-7">
                <p className="text-sm leading-relaxed text-[var(--brand-muted)]">{CLOSING}</p>
                {status === "error" ? (
                  <p className="rounded-[10px] bg-[var(--ac-bad-soft)] px-4 py-3 text-sm text-[var(--ac-bad)]">{errorMsg}</p>
                ) : null}
                <SubmitCta loading={status === "loading"}>Enviar respuestas</SubmitCta>
                <p className="text-center text-xs leading-relaxed text-[var(--brand-muted)]">
                  Tus datos solo los usa Acelera para preparar tu asesoría.{" "}
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
