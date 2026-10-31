import { createFileRoute } from "@tanstack/react-router";

import { AgendaPage } from "@/components/site/agenda-page";
import { siteContent } from "@/lib/site-content";

// Landing de los anuncios de Meta (2026-10-31): una sola acción, agendar la llamada de
// calibración. Sin menú ni chat flotante (ver ROUTES_WITHOUT_CHAT en __root.tsx) para
// que quien llega desde un anuncio no se vaya por otro lado; el aviso de cookies sí se
// muestra, porque sin consentimiento no carga el Pixel. Fuera del buscador (noindex):
// es una página de campaña, no contenido del sitio.
export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda tu llamada | Acelera tu Negocio" },
      { name: "description", content: siteContent.contact.paragraph },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgendaPage,
});
