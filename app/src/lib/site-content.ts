import raw from "../site-content.json";

// Texto editable desde /admin/content (acelera-backend). El sitio es 100%
// estático, así que esto NO se pide en el navegador — src/site-content.json
// se sobreescribe en build time por scripts/fetch-site-content.mjs con lo
// que esté guardado en el panel; si el fetch falla, queda el snapshot que ya
// está commiteado en el repo (nunca rompe el build por eso).
export type SiteContent = {
  general: { primaryCtaText: string };
  nav: { brandText: string; link1: string; link2: string; link3: string; link4: string; link5: string };
  hero: { chapterLabel: string; title: string; body: string; secondaryCtaText: string };
  services: {
    heading: string;
    imageCaption: string;
    service1Title: string;
    service1Body: string;
    service2Title: string;
    service2Body: string;
    service3Title: string;
    service3Body: string;
  };
  founders: {
    heading: string;
    subheading: string;
    founder1Name: string;
    founder1Role: string;
    founder1Bio: string;
    founder2Name: string;
    founder2Role: string;
    founder2Bio: string;
    founder3Name: string;
    founder3Role: string;
    founder3Bio: string;
  };
  process: {
    heading: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    step3Title: string;
    step3Body: string;
  };
  results: {
    heading: string;
    stat: string;
    paragraph: string;
    industry1: string;
    industry2: string;
    industry3: string;
    industry4: string;
    industry5: string;
  };
  clients: { heading: string };
  resources: {
    kicker: string;
    heading: string;
    paragraph: string;
    point1Label: string;
    point1Detail: string;
    point2Label: string;
    point2Detail: string;
    point3Label: string;
    point3Detail: string;
    ctaText: string;
  };
  contact: { kicker: string; heading: string; paragraph: string; imageCaption: string };
  footer: { tagline: string; location: string };
};

export const siteContent = raw as SiteContent;
