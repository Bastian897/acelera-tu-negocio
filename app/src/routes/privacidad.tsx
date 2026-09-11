import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad | Acelera tu Negocio" },
      {
        name: "description",
        content: "Cómo usa Acelera el acceso a Google Calendar de la aplicación \"Acelera - Agenda\".",
      },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <main>
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 leading-relaxed text-brand-ink">
        <h1 className="mb-6 text-2xl font-semibold">Política de Privacidad — Acelera</h1>
        <p className="mb-6">
          Esta página describe cómo Acelera ("nosotros") usa el acceso a Google Calendar que solicita la aplicación
          "Acelera - Agenda".
        </p>

        <h2 className="mt-8 mb-2 text-base font-semibold">Qué acceso pedimos</h2>
        <p className="mb-6">
          Pedimos permiso para ver y editar eventos en el Google Calendar de la cuenta que se conecta (scope{" "}
          <code>https://www.googleapis.com/auth/calendar.events</code>), además del correo de esa cuenta para
          identificarla.
        </p>

        <h2 className="mt-8 mb-2 text-base font-semibold">Para qué lo usamos</h2>
        <p className="mb-6">
          Únicamente para crear el evento de una llamada de calibración cuando alguien la agenda desde el sitio de
          Acelera o su chat, e invitar a esa persona como asistente para que reciba la invitación nativa de Google
          Calendar. No leemos, modificamos ni borramos ningún otro evento del calendario, y no accedemos a ningún
          otro dato de la cuenta de Google.
        </p>

        <h2 className="mt-8 mb-2 text-base font-semibold">Con quién compartimos datos</h2>
        <p className="mb-6">
          Con nadie. El acceso es exclusivamente entre esta aplicación y la cuenta de Google que la autoriza, para el
          único fin descrito arriba.
        </p>

        <h2 className="mt-8 mb-2 text-base font-semibold">Cómo revocar el acceso</h2>
        <p className="mb-6">
          Cualquier persona puede quitarle el acceso a esta aplicación en cualquier momento desde{" "}
          <a className="underline" href="https://myaccount.google.com/permissions">
            myaccount.google.com/permissions
          </a>
          .
        </p>

        <h2 className="mt-8 mb-2 text-base font-semibold">Contacto</h2>
        <p>
          Consultas sobre esta política:{" "}
          <a className="underline" href="mailto:contacto@aceleratunegocio.cl">
            contacto@aceleratunegocio.cl
          </a>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
