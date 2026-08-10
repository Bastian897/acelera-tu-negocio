import { useState, type FormEvent } from "react";

import { submitNotify } from "@/lib/api/leads.functions";

import { NotifyCta } from "./cta";

const CATEGORIES = [
  { icon: "/assets/icons/icon-recursos.png", title: "Guías" },
  { icon: "/assets/icons/icon-direccion.png", title: "Plantillas" },
  { icon: "/assets/icons/icon-industria.png", title: "Casos de estudio" },
];

export function ResourcesSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    try {
      await submitNotify({ data: { email } });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="recursos" className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="reveal-up text-3xl font-semibold tracking-tighter text-[var(--brand-ink)] md:text-5xl">
          Recursos, en calibración
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--brand-muted)]">
          Estamos preparando guías y plantillas reales de dirección y consultoría. Deja tu
          correo y te avisamos apenas estén listas.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((category) => (
            <div
              key={category.title}
              className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)]/40 px-6 py-10"
            >
              <img src={category.icon} alt="" className="h-7 w-7 opacity-70" width={28} height={28} />
              <span className="text-sm font-medium text-[var(--brand-ink)]">{category.title}</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                Próximamente
              </span>
            </div>
          ))}
        </div>

        {status === "done" ? (
          <p className="mx-auto mt-10 max-w-sm text-sm text-[var(--brand-ink)]">
            Listo. Te avisamos apenas publiquemos los primeros recursos.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 flex max-w-sm flex-col items-center gap-3 sm:flex-row"
          >
            <label htmlFor="notify-email" className="sr-only">
              Correo electrónico
            </label>
            <input
              id="notify-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@empresa.cl"
              className="h-11 w-full rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)] focus-visible:border-[var(--brand-accent)]"
            />
            <NotifyCta loading={status === "loading"} />
          </form>
        )}
        {status === "error" ? (
          <p className="mt-3 text-sm text-[var(--brand-ink)]">
            No pudimos guardar tu correo. Intenta de nuevo.
          </p>
        ) : null}
      </div>
    </section>
  );
}
