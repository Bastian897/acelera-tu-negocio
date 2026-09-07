import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import { BACKEND_URL } from "@/lib/backend";
import { trackCtaClick } from "@/lib/analytics";
import { BrandIcon } from "./icon";

const STORAGE_KEY = "acelera_chat_conversation_id";
const NAME_STORAGE_KEY = "acelera_chat_visitor_name";

type ChatEntry = { role: "user" | "assistant"; content: string; at: number };
type AvailabilitySlot = { iso: string; label: string };

// Preguntas de apertura sugeridas (patrón Intercom/Drift: reduce la fricción
// de tener que escribir todo desde cero). Se muestran solo antes del primer
// mensaje — al hacer clic se mandan tal cual, como si la persona las hubiera
// escrito.
const STARTER_PROMPTS = ["Quiero agendar una llamada", "¿Qué incluye la asesoría?", "¿Cuánto cuesta?"];

// Antes esto trataba de ADIVINAR el horario ofrecido con un regex sobre el
// texto del bot (ej. "Lunes 7 a las 10:30 a. m.") — bug real reportado en
// vivo (Bastian, 2026-09-07): cuando el bot ofrece un RANGO en vez de
// horarios puntuales ("martes 8... con horarios entre las 9:00 y las
// 17:30"), el regex no matcheaba nada y no aparecía ningún botón. En vez de
// perseguir cada forma nueva de redactar lo mismo (mismo patrón de guards en
// el backend, ver ai.ts), ahora se detecta solo SI el mensaje habla de
// agendar/horarios — no QUÉ horario exacto ofrece — y se consulta la
// disponibilidad real via /api/availability para armar un selector de
// verdad (día → hora), en vez de tratar de parsear texto libre.
const SCHEDULING_MENTION_PATTERN =
  /\b(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\b|disponibilidad|horario|agendar/i;

// Bug real encontrado probando el flujo completo en vivo (2026-09-07): el
// mensaje de confirmación final ("quedó agendada para el martes...") TAMBIÉN
// menciona un día de la semana, así que el botón "Ver horarios disponibles"
// volvía a aparecer después de agendar de verdad — no tiene sentido ofrecer
// horarios cuando ya no hay nada que coordinar. Mismo patrón que
// FAKE_BOOKING_CLAIM_PATTERN en el backend (ai.ts): "agendad[ao]"/"confirmad[ao]"
// es la señal de que el mensaje es una confirmación, no una oferta.
const SCHEDULING_CONFIRMED_PATTERN = /agendad[ao]|reservad[ao]|confirmad[ao]|invitaci[oó]n/i;

function mentionsScheduling(text: string): boolean {
  return SCHEDULING_MENTION_PATTERN.test(text) && !SCHEDULING_CONFIRMED_PATTERN.test(text);
}

// El label real de /api/availability es "martes, 8 de septiembre, 09:00 a.
// m." (ver google-calendar.ts) — separa el día de la hora para agrupar el
// selector en dos niveles.
function splitSlotLabel(label: string): { day: string; time: string } {
  const idx = label.lastIndexOf(",");
  if (idx === -1) return { day: label, time: label };
  return { day: label.slice(0, idx).trim(), time: label.slice(idx + 1).trim() };
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
  // Selector de horarios real (día → hora), reemplaza el intento anterior de
  // adivinar el horario ofrecido parseando el texto del bot.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState(false);
  const [pickerDay, setPickerDay] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[] | null>(null);
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

  async function loadAvailability() {
    setPickerLoading(true);
    setPickerError(false);
    try {
      const res = await fetch(`${BACKEND_URL}/api/availability`);
      if (!res.ok) throw new Error("request_failed");
      const data = (await res.json()) as { configured: boolean; slots: AvailabilitySlot[] };
      setAvailableSlots(data.slots ?? []);
    } catch {
      setPickerError(true);
    } finally {
      setPickerLoading(false);
    }
  }

  async function sendMessage(rawMessage: string) {
    const message = rawMessage.trim();
    if (!message || sending) return;

    // El selector queda atado al último mensaje del bot (ver más abajo) — sin
    // resetear esto acá, un selector abierto en un día ya elegido se quedaría
    // pegado y se volvería a mostrar (con datos viejos) bajo la respuesta
    // siguiente, que puede ser sobre un tema totalmente distinto.
    setPickerOpen(false);
    setPickerDay(null);
    setAvailableSlots(null);
    setPickerError(false);

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

  // El botón/selector de horarios solo aparece bajo el último mensaje del
  // bot, y solo mientras siga siendo el último de verdad (no mientras se
  // espera una respuesta nueva ni después de que la conversación avanzó) —
  // evita que quede colgando debajo de un mensaje que ya quedó atrás.
  const lastEntry = entries[entries.length - 1];
  const lastAssistantEntry = [...entries].reverse().find((e) => e.role === "assistant");
  const showSchedulingHelper =
    !sending && lastAssistantEntry !== undefined && lastEntry === lastAssistantEntry && mentionsScheduling(lastAssistantEntry.content);

  const dayGroups = useMemo(() => {
    if (!availableSlots) return [];
    const map = new Map<string, (AvailabilitySlot & { time: string })[]>();
    for (const slot of availableSlots) {
      const { day, time } = splitSlotLabel(slot.label);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push({ ...slot, time });
    }
    return Array.from(map.entries()).map(([day, slots]) => ({ day, slots }));
  }, [availableSlots]);

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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-bg)] p-1.5"
            >
              <img src="/assets/brand/acelera-icon-ink.svg" alt="" className="h-full w-full" />
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
                      {entry === lastAssistantEntry && showSchedulingHelper ? (
                        <div className="mt-1 w-full max-w-[90%] rounded-[12px] border border-[var(--brand-border)] p-2">
                          {!pickerOpen ? (
                            <button
                              type="button"
                              onClick={() => {
                                setPickerOpen(true);
                                void loadAvailability();
                              }}
                              className="flex items-center gap-1.5 rounded-[var(--ac-radius-pill)] border border-[var(--brand-accent)] bg-[var(--brand-bg)] px-3 py-1.5 text-xs font-medium text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent)] hover:text-[var(--ac-white)]"
                            >
                              📅 Ver horarios disponibles
                            </button>
                          ) : pickerLoading ? (
                            <p className="px-1 py-1 text-xs text-[var(--brand-muted)]">Cargando horarios…</p>
                          ) : pickerError ? (
                            <p className="px-1 py-1 text-xs text-[var(--ac-bad)]">
                              No se pudo cargar la disponibilidad. Escribe el día que prefieras.
                            </p>
                          ) : dayGroups.length === 0 ? (
                            <p className="px-1 py-1 text-xs text-[var(--brand-muted)]">
                              No hay horarios libres esta semana.
                            </p>
                          ) : pickerDay === null ? (
                            <div className="flex flex-wrap gap-2">
                              {dayGroups.map((g) => (
                                <button
                                  key={g.day}
                                  type="button"
                                  onClick={() => setPickerDay(g.day)}
                                  className="rounded-[var(--ac-radius-pill)] border border-[var(--brand-border)] px-3 py-1.5 text-xs text-[var(--brand-ink)] transition-colors hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
                                >
                                  {g.day}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[var(--brand-ink)]">
                                  {pickerDay}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPickerDay(null)}
                                  className="text-[10px] text-[var(--brand-muted)] underline"
                                >
                                  ← otro día
                                </button>
                              </div>
                              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
                                {dayGroups
                                  .find((g) => g.day === pickerDay)
                                  ?.slots.map((s) => (
                                    <button
                                      key={s.iso}
                                      type="button"
                                      onClick={() => {
                                        setPickerOpen(false);
                                        void sendMessage(s.label);
                                      }}
                                      className="rounded-[var(--ac-radius-pill)] border border-[var(--brand-accent)] px-3 py-1.5 text-xs font-medium text-[var(--brand-accent)] transition-colors hover:bg-[var(--brand-accent)] hover:text-[var(--ac-white)]"
                                    >
                                      {s.time}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
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
          <BrandIcon src="assets/brand/acelera-icon-ink.svg" color="var(--ac-white)" size={22} />
        )}
      </button>
    </div>
  );
}
