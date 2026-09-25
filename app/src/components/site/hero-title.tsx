/**
 * Titular del hero revelado palabra por palabra desde una máscara (CSS puro,
 * clases hero-title__* en styles.css). Palabra por palabra y no línea por
 * línea porque el quiebre de línea cambia con el ancho de pantalla. La última
 * palabra («calibramos.») lleva un trazo cyan que se dibuja al final: resume
 * la promesa. Si hay intro del logo, el titular espera a que termine.
 */
export function HeroTitle({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  const last = words.length - 1;

  return (
    <span style={{ ["--n" as string]: words.length }}>
      {words.map((word, i) => (
        <span key={i}>
          <span className="hero-title__word">
            <span className="hero-title__inner" style={{ ["--i" as string]: i }}>
              {i === last ? (
                <span className="hero-title__mark">
                  {word}
                  <svg
                    className="hero-title__underline"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path pathLength={1} d="M2 7 C 25 2, 55 9, 98 4" />
                  </svg>
                </span>
              ) : (
                word
              )}
            </span>
          </span>
          {i < last ? " " : null}
        </span>
      ))}
    </span>
  );
}
