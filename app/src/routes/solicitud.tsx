import { createFileRoute } from "@tanstack/react-router";

import { AgendaPage } from "@/components/site/agenda-page";
import { siteContent } from "@/lib/site-content";

// Landing de los anuncios de Meta sin agenda directa (2026-11-02, recomendación de
// Fernando): la misma página que /agenda pero la persona no elige horario. El equipo
// califica el lead primero y después coordina la llamada por WhatsApp. Sin menú ni chat
// (ROUTES_WITHOUT_CHAT en __root.tsx) y fuera del buscador, igual que /agenda.
export const Route = createFileRoute("/solicitud")({
  head: () => ({
    meta: [
      { title: "Solicita tu llamada | Acelera tu Negocio" },
      { name: "description", content: siteContent.contact.paragraph },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SolicitudPage,
});

function SolicitudPage() {
  return <AgendaPage withAgenda={false} />;
}
