import { useReveal } from "../../hooks/use-reveal";

// Vueltas completas antes de frenar; debe calzar con las 3 vueltas (30
// dígitos) de .odometer__col::before en styles.css.
const TURNS = 2;

/**
 * Cifra que gira como un odómetro mecánico: cada dígito rueda un par de
 * vueltas y frena en su valor (el de la derecha frena después). Los demás
 * caracteres ($, M, +) quedan fijos. El servidor renderiza cada columna ya
 * detenida en su dígito, así la cifra se lee aunque no corra el JS. Los
 * glifos visibles salen de CSS (::before), así el texto de la página es solo
 * la cifra real (span sr-only), sin la tira de dígitos.
 */
export function Odometer({ value }: { value: string }) {
  const [ref, phase] = useReveal<HTMLSpanElement>(0.5);
  let digitIndex = 0;

  return (
    <>
      <span className="sr-only">{value}</span>
      <span ref={ref} data-phase={phase} className="odometer" aria-hidden="true">
        {Array.from(value).map((char, i) => {
          if (!/\d/.test(char)) {
            return <span key={i} className="odometer__char" data-c={char} />;
          }
          const order = digitIndex++;
          return (
            <span
              key={i}
              className="odometer__col"
              style={{
                ["--stop" as string]: TURNS * 10 + Number(char),
                ["--dur" as string]: `${1.4 + order * 0.25}s`,
              }}
            />
          );
        })}
      </span>
    </>
  );
}
