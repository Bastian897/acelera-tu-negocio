import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { BACKEND_URL } from "@/lib/backend";

// Selector de día y hora del formulario /agenda (llamada-form.tsx).
//
// Modo normal (2026-11-01): pide al backend los bloques en que Bastian e Ignacio están
// libres (GET /api/llamada/disponibilidad, que cruza Google Calendar y el Outlook de
// Ignacio) y la persona elige uno real; el backend lo agenda.
// Modo respaldo: si eso falla o no hay horarios, la persona elige día y hora sin
// calendario y el equipo la confirma por WhatsApp. Así el formulario nunca se queda
// sin poder enviarse.
//
// Le entrega al formulario dos campos ocultos: slotIso (vacío en modo respaldo) y
// slotLabel ("martes, 4 de noviembre a las 10:00").

const TIMEZONE = "America/Santiago";
const MAX_DAYS = 10;
const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-muted)]";
// Mismo estilo de botón-opción que el resto del formulario (llamada-form.tsx).
export const CHIP_CLASS =
  "flex min-h-10 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-center text-sm leading-tight text-[var(--brand-ink)] transition-colors has-[:checked]:border-[var(--brand-primary)] has-[:checked]:bg-[var(--brand-primary)] has-[:checked]:text-[var(--ac-white)] has-[:focus-visible]:border-[var(--brand-accent)]";

type Slot = { iso: string; label: string };
type Availability = { status: "loading" } | { status: "ready"; slots: Slot[] } | { status: "fallback" };
type Day = { key: string; weekday: string; dayNumber: string; month: string; long: string };
type TimeOption = { value: string; time: string };

// Respaldo: bloques de 30 minutos de 9:00 a 18:00, lunes a viernes.
const FALLBACK_TIMES = Array.from({ length: 18 }, (_, i) => {
  const h = 9 + Math.floor(i / 2);
  return `${String(h).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
});

const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleString("es-CL", { timeZone: TIMEZONE, ...options }).replace(".", "");

function dayOf(date: Date): Day {
  const weekday = part(date, { weekday: "short" });
  return {
    key: date.toLocaleDateString("en-CA", { timeZone: TIMEZONE }),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    dayNumber: part(date, { day: "numeric" }),
    month: part(date, { month: "short" }),
    long: part(date, { weekday: "long", day: "numeric", month: "long" }),
  };
}

const timeOf = (date: Date) => part(date, { hour: "2-digit", minute: "2-digit", hour12: false });

// Respaldo sin calendario: los próximos 10 días hábiles desde mañana (hora de Chile).
// Se calcula en el navegador: la página es estática y la fecha del build quedaría vieja.
const subscribeNoop = () => () => {};
const todayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });

function fallbackDays(today: string): Day[] {
  const [y, m, d] = today.split("-").map(Number);
  // Mediodía UTC ≈ 9:00 en Chile: sumar días nunca cruza al día equivocado.
  const cursor = new Date(Date.UTC(y, m - 1, d, 12));
  const days: Day[] = [];
  while (days.length < MAX_DAYS) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) days.push(dayOf(cursor));
  }
  return days;
}

export function SlotPicker({ reloadKey }: { reloadKey: number }) {
  const [availability, setAvailability] = useState<Availability>({ status: "loading" });
  const [dayKey, setDayKey] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const today = useSyncExternalStore(subscribeNoop, todayKey, () => null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    fetch(`${BACKEND_URL}/api/llamada/disponibilidad`, { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { slots?: Slot[] };
        const slots = Array.isArray(data.slots) ? data.slots : [];
        if (cancelled) return;
        setAvailability(res.ok && slots.length > 0 ? { status: "ready", slots } : { status: "fallback" });
      })
      .catch(() => {
        if (!cancelled) setAvailability({ status: "fallback" });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [reloadKey]);

  // Al recargar (el horario elegido se ocupó) se limpia la selección.
  const [lastReload, setLastReload] = useState(reloadKey);
  if (lastReload !== reloadKey) {
    setLastReload(reloadKey);
    setDayKey("");
    setTimeValue("");
  }

  const { days, timesByDay } = useMemo(() => {
    const timesByDay = new Map<string, TimeOption[]>();
    if (availability.status === "ready") {
      const days: Day[] = [];
      for (const slot of availability.slots) {
        const date = new Date(slot.iso);
        const day = dayOf(date);
        if (!timesByDay.has(day.key)) {
          if (days.length >= MAX_DAYS) continue;
          days.push(day);
          timesByDay.set(day.key, []);
        }
        timesByDay.get(day.key)!.push({ value: slot.iso, time: timeOf(date) });
      }
      return { days, timesByDay };
    }
    if (availability.status === "fallback" && today) {
      const days = fallbackDays(today);
      for (const day of days) timesByDay.set(day.key, FALLBACK_TIMES.map((time) => ({ value: time, time })));
      return { days, timesByDay };
    }
    return { days: [] as Day[], timesByDay };
  }, [availability, today]);

  const selectedDay = days.find((d) => d.key === dayKey) ?? null;
  const times = selectedDay ? (timesByDay.get(selectedDay.key) ?? []) : [];
  const selectedTime = times.find((t) => t.value === timeValue) ?? null;
  const isReal = availability.status === "ready";

  return (
    <div className="flex flex-col gap-5">
      <input type="hidden" name="slotIso" value={isReal && selectedTime ? selectedTime.value : ""} />
      <input type="hidden" name="slotLabel" value={selectedDay && selectedTime ? `${selectedDay.long} a las ${selectedTime.time}` : ""} />

      <fieldset className="flex flex-col gap-2">
        <legend className={LABEL_CLASS + " mb-2"}>Elige el día de tu llamada</legend>
        {availability.status === "loading" ? (
          <p className="text-sm text-[var(--brand-muted)]">Cargando horarios disponibles…</p>
        ) : (
          // 5 columnas = una semana hábil por fila.
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {days.map((day) => (
              <label key={day.key} className={CHIP_CLASS + " flex-col gap-0.5 px-1"}>
                <input
                  type="radio"
                  name="day"
                  value={day.key}
                  checked={dayKey === day.key}
                  onChange={() => {
                    setDayKey(day.key);
                    setTimeValue("");
                  }}
                  className="sr-only"
                />
                <span className="text-xs">{day.weekday}</span>
                <span className="text-base font-semibold">{day.dayNumber}</span>
                <span className="text-xs">{day.month}</span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {selectedDay ? (
        <fieldset className="flex flex-col gap-2">
          <legend className={LABEL_CLASS + " mb-2"}>Elige la hora (hora de Chile)</legend>
          <div className="grid grid-cols-4 gap-2">
            {times.map((option) => (
              <label key={option.value} className={CHIP_CLASS}>
                <input
                  type="radio"
                  name="time"
                  value={option.value}
                  checked={timeValue === option.value}
                  onChange={() => setTimeValue(option.value)}
                  className="sr-only"
                />
                {option.time}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </div>
  );
}
