// Filtro duro de las landings de anuncios (/agenda y /postula, pedido de Fernando,
// 2026-11-04): quien no califica no llega a mandar sus datos, así el evento Lead (Pixel +
// CAPI) solo lo disparan leads calificados y Meta optimiza hacia ese perfil. Cada motivo
// cita la respuesta de la persona para que entienda por qué (pedido de Bastian).

const ACELERA_INSTAGRAM = "https://www.instagram.com/acelera.cl/";

export const DISQUALIFY_REASONS = {
  lowRevenue:
    "Nos contaste que tu empresa factura menos de $10M al mes. Este proceso está pensado para empresas que ya superan esa cifra, que es donde nuestro trabajo tiene el impacto que justifica la inversión.",
  notDecisionMaker:
    "Nos contaste que las decisiones las toma otra persona. Para que la llamada sirva necesitamos conversar con quien decide: si quieres, compártele esta página.",
  noBudget:
    "Nos contaste que hoy no tienes presupuesto para invertir. Trabajar con nosotros requiere una inversión, así que preferimos no quitarte tiempo ahora.",
  onlyExploring:
    "Nos contaste que solo estás explorando. Esta llamada es para quienes quieren empezar pronto; cuando sea tu momento, aquí vamos a estar.",
} as const;

/** Reemplaza al formulario cuando no califica. El formulario queda montado (oculto) para
 * que "Me equivoqué" vuelva con todo lo escrito. */
export function DisqualifiedPanel({ reasons, onBack }: { reasons: string[]; onBack: () => void }) {
  return (
    <div role="status" className="py-2">
      <p className="text-2xl font-semibold tracking-tighter text-[var(--brand-ink)]">
        Gracias por tu interés.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-muted)]">
        Hoy este proceso no es el indicado para ti, y preferimos decírtelo claro:
      </p>
      <ul className="mt-6 flex flex-col gap-4">
        {reasons.map((reason) => (
          <li
            key={reason}
            className="flex gap-4 rounded-[var(--ac-radius-md)] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 text-sm leading-relaxed text-[var(--brand-ink)]"
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--brand-border)] text-xs font-bold text-[var(--brand-muted)]"
            >
              i
            </span>
            {reason}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-relaxed text-[var(--brand-muted)]">
        Mientras tanto, en el Instagram de Acelera compartimos gratis cómo ordenar los números y
        hacer crecer un negocio.
      </p>
      <a
        href={ACELERA_INSTAGRAM}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] transition-transform duration-150 hover:brightness-110 active:scale-[0.97]"
      >
        Sigue a Acelera en Instagram
      </a>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 block text-sm text-[var(--brand-muted)] underline-offset-4 hover:underline"
      >
        Me equivoqué en una respuesta
      </button>
    </div>
  );
}
