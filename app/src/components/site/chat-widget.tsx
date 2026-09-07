import { useEffect, useRef, useState, type FormEvent } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { trackCtaClick } from "@/lib/analytics";

const STORAGE_KEY = "acelera_chat_conversation_id";
const NAME_STORAGE_KEY = "acelera_chat_visitor_name";

type ChatEntry = { role: "user" | "assistant"; content: string; at: number };

// Preguntas de apertura sugeridas (patrón Intercom/Drift: reduce la fricción
// de tener que escribir todo desde cero). Se muestran solo antes del primer
// mensaje — al hacer clic se mandan tal cual, como si la persona las hubiera
// escrito.
const STARTER_PROMPTS = ["Quiero agendar una llamada", "¿Qué incluye la asesoría?", "¿Cuánto cuesta?"];

// Detecta menciones de día+hora concretas en la última respuesta del bot
// (ej. "Lunes 7 a las 10:30 a. m.") para ofrecerlas como botones — evita que
// la persona tenga que retipear el horario exacto, justo lo que el backend
// exige carácter por carácter antes de agendar (USER_PICKED_TIME_PATTERN en
// ai.ts). Puramente cosmético: si no matchea nada, no se muestra ningún botón
// y el texto se ve exactamente igual que antes.
const SLOT_SUGGESTION_PATTERN =
  /(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\s+\d{1,2}\s+a\s+las\s+\d{1,2}(:\d{2})?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?/gi;

function extractSlotSuggestions(text: string): string[] {
  const matches = text.match(SLOT_SUGGESTION_PATTERN) ?? [];
  return Array.from(new Set(matches.map((m) => m.trim()))).slice(0, 4);
}

function formatTime(at: number): string {
  return new Date(at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}

// El bot manda el link del diagnóstico como texto plano dentro de la respuesta
// (ej. "...aquí tienes el diagnóstico: https://.../diagnostico") — sin esto se
// veía como texto sin poder hacerle clic. Separa el texto en partes y convierte
// las URLs en enlaces reales, recortando puntuación final (".", ",", etc.) que
// quede pegada a la URL para que no se incluya como parte del link.
function linkifyMessage(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (!/^https?:\/\//.test(part)) return part;
    const trailingMatch = part.match(/[.,;:!?)]+$/);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const url = trailing ? part.slice(0, -trailing.length) : part;
    return (
      <span key={i}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
          {url}
        </a>
        {trailing}
      </span>
    );
  });
}

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

// Duración/curva de la animación del panel — reutiliza exactamente la misma
// curva que .reveal-up en styles.css, para que el "lenguaje de movimiento"
// del sitio sea consistente.
const PANEL_TRANSITION_MS = 260;
const PANEL_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Antes el panel se montaba/desmontaba junto con `open`, sin ninguna
  // transición real (React lo insertaba/quitaba del DOM de un frame a otro,
  // así que no había nada que animar — de ahí el "es muy brusco" reportado).
  // `panelMounted` controla si el panel existe en el DOM; `panelVisible`
  // controla el estado final de la transición. Al abrir, se monta primero
  // con el estado "cerrado" y recién en el siguiente frame se pasa a
  // "visible" (si no, no hay frame intermedio del que partir y la
  // transición no tiene nada que interpolar). Al cerrar, se anima primero a
  // "invisible" y el desmontaje real se retrasa hasta que termina.
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
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

  useEffect(() => {
    if (open) {
      setPanelMounted(true);
      const raf = requestAnimationFrame(() => setPanelVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setPanelVisible(false);
    const timeout = setTimeout(() => setPanelMounted(false), PANEL_TRANSITION_MS);
    return () => clearTimeout(timeout);
  }, [open]);

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

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || sending) return;

    setEntries((prev) => [...prev, { role: "user", content: message, at: Date.now() }]);
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
      setEntries((prev) => [...prev, { role: "assistant", content: data.reply, at: Date.now() }]);
    } catch {
      setEntries((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Tuvimos un problema para responder. Intenta de nuevo en un momento.",
          at: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  // Botones de horario solo bajo el último mensaje del bot, y solo mientras
  // siga siendo el último de verdad (no mientras se está esperando una nueva
  // respuesta ni después de que la conversación avanzó) — evita botones
  // "viejos" colgando debajo de un mensaje que ya quedó atrás.
  const lastEntry = entries[entries.length - 1];
  const lastAssistantEntry = [...entries].reverse().find((e) => e.role === "assistant");
  const slotSuggestions =
    !sending && lastAssistantEntry && lastEntry === lastAssistantEntry
      ? extractSlotSuggestions(lastAssistantEntry.content)
      : [];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {panelMounted ? (
        <div
          className={
            "mb-3 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[var(--ac-radius-md)] border border-[var(--brand-border)] bg-[var(--brand-bg)] shadow-[var(--shadow-elevation)] transition-[opacity,transform] motion-reduce:transition-none " +
            (panelVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0")
          }
          style={{ transitionDuration: `${PANEL_TRANSITION_MS}ms`, transitionTimingFunction: PANEL_EASE }}
        >
          <div className="flex items-center gap-3 border-b border-[var(--brand-border)] px-4 py-3">
            <span
              aria-hidden="true"
              style={{ fontFamily: "var(--font-display)" }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-sm font-semibold text-[var(--ac-white)]"
            >
              A
            </span>
            <div className="min-w-0">
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="truncate text-sm font-medium text-[var(--brand-ink)]"
              >
                Habla con Acelera
              </p>
              <p className="flex items-center gap-1.5 text-xs text-[var(--brand-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ac-good)]" aria-hidden="true" />
                Suele responder en segundos
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="ml-auto shrink-0 text-[var(--brand-muted)] transition-colors hover:text-[var(--brand-ink)]"
            >
              ✕
            </button>
          </div>

          {visitorName === null ? (
            <form onSubmit={handleNameSubmit} className="flex flex-1 flex-col justify-center gap-3 px-4 py-4">
              <p className="text-sm text-[var(--brand-ink)]">Antes de comenzar, ¿cuál es tu nombre y apellido?</p>
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
              {nameError ? <p className="text-xs text-red-600">Escribe tu nombre y apellido, por favor.</p> : null}
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
                  <>
                    <p className="max-w-[85%] rounded-[12px] bg-[var(--brand-surface)] px-3 py-2 text-sm leading-relaxed text-[var(--brand-ink)]">
                      Hola {visitorName.split(" ")[0]} 👋 Cuéntanos de tu negocio y vemos juntos si Acelera calza con
                      lo que buscas.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {STARTER_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => void sendMessage(prompt)}
                          className="rounded-[var(--ac-radius-pill)] border border-[var(--brand-border)] bg-[var(--brand-bg)] px-3 py-1.5 text-xs text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  entries.map((entry, i) => (
                    <div
                      key={i}
                      className={"flex flex-col " + (entry.role === "user" ? "items-end" : "items-start")}
                    >
                      <p
                        className={
                          "max-w-[85%] rounded-[12px] px-3 py-2 text-sm leading-relaxed " +
                          (entry.role === "user"
                            ? "bg-[var(--brand-primary)] text-[var(--ac-white)]"
                            : "bg-[var(--brand-surface)] text-[var(--brand-ink)]")
                        }
                      >
                        {linkifyMessage(entry.content)}
                      </p>
                      <span className="mt-1 px-1 text-[10px] text-[var(--brand-muted)]">{formatTime(entry.at)}</span>
                      {entry === lastAssistantEntry && slotSuggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {slotSuggestions.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => void sendMessage(slot)}
                              className="rounded-[var(--ac-radius-pill)] border border-[var(--brand-accent)] bg-[var(--brand-bg)] px-3 py-1.5 text-xs font-medium text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent)] hover:text-[var(--ac-white)]"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
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
