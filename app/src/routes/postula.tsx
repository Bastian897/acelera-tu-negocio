import { createFileRoute } from "@tanstack/react-router";

import { PostulaPage } from "@/components/site/postula-page";

// Versión B de la landing de los anuncios de Meta (2026-11-02): página de postulación
// (ver postula-page.tsx). La versión A es /agenda. Sin menú ni chat flotante
// (ROUTES_WITHOUT_CHAT en __root.tsx) y fuera del buscador.
export const Route = createFileRoute("/postula")({
  head: () => ({
    meta: [
      { title: "Postula a tu llamada | Acelera tu Negocio" },
      {
        name: "description",
        content: "Dirección y consultoría estratégica para empresas chilenas que facturan sobre $10M al mes. Postula a una llamada de calibración sin costo.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PostulaPage,
});
