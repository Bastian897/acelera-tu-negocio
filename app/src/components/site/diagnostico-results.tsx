// EN DESUSO desde 2026-09-21: el diagnóstico ya no se muestra en pantalla al
// enviar el formulario; se entrega por correo el próximo día hábil a las 9:00
// (ver diagnostico-confirmation.tsx y business-days.ts en el backend). Se conserva
// por si se decide volver a mostrar el resultado al instante o como adelanto.
import { useEffect, useRef, useState } from "react";

import { SectionKicker } from "./section-kicker";

// Forma de la respuesta de POST /api/diagnostico. `maturity` es nuevo (2026-09-20)
// y puede venir null (formulario viejo o respuestas insuficientes) o no venir
// (backend anterior al cambio): en ambos casos se muestra solo el informe.
export type MaturityDimension = { key: string; label: string; score: number; max: number };
export type MaturityLevelRange = { name: string; min: number; max: number };
export type MaturityData = {
  score: number;
  level: string;
  levelDescription: string;
  confidence: "completa" | "parcial";
  answeredDimensions: number;
  totalDimensions: number;
  dimensions: MaturityDimension[];
  quickWins: string[];
  scale?: MaturityLevelRange[];
  // Solo viene con datos reales del rubro (mínimo 20 diagnósticos); si es
  // null no se muestra ninguna comparación.
  benchmark: { industry: string; sampleSize: number; average: number } | null;
};
export type DiagnosticoResult = {
  observations: string[];
  pdfBase64: string;
  maturity?: MaturityData | null;
};

const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";

const GAUGE_SIZE = 168;
const GAUGE_STROKE = 12;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

// Las barras y el anillo "se llenan" una vez montado. Con prefers-reduced-motion
// las clases motion-reduce:transition-none hacen que el cambio sea inmediato.
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

function ScoreGauge({ score, level, animate }: { score: number; level: string; animate: boolean }) {
  const shown = animate ? score : 0;
  const offset = GAUGE_CIRCUMFERENCE * (1 - shown / 100);
  return (
    <div
      role="img"
      aria-label={`Puntaje del negocio: ${score} de 100, nivel ${level}`}
      className="relative shrink-0"
      style={{ width: GAUGE_SIZE, height: GAUGE_SIZE }}
    >
      <svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`} aria-hidden="true" className="-rotate-90">
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_RADIUS}
          fill="none"
          strokeWidth={GAUGE_STROKE}
          className="stroke-[color:var(--surface-soft)]"
        />
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={GAUGE_RADIUS}
          fill="none"
          strokeWidth={GAUGE_STROKE}
          strokeLinecap="round"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="stroke-[color:var(--brand-primary)] transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[var(--font-display)] text-6xl font-extrabold leading-none tracking-tighter text-[var(--brand-primary)]">
          {score}
        </span>
        <span className="mt-1 text-xs font-medium text-[var(--brand-muted)]">de 100</span>
      </div>
    </div>
  );
}

function LevelScale({ scale, current }: { scale: MaturityLevelRange[]; current: string }) {
  return (
    <ol className="mt-6 grid grid-cols-4 gap-1.5" aria-label="Escala de niveles del puntaje">
      {scale.map((range) => {
        const isCurrent = range.name === current;
        return (
          <li key={range.name} aria-current={isCurrent ? "true" : undefined} className="min-w-0">
            <span
              aria-hidden="true"
              className={
                "block h-1.5 rounded-full " + (isCurrent ? "bg-[var(--brand-primary)]" : "bg-[var(--surface-soft)]")
              }
            />
            <span
              className={
                "mt-2 block text-[11px] leading-tight " +
                (isCurrent ? "font-semibold text-[var(--brand-ink)]" : "text-[var(--brand-muted)]")
              }
            >
              {range.name}
              <span className="block text-[10px] font-normal text-[var(--brand-muted)]">
                {range.min} a {range.max}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function DimensionList({ dimensions, animate }: { dimensions: MaturityDimension[]; animate: boolean }) {
  return (
    <ul className="flex flex-col gap-4">
      {dimensions.map((d) => {
        const pct = d.max > 0 ? Math.round((d.score / d.max) * 100) : 0;
        return (
          <li key={d.key}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-[var(--brand-ink)]">{d.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-[var(--brand-muted)]">
                {d.score} de {d.max}
              </span>
            </div>
            <div aria-hidden="true" className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
              <div
                className="h-full rounded-full bg-[var(--brand-primary)] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: animate ? `${pct}%` : "0%" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function DiagnosticoResults({ result }: { result: DiagnosticoResult }) {
  const { maturity } = result;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useMounted();

  // El formulario largo deja la página scrolleada hacia abajo: al aparecer el
  // resultado se lleva la vista y el foco al título (accesible para lector de
  // pantalla y teclado). "auto" en vez de "smooth" para respetar
  // prefers-reduced-motion sin lógica extra.
  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }, []);

  return (
    <div className="mt-12 flex flex-col gap-6">
      <div>
        <SectionKicker>Tu resultado</SectionKicker>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 text-2xl font-semibold tracking-tighter text-[var(--brand-ink)] outline-none md:text-3xl"
        >
          {maturity ? "Tu diagnóstico integral" : "Tu diagnóstico"}
        </h2>
        {maturity ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--brand-muted)]">
            Un número de 0 a 100 calculado con reglas fijas a partir de tus respuestas. Sirve para saber
            desde dónde partes y por dónde conviene empezar.
          </p>
        ) : null}
      </div>

      {maturity ? (
        <>
          <section
            aria-label="Puntaje del negocio"
            className="rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6 shadow-[var(--shadow-elevation)] md:p-8"
          >
            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
              <ScoreGauge score={maturity.score} level={maturity.level} animate={mounted} />
              <div className="min-w-0">
                <p className={LABEL_CLASS}>Nivel</p>
                <p className="mt-1 font-[var(--font-display)] text-2xl font-bold tracking-tighter text-[var(--brand-ink)]">
                  {maturity.level}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">{maturity.levelDescription}</p>
                {maturity.confidence === "parcial" ? (
                  <p className="mt-2 text-xs text-[var(--brand-muted)]">
                    Calculado con {maturity.answeredDimensions} de {maturity.totalDimensions} áreas.
                  </p>
                ) : null}
              </div>
            </div>
            {maturity.scale && maturity.scale.length > 0 ? (
              <LevelScale scale={maturity.scale} current={maturity.level} />
            ) : null}
          </section>

          {maturity.benchmark ? (
            <p className="rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--brand-ink)]">
              El promedio de {maturity.benchmark.sampleSize} negocios de {maturity.benchmark.industry} que hicieron
              este diagnóstico es{" "}
              <span className="font-semibold">{maturity.benchmark.average} de 100</span>. El tuyo es{" "}
              <span className="font-semibold">{maturity.score}</span>.
            </p>
          ) : null}

          <section
            aria-labelledby="madurez-por-area"
            className="rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6"
          >
            <h3 id="madurez-por-area" className={LABEL_CLASS}>
              Desglose por área
            </h3>
            <div className="mt-5">
              <DimensionList dimensions={maturity.dimensions} animate={mounted} />
            </div>
          </section>

          {maturity.quickWins.length > 0 ? (
            <section
              aria-labelledby="madurez-primeros-pasos"
              className="rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6"
            >
              <h3 id="madurez-primeros-pasos" className={LABEL_CLASS}>
                Primeros pasos que puedes dar esta semana
              </h3>
              <ol className="mt-4 flex flex-col gap-4">
                {maturity.quickWins.map((win, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-[var(--brand-ink)]">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ac-blue-soft)] text-xs font-semibold text-[var(--brand-primary)]"
                    >
                      {i + 1}
                    </span>
                    <span>{win}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </>
      ) : null}

      <section
        aria-labelledby="diagnostico-observaciones"
        className="rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-6"
      >
        <h3 id="diagnostico-observaciones" className={LABEL_CLASS}>
          {maturity ? "Observaciones sobre tu negocio" : "Tu diagnóstico"}
        </h3>
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
          className="mt-6 inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] transition-transform duration-150 ease-out hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-accent)] active:scale-[0.97] motion-reduce:transition-none"
        >
          Descargar mi diagnóstico en PDF
        </a>
        <p className="mt-6 text-sm text-[var(--brand-muted)]">
          Te lo enviamos también a tu correo. Si quieres profundizar, respóndelo y coordinamos una
          llamada.
        </p>
      </section>
    </div>
  );
}
