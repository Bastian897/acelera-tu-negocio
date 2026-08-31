import { createFileRoute } from "@tanstack/react-router";

import { DiagnosticoSection } from "@/components/site/diagnostico-section";
import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico gratis | Acelera tu Negocio" },
      {
        name: "description",
        content: "Responde unas preguntas sobre tu negocio y recibe un diagnóstico real, generado a partir de tus respuestas.",
      },
    ],
  }),
  component: DiagnosticoPage,
});

function DiagnosticoPage() {
  return (
    <main>
      <SiteNav />
      <div className="pt-16">
        <DiagnosticoSection />
      </div>
      <SiteFooter />
    </main>
  );
}
