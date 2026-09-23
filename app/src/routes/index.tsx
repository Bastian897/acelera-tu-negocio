import { createFileRoute } from "@tanstack/react-router";

import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { ClientsSection } from "@/components/site/clients-section";
import { ContactSection } from "@/components/site/contact-section";
import { SiteFooter } from "@/components/site/footer";
import { FoundersSection } from "@/components/site/founders-section";
import { SiteNav } from "@/components/site/nav";
import { ProcessSection } from "@/components/site/process-section";
import { ResourcesSection } from "@/components/site/resources-section";
import { ResultsSection } from "@/components/site/results-section";
import { ServicesSection } from "@/components/site/services-section";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
  // No title/description here on purpose: the home page inherits the site's
  // editable page metadata from the root route (title/favicon/og), so a shared
  // link to "/" shows the owner's values. Add a `head` here only to give a
  // SPECIFIC page its own title/description.
  component: Index,
});

// The whole page IS the journey: the scrub controller owns media time, while
// every chapter stays server-rendered in ordinary semantic flow. The site's
// own nav sits fixed above it; the content sections that follow continue the
// "instrument panel" concept spine after the film resolves.
function Index() {
  return (
    <main>
      <SiteNav />
      <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} />
      <ServicesSection />
      <FoundersSection />
      <ProcessSection />
      <ResultsSection />
      <ClientsSection />
      <ResourcesSection />
      <ContactSection />
      <SiteFooter />
    </main>
  );
}
