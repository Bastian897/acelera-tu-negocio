import { useState, type FormEvent } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { NotifyCta } from "./cta";

type Status = "idle" | "loading" | "done" | "error";

/** Captura de email antes de entregar una descarga (lead magnet). El archivo
 * detrás de `resource` puede ser un placeholder por ahora — lo que importa es
 * el mecanismo de gate + captura + tracking (ver acelera-backend). */
export function GatedDownload({ resource, label }: { resource: string; label: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    try {
      const res = await fetch(`${BACKEND_URL}/api/lead-magnet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resource }),
      });
      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as { downloadUrl: string };
      setDownloadUrl(data.downloadUrl);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done" && downloadUrl) {
    return (
      <div className="border-t border-[var(--brand-border)] pt-4">
        <p className="text-sm font-medium text-[var(--brand-ink)]">{label}</p>
        <a href={downloadUrl} className="mt-2 inline-block text-sm text-[var(--brand-accent)] underline">
          Descargar ahora
        </a>
        <p className="mt-1 text-xs text-[var(--brand-muted)]">También te lo enviamos por correo.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-[var(--brand-border)] pt-4">
      <p className="text-sm font-medium text-[var(--brand-ink)]">{label}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          className="h-10 min-w-[200px] flex-1 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]/70 focus-visible:border-[var(--brand-accent)]"
        />
        <NotifyCta loading={status === "loading"}>Enviarme la guía</NotifyCta>
      </div>
      {status === "error" ? (
        <p className="mt-2 text-xs text-[var(--brand-muted)]">No pudimos procesar tu solicitud, intenta de nuevo.</p>
      ) : null}
    </form>
  );
}
