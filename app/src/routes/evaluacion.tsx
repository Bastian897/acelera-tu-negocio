import { createFileRoute } from "@tanstack/react-router";

import { EvaluacionForm } from "@/components/site/evaluacion-form";

// Página oculta a propósito: no hay link desde la landing, no está en sitemap.xml y va con
// noindex. Ignacio Ruiz manda este link a leads que le llegan por otros medios (ver
// evaluacion-form.tsx). Sin nav ni footer del sitio: es un formulario para completar, no
// para navegar.
export const Route = createFileRoute("/evaluacion")({
  head: () => ({
    meta: [
      { title: "Cuestionario previo a la asesoría | Acelera tu Negocio" },
      { name: "description", content: "Cuestionario previo a tu asesoría con Ignacio Ruiz." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EvaluacionForm,
});
