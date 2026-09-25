import type { RevealPhase } from "../../hooks/use-reveal";

// Semicírculo de 180° (viewBox 0 0 120 70, centro en 60,60, radio 52) con
// once marcas; las de 0 / 50 / 100 % son más largas.
const TICKS = Array.from({ length: 11 }, (_, i) => {
  const a = Math.PI + (Math.PI * i) / 10;
  const inner = i % 5 === 0 ? 40 : 44;
  return {
    x1: 60 + inner * Math.cos(a),
    y1: 60 + inner * Math.sin(a),
    x2: 60 + 48 * Math.cos(a),
    y2: 60 + 48 * Math.sin(a),
  };
});

/**
 * Medidor de un servicio («Tres instrumentos. Un mismo panel.»). La marca es
 * simbólica, sin números: no representa una métrica real. Al entrar en
 * pantalla el arco se dibuja y la aguja barre hasta su marca; en hover
 * vibra un poco (CSS en styles.css, "Medidores de Servicios").
 */
export function ServiceGauge({
  label,
  value,
  delayMs,
  phase,
}: {
  label: string;
  value: number;
  delayMs: number;
  phase: RevealPhase;
}) {
  return (
    <div
      className="service-gauge"
      data-phase={phase}
      aria-hidden="true"
      style={{
        ["--v" as string]: value,
        ["--a" as string]: `${-90 + 180 * value}deg`,
        ["--d" as string]: `${delayMs}ms`,
      }}
    >
      <svg viewBox="0 0 120 70">
        <path className="service-gauge__track" d="M8 60 A52 52 0 0 1 112 60" />
        <path className="service-gauge__arc" pathLength={1} d="M8 60 A52 52 0 0 1 112 60" />
        {TICKS.map((t, i) => (
          <line key={i} className="service-gauge__tick" {...t} />
        ))}
        <line className="service-gauge__needle" x1="60" y1="60" x2="60" y2="20" />
        <circle className="service-gauge__hub" cx="60" cy="60" r="4" />
      </svg>
      <span className="service-gauge__label">{label}</span>
    </div>
  );
}
