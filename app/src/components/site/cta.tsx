import { type ReactNode } from "react";

/** "Agendar llamada", primary intent, reused everywhere. Garment: a solid
 * brand-primary pill that lifts on hover and depresses on press. */
export function PrimaryCta({
  children = "Agendar llamada",
  href = "#contacto",
  className = "",
}: {
  children?: ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={
        "inline-flex items-center justify-center rounded-[999px] bg-[var(--brand-primary)] px-6 py-3 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none " +
        className
      }
    >
      {children}
    </a>
  );
}

/** "Ver servicios", secondary intent, hero only. Garment: a calibration
 * tick-mark underline (brand accent cyan) that extends from the baseline on hover. */
export function TickLink({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={
        "group relative inline-flex items-center gap-2 text-sm font-medium text-[var(--dark-ink)] " +
        className
      }
    >
      {children}
      <span
        aria-hidden="true"
        className="relative h-3 w-6 shrink-0 overflow-hidden"
      >
        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-[var(--dark-muted)] transition-all duration-200 ease-out group-hover:w-6 group-hover:bg-[var(--brand-accent)] motion-reduce:transition-none" />
      </span>
    </a>
  );
}

/** "Enviar", form submit intent. Garment: fill wipes left-to-right into the
 * secondary navy on hover/loading, echoing the instrument-panel motif. */
export function SubmitCta({
  children,
  loading = false,
  className = "",
}: {
  children: ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={
        "group relative w-full overflow-hidden rounded-[16px] bg-[var(--brand-primary)] px-6 py-3.5 text-sm font-medium text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 active:scale-[0.99] disabled:cursor-wait motion-reduce:transition-none " +
        className
      }
    >
      <span
        aria-hidden="true"
        className={
          "absolute inset-y-0 left-0 w-0 bg-[var(--brand-secondary)] transition-[width] duration-500 ease-out group-hover:w-full motion-reduce:hidden " +
          (loading ? "!w-full duration-1000" : "")
        }
      />
      <span className="relative">{loading ? "Enviando..." : children}</span>
    </button>
  );
}

/** "Notificarme", resources-capture intent. Garment: corner-bracket
 * viewfinder that closes around the label on hover/focus. */
export function NotifyCta({
  loading = false,
  className = "",
}: {
  loading?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={
        "group relative inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--brand-ink)] disabled:cursor-wait " +
        className
      }
    >
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-[var(--brand-muted)] transition-all duration-200 ease-out group-hover:h-full group-hover:w-full group-hover:border-[var(--brand-accent)] motion-reduce:transition-none"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-[var(--brand-muted)] transition-all duration-200 ease-out group-hover:h-full group-hover:w-full group-hover:border-[var(--brand-accent)] motion-reduce:transition-none"
      />
      <span className="relative">{loading ? "Enviando..." : "Notificarme"}</span>
    </button>
  );
}
