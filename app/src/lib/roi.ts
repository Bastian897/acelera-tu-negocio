// Lógica pura del mapa de fugas (sin React, sin DOM) para poder testearla
// aislada. Todo el copy y la UI viven en roi-calculator.tsx.
//
// Principio: solo aritmética sobre lo que escribe el visitante. No hay
// porcentajes de mejora, factores ni promedios de industria. Las únicas
// conversiones son tiempo a pesos (horas × costo por hora) y sueldo mensual a
// costo por hora, con los supuestos de abajo a la vista en la interfaz.

/** Semanas por mes usadas para pasar "horas por semana" a horas al mes (52 / 12).
 * Se muestra tal cual en los supuestos para que se pueda reproducir a mano. */
export const WEEKS_PER_MONTH = 52 / 12;

/** Horas al mes usadas solo para convertir sueldo mensual a costo por hora.
 * Es un supuesto redondo y visible, no una lectura de la ley laboral. */
export const HOURS_PER_MONTH_FOR_SALARY = 180;

/** Topes razonables: evitan que un cero de más produzca cifras absurdas y que
 * un pegado accidental rompa el layout. Ninguno pretende ser "el máximo real".
 * `monthlyAmount` aplica a cada categoría en pesos al mes ($1.000 millones);
 * `overdueAmount` al total de facturas vencidas. */
export const LIMITS = {
  people: 500,
  hoursPerWeek: 60,
  hourlyCost: 500_000,
  monthlySalary: 30_000_000,
  monthlyAmount: 1_000_000_000,
  overdueAmount: 10_000_000_000,
  overdueDays: 3_650,
} as const;

/** Desde este monto el tiempo del equipo (que es un cálculo, no algo que la
 * persona escribió) se redondea al millar para no aparentar precisión. */
const TEAM_ROUND_FROM = 100_000;

export type CostMode = "monthly" | "hourly";

/** Categorías que suman al total, en el orden en que se le piden al visitante. */
export const LEAK_KEYS = ["team", "errors", "lostSales", "subscriptions", "inflatedCosts"] as const;
export type LeakKey = (typeof LEAK_KEYS)[number];

export interface LeakInputs {
  /** Tiempo del equipo: personas × horas por semana × costo por hora. */
  people: number;
  hoursPerWeek: number;
  costMode: CostMode;
  /** Se usa si costMode === "monthly". */
  monthlySalary: number;
  /** Se usa si costMode === "hourly". */
  hourlyCost: number;
  /** $ al mes por errores, retrabajo, devoluciones, mermas y descuentos. */
  errors: number;
  /** $ al mes en ventas perdidas por demora o falta de seguimiento. */
  lostSales: number;
  /** $ al mes en suscripciones y herramientas duplicadas o sin uso. */
  subscriptions: number;
  /** $ al mes de sobrecosto detectado en gastos operativos. */
  inflatedCosts: number;
  /** Aparte, no suma al total: monto de facturas vencidas por cobrar. */
  overdueAmount: number;
  /** Aparte: días de atraso promedio (solo informativo). */
  overdueDays: number;
}

export interface LeakItem {
  key: LeakKey;
  /** Pesos al mes, entero. */
  monthly: number;
  /** Fracción (0 a 1) de `monthlyTotal`. Solo sirve para dibujar la barra. */
  share: number;
}

export interface LeakResult {
  /** true si al menos una categoría aporta un monto mayor a 0. */
  ready: boolean;
  /** Costo por hora efectivo (convertido desde sueldo si corresponde). */
  hourlyCost: number;
  /** Horas de trabajo manual al mes (personas × horas × 52/12). */
  teamHoursPerMonth: number;
  /** Hay algún dato del tiempo del equipo pero falta otro para poder sumarlo. */
  teamIncomplete: boolean;
  /** Suma exacta de los `monthly` de `items`. */
  monthlyTotal: number;
  /** monthlyTotal × 12. */
  annualTotal: number;
  /** Solo categorías con monto > 0, de mayor a menor (empates en orden de LEAK_KEYS). */
  items: LeakItem[];
  /** Categoría más grande o null si no hay ninguna. */
  largest: LeakItem | null;
  /** Dato aparte, nunca sumado al total. null si no declaró monto. */
  overdue: { amount: number; days: number } | null;
}

/** Fuerza cualquier entrada (NaN, Infinity, negativos, undefined) a un número
 * finito dentro de [0, max]. Es la única puerta de entrada de datos sucios. */
export function clampNumber(value: unknown, max: number): number {
  const n = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

/** Convierte lo que escribe la persona a número. Acepta "1.234.567", "1234,5",
 * "$ 900.000" y vacío. Devuelve NaN si no hay ningún dígito, así la UI puede
 * distinguir "vacío" de "cero" si le sirve. Nunca devuelve negativos. */
export function parseLocalNumber(raw: string, allowDecimals = false): number {
  if (typeof raw !== "string") return Number.NaN;
  // Un "-" al inicio es un negativo intencional: se trata como 0, no como su
  // valor absoluto (que convertiría "-5" en 5 sin que nadie lo note).
  if (raw.trim().startsWith("-")) return 0;
  if (allowDecimals) {
    // Coma o punto como decimal: la última aparición separa la parte decimal,
    // el resto son separadores de miles.
    const cleaned = raw.replace(/[^\d.,]/g, "");
    const lastSep = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
    if (lastSep === -1) return cleaned === "" ? Number.NaN : Number(cleaned);
    const intPart = cleaned.slice(0, lastSep).replace(/[.,]/g, "");
    const decPart = cleaned.slice(lastSep + 1).replace(/[.,]/g, "");
    if (intPart === "" && decPart === "") return Number.NaN;
    return Number(`${intPart || "0"}.${decPart || "0"}`);
  }
  const digits = raw.replace(/\D/g, "");
  return digits === "" ? Number.NaN : Number(digits);
}

/** Monto en pesos al mes: saneado, con tope y redondeado al peso. */
function money(value: unknown, max: number = LIMITS.monthlyAmount): number {
  return Math.round(clampNumber(value, max));
}

export function computeLeaks(inputs: LeakInputs): LeakResult {
  const people = clampNumber(inputs.people, LIMITS.people);
  const hoursPerWeek = clampNumber(inputs.hoursPerWeek, LIMITS.hoursPerWeek);
  const hourlyCost =
    inputs.costMode === "monthly"
      ? clampNumber(inputs.monthlySalary, LIMITS.monthlySalary) / HOURS_PER_MONTH_FOR_SALARY
      : clampNumber(inputs.hourlyCost, LIMITS.hourlyCost);

  const teamHoursPerMonth = people * hoursPerWeek * WEEKS_PER_MONTH;
  // La categoría solo cuenta si están las tres piezas: con una faltante sería
  // un producto por cero, no una fuga declarada.
  const teamComplete = people > 0 && hoursPerWeek > 0 && hourlyCost > 0;
  const teamRaw = teamComplete ? teamHoursPerMonth * hourlyCost : 0;
  const team = teamRaw >= TEAM_ROUND_FROM ? Math.round(teamRaw / 1000) * 1000 : Math.round(teamRaw);

  const amounts: Record<LeakKey, number> = {
    team,
    errors: money(inputs.errors),
    lostSales: money(inputs.lostSales),
    subscriptions: money(inputs.subscriptions),
    inflatedCosts: money(inputs.inflatedCosts),
  };

  const monthlyTotal = LEAK_KEYS.reduce((sum, key) => sum + amounts[key], 0);

  const items: LeakItem[] = LEAK_KEYS.filter((key) => amounts[key] > 0)
    .map((key) => ({ key, monthly: amounts[key], share: amounts[key] / monthlyTotal }))
    // Array.prototype.sort es estable: los empates conservan el orden de LEAK_KEYS.
    .sort((a, b) => b.monthly - a.monthly);

  const overdueAmount = money(inputs.overdueAmount, LIMITS.overdueAmount);
  const overdueDays = Math.round(clampNumber(inputs.overdueDays, LIMITS.overdueDays));

  return {
    ready: monthlyTotal > 0,
    hourlyCost,
    teamHoursPerMonth,
    teamIncomplete: !teamComplete && (people > 0 || hoursPerWeek > 0 || hourlyCost > 0),
    monthlyTotal,
    annualTotal: monthlyTotal * 12,
    items,
    largest: items[0] ?? null,
    overdue: overdueAmount > 0 ? { amount: overdueAmount, days: overdueDays } : null,
  };
}

/** Miles con punto, sin depender del ICU del entorno (es-CL no agrupa los
 * números de 4 dígitos con Intl, lo que dejaría "1234" sin separador). */
export function formatInteger(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** "$1.234.567", exacto al peso. Las cifras que escribió la persona no se
 * redondean para que el desglose sume lo mismo que el total. */
export function formatCLP(value: number): string {
  const n = Number.isFinite(value) && value > 0 ? value : 0;
  return `$${formatInteger(n)}`;
}

/** Como formatCLP, pero desde $1.000.000 usa "M" con coma decimal ("$12,4 M").
 * Se usa solo para cifras enormes donde la versión completa no cabe en móvil. */
export function formatCLPCompact(value: number): string {
  const n = Number.isFinite(value) && value > 0 ? value : 0;
  if (n < 1_000_000) return formatCLP(n);
  const millions = Math.round(n / 100_000) / 10;
  const text = millions.toFixed(1).replace(".", ",").replace(/,0$/, "");
  // Sobre 1.000 M el separador de miles evita "$1234,5 M".
  const [int, dec] = text.split(",");
  return `$${formatInteger(Number(int))}${dec ? `,${dec}` : ""} M`;
}

/** Horas con una decimal solo si son pocas ("6,5", "120"). */
export function formatHours(value: number): string {
  const n = Number.isFinite(value) && value > 0 ? value : 0;
  if (n >= 100) return formatInteger(n);
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
}
