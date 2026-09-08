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
import { siteContent } from "@/lib/site-content";

/** Brand tokens for the journey layer: the client design system's dark-impact
 * palette (surface-dark + brand-primary blue), same as the footer/results band. */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#010bf8",
  background: "#080808",
  ink: "#ffffff",
  muted: "#a7afc4",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    actions: (
      <>
        <PrimaryCta />
        <TickLink href="#servicios">{siteContent.hero.secondaryCtaText}</TickLink>
      </>
    ),
    align: "left",
    body: siteContent.hero.body,
    clip: "assets/world/scene-01.mp4",
    id: "hero",
    label: siteContent.hero.chapterLabel,
    linger: 0.1,
    mobileClip: "assets/world/scene-01-mobile.mp4",
    mobilePoster: "assets/world/scene-01-mobile-poster.png",
    poster: "assets/world/scene-01-poster.png",
    scroll: 3.2,
    title: siteContent.hero.title,
  },
];
