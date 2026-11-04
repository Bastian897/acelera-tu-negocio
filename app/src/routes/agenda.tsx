import { createFileRoute } from "@tanstack/react-router";

import { AgendaPage } from "@/components/site/agenda-page";
import { siteContent } from "@/lib/site-content";

// Landing de los anuncios de Meta (2026-10-31): una sola acción, pedir la llamada de
// calibración. Desde 2026-11-02 (Fernando) SIN elegir horario: el equipo califica el lead
// primero y coordina la llamada por WhatsApp, para que no se llene la agenda de gente que
// no llega. La versión con agenda directa sigue en el código (AgendaPage withAgenda),
// sin ruta publicada. Sin menú ni chat flotante (ver ROUTES_WITHOUT_CHAT en __root.tsx) para
// que quien llega desde un anuncio no se vaya por otro lado. Fuera del buscador (noindex):
// es una página de campaña, no contenido del sitio.
export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Solicita tu llamada | Acelera tu Negocio" },
      { name: "description", content: siteContent.contact.paragraph },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AgendaSinHorario,
});

function AgendaSinHorario() {
  return <AgendaPage withAgenda={false} />;
}
