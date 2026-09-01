import { useEffect, useRef, useState, type FormEvent } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { trackCtaClick } from "@/lib/analytics";

const STORAGE_KEY = "acelera_chat_conversation_id";
const NAME_STORAGE_KEY = "acelera_chat_visitor_name";

type ChatEntry = { role: "user" | "assistant"; content: string };

function loadConversationId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveConversationId(id: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage puede fallar en modo privado — no es crítico, solo se pierde
    // la continuidad de la conversación entre recargas.
  }
}

function loadVisitorName(): string | null {
  try {
    return window.localStorage.getItem(NAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveVisitorName(name: string) {
  try {
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  } catch {
    // idem — solo se vuelve a pedir el nombre en la próxima visita.
  }
}

// Pide nombre y apellido (2+ palabras) — sirve para distinguir usuarios en el
// historial de conversaciones del admin, que hasta ahora siempre mostraba la
// columna "nombre" vacía porque nunca se pedía.
function isFullName(value: string): boolean {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [nameError, setNameError] = useState(false);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationId.current = loadConversationId();
    setVisitorName(loadVisitorName());
  }, []);

  function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = nameDraft.trim();
    if (!isFullName(name)) {
      setNameError(true);
      return;
    }
    saveVisitorName(name);
    setVisitorName(name);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries, sending]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setEntries((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conversationId.current, message, name: visitorName }),
      });
      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as { conversationId: string; reply: string };
      conversationId.current = data.conversationId;
      saveConversationId(data.conversationId);
      setEntries((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setEntries((prev) => [
        ...prev,
        { role: "assistant", content: "Tuvimos un problema para responder. Intenta de nuevo en un momento." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="mb-3 flex h-[440px] w-[320px] flex-col overflow-hidden rounded-[16px] border border-[var(--brand-border)] bg-[var(--brand-bg)] shadow-[var(--shadow-elevation)]">
          <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--brand-ink)]">Habla con Acelera</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="text-[var(--brand-muted)]"
            >
              ✕
            </button>
          </div>

          {visitorName === null ? (
            <form onSubmit={handleNameSubmit} className="flex flex-1 flex-col justify-center gap-3 px-4 py-4">
              <p className="text-sm text-[var(--brand-ink)]">
                Antes de comenzar, ¿cuál es tu nombre y apellido?
              </p>
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => {
                  setNameDraft(e.target.value);
                  setNameError(false);
                }}
                placeholder="Ej: María Pérez"
                className="h-10 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 text-sm text-[var(--brand-ink)] outline-none focus-visible:border-[var(--brand-accent)]"
              />
              {nameError ? (
                <p className="text-xs text-red-600">Escribe tu nombre y apellido, por favor.</p>
              ) : null}
              <button
                type="submit"
                className="h-10 rounded-[10px] bg-[var(--brand-primary)] px-4 text-sm font-medium text-[var(--ac-white)]"
              >
                Continuar
              </button>
            </form>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {entries.length === 0 ? (
                  <p className="text-sm text-[var(--brand-muted)]">
                    Cuéntanos de tu negocio y te ayudamos a ver si Acelera calza con lo que buscas.
                  </p>
                ) : (
                  entries.map((entry, i) => (
                    <p
                      key={i}
                      className={
                        "max-w-[85%] rounded-[12px] px-3 py-2 text-sm leading-relaxed " +
                        (entry.role === "user"
                          ? "ml-auto bg-[var(--brand-primary)] text-[var(--ac-white)]"
                          : "bg-[var(--brand-surface)] text-[var(--brand-ink)]")
                      }
                    >
                      {entry.content}
                    </p>
                  ))
                )}
                {sending ? (
                  <div className="flex w-fit items-center gap-1 rounded-[12px] bg-[var(--brand-surface)] px-3 py-2.5">
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand-muted)]"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand-muted)]"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--brand-muted)]"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                ) : null}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[var(--brand-border)] p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="h-10 flex-1 rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 text-sm text-[var(--brand-ink)] outline-none focus-visible:border-[var(--brand-accent)]"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="h-10 rounded-[10px] bg-[var(--brand-primary)] px-4 text-sm font-medium text-[var(--ac-white)] disabled:cursor-wait"
                >
                  {sending ? "..." : "Enviar"}
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (!open) trackCtaClick("abrir_chat");
          setOpen((v) => !v);
        }}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--ac-white)] shadow-[var(--shadow-elevation)] transition-transform duration-150 ease-out hover:brightness-110 active:scale-[0.97] motion-reduce:transition-none"
      >
        {open ? (
          "✕"
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path
              d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H9l-4 3.5v-3.5H5.5C4.67 17 4 16.33 4 15.5v-10Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
