import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";

import { trackCtaClick } from "../../lib/analytics";
import {
  HOURS_PER_MONTH_FOR_SALARY,
  LIMITS,
  computeLeaks,
  formatCLP,
  formatCLPCompact,
  formatHours,
  formatInteger,
  parseLocalNumber,
  type CostMode,
  type LeakKey,
} from "../../lib/roi";

// El copy de esta sección vive aquí a propósito y no en siteContent: ese archivo
// está atado al contenido editable del backend y esta calculadora no lo necesita.
//
// Concepto: un mapa de fugas. Todas las cifras las escribe la persona y la
// calculadora solo las suma; no hay porcentajes de mejora ni promedios de
// industria inventados por nosotros (ver roi.ts).

// Mismo lenguaje que los campos de contact-section, con dos diferencias
// deliberadas: 16px en móvil (evita el zoom automático de iOS al enfocar) y un
// contorno de foco real, porque el cambio de borde solo no se ve bien.
const FIELD_CLASS =
  "w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-base text-[var(--brand-ink)] placeholder:text-[var(--brand-muted)]/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-primary)] sm:text-sm";
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";
const HINT_CLASS = "text-xs leading-relaxed text-[var(--brand-muted)]";
const SEGMENT_CLASS =
  "flex min-h-11 cursor-pointer flex-col justify-center rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-left text-sm font-medium text-[var(--brand-ink)] transition-colors peer-checked:border-[var(--brand-primary)] peer-checked:bg-[var(--ac-blue-soft)] peer-checked:text-[var(--brand-secondary)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--brand-primary)] motion-reduce:transition-none";

// Orden y textos de las categorías que suman. La ayuda dice qué incluir, con
// ejemplos de la vida real de un negocio chileno.
const LEAK_LABEL: Record<LeakKey, string> = {
  team: "Tiempo del equipo en trabajo manual",
  errors: "Errores, retrabajo y mermas",
  lostSales: "Ventas que se pierden",
  subscriptions: "Herramientas y suscripciones",
  inflatedCosts: "Gastos operativos inflados",
};

const MONEY_FIELDS: ReadonlyArray<{
  key: "errors" | "lostSales" | "subscriptions" | "inflatedCosts";
  label: string;
  hint: string;
  placeholder: string;
}> = [
  {
    key: "errors",
    label: "Errores, retrabajo y mermas",
    hint: "Pedidos mal despachados, devoluciones, descuentos por fallas, productos que se pierden, trabajo que hay que rehacer. Pesos al mes.",
    placeholder: "Ej: 300.000",
  },
  {
    key: "lostSales",
    label: "Ventas que se pierden",
    hint: "Clientes que se fueron por responder tarde, cotizaciones sin seguimiento, reservas que no se concretaron. Pesos al mes.",
    placeholder: "Ej: 800.000",
  },
  {
    key: "subscriptions",
    label: "Herramientas y suscripciones",
    hint: "Programas que pagas y nadie usa, o que hacen lo mismo que otro. Pesos al mes.",
    placeholder: "Ej: 120.000",
  },
  {
    key: "inflatedCosts",
    label: "Gastos operativos inflados",
    hint: "Lo que ya sabes que se paga de más: arriendos, transporte, comisiones, insumos, horas extra. Solo el sobrecosto, no el gasto total. Pesos al mes.",
    placeholder: "Ej: 500.000",
  },
];

/** Solo dígitos, con separador de miles, recortado al tope. Vacío queda vacío
 * (no se fuerza un "0" mientras la persona está escribiendo). */
function cleanInteger(raw: string, max: number): string {
  const n = parseLocalNumber(raw);
  if (Number.isNaN(n)) return "";
  return formatInteger(Math.min(n, max));
}

/** Horas admiten decimales ("2,5"). Un solo separador, coma como estándar. */
function cleanDecimal(raw: string, max: number): string {
  const n = parseLocalNumber(raw, true);
  if (Number.isNaN(n)) return "";
  if (n > max) return String(max);
  const cleaned = raw.replace(/[^\d.,]/g, "").replace(/\./g, ",");
  const first = cleaned.indexOf(",");
  const oneSep = first === -1 ? cleaned : cleaned.slice(0, first + 1) + cleaned.slice(first + 1).replace(/,/g, "");
  // Máximo 2 decimales: más no aporta nada en una estimación.
  return oneSep.replace(/^(\d*,\d{2}).*$/, "$1");
}

function MoneyInput({
  id,
  value,
  onChange,
  placeholder,
  describedBy,
  max,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  describedBy?: string;
  max: number;
}) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-[var(--brand-muted)] sm:text-sm"
      >
        $
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(cleanInteger(e.target.value, max))}
        aria-describedby={describedBy}
        className={FIELD_CLASS + " h-12 pl-8"}
      />
    </div>
  );
}

export function RoiCalculator() {
  const uid = useId();
  const [people, setPeople] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [costMode, setCostMode] = useState<CostMode>("monthly");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [hourlyCost, setHourlyCost] = useState("");
  const [errors, setErrors] = useState("");
  const [lostSales, setLostSales] = useState("");
  const [subscriptions, setSubscriptions] = useState("");
  const [inflatedCosts, setInflatedCosts] = useState("");
  const [overdueAmount, setOverdueAmount] = useState("");
  const [overdueDays, setOverdueDays] = useState("");

  const setters = { errors: setErrors, lostSales: setLostSales, subscriptions: setSubscriptions, inflatedCosts: setInflatedCosts };
  const values = { errors, lostSales, subscriptions, inflatedCosts };

  // Un campo vacío parsea a NaN y computeLeaks lo trata como 0: no rompe nada.
  const result = useMemo(
    () =>
      computeLeaks({
        people: parseLocalNumber(people),
        hoursPerWeek: parseLocalNumber(hoursPerWeek, true),
        costMode,
        monthlySalary: parseLocalNumber(monthlySalary),
        hourlyCost: parseLocalNumber(hourlyCost),
        errors: parseLocalNumber(errors),
        lostSales: parseLocalNumber(lostSales),
        subscriptions: parseLocalNumber(subscriptions),
        inflatedCosts: parseLocalNumber(inflatedCosts),
        overdueAmount: parseLocalNumber(overdueAmount),
        overdueDays: parseLocalNumber(overdueDays),
      }),
    [people, hoursPerWeek, costMode, monthlySalary, hourlyCost, errors, lostSales, subscriptions, inflatedCosts, overdueAmount, overdueDays],
  );

  // Resumen para lectores de pantalla. Va con debounce: anunciar cada tecla
  // mientras se escribe "900.000" sería ruido. Lo visible se actualiza al instante.
  const summary = useMemo(() => {
    if (!result.ready) return "Escribe al menos un monto para ver cuánto se te va cada mes.";
    return `Declaras que se te van ${formatCLP(result.monthlyTotal)} al mes, ${formatCLP(result.annualTotal)} al año. Lo que más pesa: ${
      result.largest ? LEAK_LABEL[result.largest.key] : ""
    }.`;
  }, [result]);
  const [announced, setAnnounced] = useState("");
  useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(summary), 700);
    return () => window.clearTimeout(id);
  }, [summary]);

  const pct = (share: number) => `${formatHours(share * 100)}%`;

  return (
    <section
      id="calculadora"
      aria-labelledby={`${uid}-title`}
      className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
            Mapa de fugas
          </p>
          <h2
            id={`${uid}-title`}
            className="reveal-up mt-4 text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl"
          >
            Cuánto se te va cada mes sin que lo veas
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--brand-muted)] md:text-base">
            Escribe solo lo que sabes o puedes estimar. Lo que no sepas, déjalo vacío. La suma ocurre en tu
            navegador y no guardamos nada.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-start">
          {/* Entradas */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-8 rounded-[24px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 md:p-8"
            aria-label="Lo que se te va cada mes"
            noValidate
          >
            {/* 1. Tiempo del equipo */}
            <fieldset className="flex flex-col gap-4">
              <legend className={LABEL_CLASS + " mb-2"}>1. Tiempo del equipo en trabajo manual</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${uid}-people`} className="text-sm font-medium text-[var(--brand-ink)]">
                    Personas
                  </label>
                  <input
                    id={`${uid}-people`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Ej: 3"
                    value={people}
                    onChange={(e) => setPeople(cleanInteger(e.target.value, LIMITS.people))}
                    className={FIELD_CLASS + " h-12"}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${uid}-hours`} className="text-sm font-medium text-[var(--brand-ink)]">
                    Horas por semana, por persona
                  </label>
                  <input
                    id={`${uid}-hours`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="Ej: 5"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(cleanDecimal(e.target.value, LIMITS.hoursPerWeek))}
                    className={FIELD_CLASS + " h-12"}
                  />
                </div>
              </div>
              <p className={HINT_CLASS}>
                Digitar datos, cuadrar planillas, cotizar a mano, responder lo mismo una y otra vez, armar reportes.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["monthly", "Sueldo mensual"],
                    ["hourly", "Costo por hora"],
                  ] as const
                ).map(([value, label]) => (
                  <div key={value} className="relative">
                    <input
                      type="radio"
                      name={`${uid}-costMode`}
                      id={`${uid}-cost-${value}`}
                      value={value}
                      checked={costMode === value}
                      onChange={() => setCostMode(value)}
                      className="peer sr-only"
                    />
                    <label htmlFor={`${uid}-cost-${value}`} className={SEGMENT_CLASS}>
                      {label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor={`${uid}-cost`} className="sr-only">
                  {costMode === "monthly" ? "Sueldo mensual en pesos chilenos" : "Costo por hora en pesos chilenos"}
                </label>
                <MoneyInput
                  id={`${uid}-cost`}
                  value={costMode === "monthly" ? monthlySalary : hourlyCost}
                  onChange={costMode === "monthly" ? setMonthlySalary : setHourlyCost}
                  placeholder={costMode === "monthly" ? "Ej: 900.000" : "Ej: 5.000"}
                  describedBy={`${uid}-cost-hint`}
                  max={costMode === "monthly" ? LIMITS.monthlySalary : LIMITS.hourlyCost}
                />
                <p id={`${uid}-cost-hint`} className={HINT_CLASS}>
                  {costMode === "monthly"
                    ? `Lo convertimos a costo por hora dividiendo por ${HOURS_PER_MONTH_FOR_SALARY} horas al mes${
                        result.hourlyCost > 0 ? `: equivale a ${formatCLP(result.hourlyCost)} por hora` : ""
                      }. Ojo: para la empresa una persona cuesta más que su sueldo líquido (cotizaciones, vacaciones, equipo). Si conoces el costo total, ingrésalo como costo por hora.`
                    : "Lo que le cuesta a la empresa una hora de esa persona, considerando todo."}
                </p>
              </div>
            </fieldset>

            {/* 2 a 5. Montos en pesos al mes */}
            {MONEY_FIELDS.map((field, index) => (
              <div key={field.key} className="flex flex-col gap-2">
                <label htmlFor={`${uid}-${field.key}`} className={LABEL_CLASS}>
                  {index + 2}. {field.label}
                </label>
                <MoneyInput
                  id={`${uid}-${field.key}`}
                  value={values[field.key]}
                  onChange={setters[field.key]}
                  placeholder={field.placeholder}
                  describedBy={`${uid}-${field.key}-hint`}
                  max={LIMITS.monthlyAmount}
                />
                <p id={`${uid}-${field.key}-hint`} className={HINT_CLASS}>
                  {field.hint}
                </p>
              </div>
            ))}

            {/* Aparte: no suma al total */}
            <fieldset className="flex flex-col gap-4 border-t border-[var(--brand-border)] pt-6">
              <legend className={LABEL_CLASS + " mb-2"}>Opcional, no se suma al total</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${uid}-overdue`} className="text-sm font-medium text-[var(--brand-ink)]">
                    Facturas vencidas por cobrar
                  </label>
                  <MoneyInput
                    id={`${uid}-overdue`}
                    value={overdueAmount}
                    onChange={setOverdueAmount}
                    placeholder="Ej: 4.000.000"
                    max={LIMITS.overdueAmount}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${uid}-overdue-days`} className="text-sm font-medium text-[var(--brand-ink)]">
                    Días de atraso promedio
                  </label>
                  <input
                    id={`${uid}-overdue-days`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Ej: 45"
                    value={overdueDays}
                    onChange={(e) => setOverdueDays(cleanInteger(e.target.value, LIMITS.overdueDays))}
                    className={FIELD_CLASS + " h-12"}
                  />
                </div>
              </div>
              <p className={HINT_CLASS}>
                No es una pérdida directa, pero es plata detenida. La mostramos aparte para no inflar la suma.
              </p>
            </fieldset>
          </form>

          {/* Salida. Los números visibles se actualizan al instante; el aria-live
              lleva un resumen con debounce (ver arriba). */}
          <div className="flex flex-col rounded-[24px] bg-[var(--dark-bg)] p-6 text-[var(--dark-ink)] md:p-8 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
              Lo que declaras que se te va
            </p>
            <span aria-hidden="true" className="mb-6 mt-2 block h-[3px] w-10 rounded-full bg-[var(--brand-accent)] opacity-90" />

            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {announced}
            </p>

            {result.ready ? (
              <>
                <dl className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--dark-muted)]">Al mes</dt>
                    <dd className="mt-1 font-[var(--font-display)] text-3xl font-bold leading-tight tracking-tighter text-[var(--dark-ink)] md:text-4xl">
                      {formatCLPCompact(result.monthlyTotal)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--dark-muted)]">Al año</dt>
                    <dd className="mt-1 font-[var(--font-display)] text-3xl font-bold leading-tight tracking-tighter text-[var(--dark-ink)] md:text-4xl">
                      {formatCLPCompact(result.annualTotal)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--dark-muted)]">
                    Dónde se te va
                  </p>
                  <ul className="mt-4 flex flex-col gap-4">
                    {result.items.map((item) => (
                      <li key={item.key}>
                        <div className="flex items-baseline justify-between gap-4 text-sm">
                          <span className="text-[var(--dark-ink)]">{LEAK_LABEL[item.key]}</span>
                          <span className="shrink-0 font-medium text-[var(--dark-ink)]">
                            {formatCLP(item.monthly)}
                            <span className="ml-2 text-xs font-normal text-[var(--dark-muted)]">{pct(item.share)}</span>
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--dark-border)]" aria-hidden="true">
                          <div
                            className="h-full rounded-full bg-[var(--brand-primary)]"
                            style={{ width: `${Math.max(item.share * 100, 2)}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                  {result.largest && result.items.length > 1 ? (
                    <p className="mt-5 text-sm leading-relaxed text-[var(--dark-muted)]">
                      Lo que más pesa según tus números: {LEAK_LABEL[result.largest.key].toLowerCase()}.
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-[var(--dark-muted)]">
                Escribe al menos un monto para ver cuánto se te va cada mes y dónde.
              </p>
            )}

            {result.teamIncomplete ? (
              <p className="mt-5 text-sm leading-relaxed text-[var(--dark-muted)]">
                Para contar el tiempo del equipo faltan personas, horas por semana o costo.
              </p>
            ) : null}

            {result.overdue ? (
              <p className="mt-6 rounded-[12px] border border-[var(--dark-border)] p-4 text-sm leading-relaxed text-[var(--dark-muted)]">
                Aparte, tienes {formatCLP(result.overdue.amount)} vencidos por cobrar
                {result.overdue.days > 0 ? `, con unos ${formatInteger(result.overdue.days)} días de atraso` : ""}. No se
                suma porque no es una pérdida directa, pero es plata que no está trabajando para ti.
              </p>
            ) : null}

            <div className="mt-8 border-t border-[var(--dark-border)] pt-6">
              <p className="text-sm font-medium text-[var(--dark-ink)]">
                Esto es lo que tú declaras. En el diagnóstico vemos cuánto de esto es evitable.
              </p>
              <ul className="mt-4 flex list-disc flex-col gap-1.5 pl-5 text-xs leading-relaxed text-[var(--dark-muted)]">
                <li>La suma usa exactamente los montos que escribiste, sin factores ni promedios de mercado.</li>
                <li>El tiempo del equipo se valora al costo que ingresaste, con 52 ÷ 12 semanas por mes (unas 4,33).</li>
                <li>No es una promesa de resultado ni un ahorro garantizado.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5 text-center">
          <p className="max-w-md text-sm leading-relaxed text-[var(--brand-muted)]">
            Para separar lo que es evitable de lo que no, cuéntanos cómo trabaja tu empresa.
          </p>
          <Link
            to="/diagnostico"
            onClick={() => trackCtaClick("calculadora_diagnostico")}
            className="inline-flex min-h-11 items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand-primary)] active:scale-[0.97] motion-reduce:transition-none"
          >
            Hacer mi diagnóstico
          </Link>
        </div>
      </div>
    </section>
  );
}
