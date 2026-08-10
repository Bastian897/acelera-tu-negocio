/**
 * Scene data for the scroll-scrub journey — THE file you fill in per build.
 *
 * Single-shot (the default): ONE entry in `scenes`, whose `clip` is the single
 * continuous film. Chapter copy still comes from `chapters` below, rendered as
 * semantic sections over that one clip.
 *
 * Multi-leg (opt-in): one entry per seam-locked leg, in journey order. Every
 * `poster` MUST be the exact first frame of the encoded clip beside it — never
 * a design board or an imagined destination still.
 *
 * Keep this array a module constant. Changing its identity on every render
 * intentionally rebuilds the media controller.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens for the journey layer, from app/design-brief.md ("Panel de Control"). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#4f7fa6",
  background: "#0a0b0c",
  ink: "#f3f5f6",
  muted: "#98a1a8",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    align: "left",
    body: "Direccion y consultoria estrategica para empresas que ya facturan y quieren crecer con control, no al azar.",
    clip: "/assets/world/scene-01.mp4",
    id: "hero",
    label: "Apertura",
    linger: 0.15,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 1.3,
    title: "Cada negocio tiene un panel de control. Nosotros lo calibramos.",
  },
  {
    align: "right",
    body: "Analizamos tus numeros, tu operacion y tu mercado para definir exactamente donde mover primero.",
    clip: "/assets/world/scene-01.mp4",
    id: "direccion",
    kicker: "Direccion estrategica",
    label: "Direccion",
    linger: 0.1,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 1.4,
    title: "Planificacion financiera y reduccion de costos con precision.",
  },
  {
    align: "left",
    body: "Ejecutamos el plan junto a tu equipo, con metas y KPIs que se revisan semana a semana.",
    clip: "/assets/world/scene-01.mp4",
    id: "consultoria",
    kicker: "Consultoria ejecutiva",
    label: "Consultoria",
    linger: 0.1,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 1.4,
    title: "Diseno e implementacion de proyectos en ventas, marketing y operaciones.",
  },
  {
    align: "left",
    body: "Agenda una llamada de 30 minutos y te decimos, sin vueltas, si podemos ayudarte a acelerar.",
    clip: "/assets/world/scene-01.mp4",
    id: "resultado",
    label: "Resultado",
    linger: 0.05,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 1.5,
    title: "Instrumento calibrado. Negocio listo para acelerar.",
  },
];
