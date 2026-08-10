/**
 * Scene data for the scroll-scrub journey.
 *
 * Single-shot (this build): ONE entry in `scenes`, whose `clip` is the single
 * continuous ~15s film. Its four internal beats (dark, mechanism, needle
 * sweep, resolved) are directed into the footage itself per the storyboard;
 * the copy below is the one persistent chapter that reads over the whole
 * take while the visitor scrolls through it.
 *
 * Keep this array a module constant. Changing its identity on every render
 * intentionally rebuilds the media controller.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";
import { PrimaryCta, TickLink } from "@/components/site/cta";

/** Brand tokens for the journey layer, from app/design-brief.md ("Panel de Control"). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#4f7fa6",
  background: "#0a0b0c",
  ink: "#f3f5f6",
  muted: "#98a1a8",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    actions: (
      <>
        <PrimaryCta />
        <TickLink href="#servicios">Ver servicios</TickLink>
      </>
    ),
    align: "left",
    body: "Dirección y consultoría estratégica para empresas que ya facturan y quieren crecer con control, no al azar.",
    clip: "/assets/world/scene-01.mp4",
    id: "hero",
    label: "Apertura",
    linger: 0.1,
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 3.2,
    title: "Cada negocio tiene un panel de control. Nosotros lo calibramos.",
  },
];
