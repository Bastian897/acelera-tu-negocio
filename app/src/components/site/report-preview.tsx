import { useReveal } from "../../hooks/use-reveal";

// Datos de EJEMPLO (la tarjeta lo dice explícitamente). Las dimensiones son
// las mismas cinco del puntaje real (backend: src/lib/maturity.ts, 20 puntos
// cada una) y suman el puntaje total que se muestra.
const DIMENSIONS = [
  { label: "Finanzas y control", score: 12 },
  { label: "Ventas y clientes", score: 14 },
  { label: "Operación y procesos", score: 9 },
  { label: "Equipo y organización", score: 13 },
  { label: "Digitalización y datos", score: 14 },
];
const TOTAL = DIMENSIONS.reduce((sum, d) => sum + d.score, 0);

const OBSERVATIONS = [
  "El 70% de las ventas depende de un solo canal.",
  "Los leads sin respuesta en 48 horas no tienen seguimiento.",
  "El costo fijo creció más rápido que la facturación.",
];

/**
 * Vista previa del informe «escribiéndose»: el anillo del puntaje se llena,
 * las barras por área crecen y las observaciones aparecen una por una.
 * La sección promete un informe real; esto lo muestra en vez de describirlo.
 */
export function ReportPreview() {
  const [ref, phase] = useReveal<HTMLDivElement>(0.4);

  return (
    <div
      ref={ref}
      data-phase={phase}
      className="mx-auto mt-12 max-w-md rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 text-left shadow-[var(--shadow-elevation)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-block rounded-full bg-[var(--ac-blue-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-secondary)]">
            Ejemplo de informe
          </span>
          <p className="mt-3 text-base font-semibold tracking-tight text-[var(--brand-ink)]">
            Puntaje de madurez
          </p>
          <p className="text-xs text-[var(--brand-muted)]">Empresa de servicios, 12 personas</p>
        </div>
        <div
          role="img"
          aria-label={`Puntaje de ejemplo: ${TOTAL} de 100`}
          className="relative h-20 w-20 shrink-0"
          style={{ ["--score" as string]: TOTAL }}
        >
          <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              strokeWidth="6"
              className="stroke-[color:var(--surface-soft)]"
            />
            <circle
              cx="32"
              cy="32"
              r="27"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
              className="report-preview__ring-fg stroke-[color:var(--brand-primary)]"
            />
          </svg>
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-[var(--font-display)] text-2xl font-extrabold tracking-tighter text-[var(--brand-primary)]"
          >
            {TOTAL}
          </span>
        </div>
      </div>

      <ul className="mt-5 grid gap-2.5" aria-label="Puntaje de ejemplo por área">
        {DIMENSIONS.map((d, i) => (
          <li
            key={d.label}
            className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-xs"
          >
            <span className="text-[var(--brand-ink)]">{d.label}</span>
            <span className="tabular-nums text-[var(--brand-muted)]">{d.score}/20</span>
            <span className="col-span-2 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
              <span
                className="report-preview__bar block h-full rounded-full bg-[var(--brand-primary)]"
                style={{ ["--w" as string]: d.score / 20, ["--i" as string]: i }}
              />
            </span>
          </li>
        ))}
      </ul>

      <ol className="mt-5 grid gap-2 border-t border-[var(--brand-border)] pt-4">
        {OBSERVATIONS.map((obs, i) => (
          <li
            key={obs}
            className="report-preview__obs grid grid-cols-[20px_1fr] items-start gap-2 text-sm text-[var(--brand-ink)]"
            style={{ ["--i" as string]: i }}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ac-blue-soft)] text-[10px] font-semibold text-[var(--brand-primary)]">
              {i + 1}
            </span>
            <span className="leading-snug">{obs}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
