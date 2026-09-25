import { openAceleraChat } from "./chat-widget";

// Lo que responde POST /api/diagnostico: el diagnóstico ya está generado y se
// encola para salir de inmediato (ver routes/diagnostico.ts). Todos los campos son
// opcionales a propósito: si el backend respondiera con otra forma (por ejemplo una
// versión anterior desplegada), la pantalla no se rompe y muestra un texto genérico
// y verdadero.
export type DiagnosticoScheduled = {
  scheduled?: boolean;
  deliveryLabel?: string;
};

const FALLBACK_WHEN = "en los próximos minutos";

// Nombre y empresa que la persona escribió en el formulario: la confirmación la trata por su
// nombre y menciona su empresa, para que se sienta atendida y no un trámite genérico.
export function DiagnosticoConfirmation({
  result,
  name,
  companyName,
}: {
  result: DiagnosticoScheduled;
  name?: string;
  companyName?: string;
}) {
  const firstName = name?.trim().split(/\s+/)[0] ?? "";
  const company = companyName?.trim() ?? "";
  const title =
    firstName && company
      ? `Gracias, ${firstName}. Recibimos el diagnóstico de ${company}`
      : company
        ? `Recibimos el diagnóstico de ${company}`
        : firstName
          ? `Gracias, ${firstName}. Recibimos tu diagnóstico`
          : "Recibimos tu diagnóstico";
  // Solo se afirma la fecha si el backend confirmó que quedó programado; si no,
  // el texto no promete un plazo que no podemos garantizar.
  const when = result.scheduled ? (result.deliveryLabel ?? FALLBACK_WHEN) : null;

  return (
    <div className="mt-12 flex flex-col gap-8" role="status" aria-live="polite">
      <div className="rounded-[24px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 md:p-8">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-[var(--ac-blue-soft)] text-lg text-[var(--brand-secondary)]"
        >
          ✓
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
          {when ? (
            <>
              Te lo enviamos a tu correo <strong className="font-semibold text-[var(--brand-ink)]">{when}</strong>.
            </>
          ) : (
            <>Te lo enviamos a tu correo.</>
          )}{" "}
          Incluye el puntaje de tu negocio, el desglose por área y observaciones concretas,
          en un PDF.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--brand-muted)]">
          Si no lo ves, revisa la carpeta de spam o promociones.
        </p>
      </div>

      <div className="flex flex-col items-start gap-3">
        <p className="text-sm leading-relaxed text-[var(--brand-muted)]">
          Si prefieres conversar antes, puedes agendar una llamada con nosotros.
        </p>
        <button
          type="button"
          onClick={() => openAceleraChat()}
          className="inline-flex min-h-11 items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-primary)] active:scale-[0.97] motion-reduce:transition-none"
        >
          Agendar una llamada
        </button>
      </div>
    </div>
  );
}
