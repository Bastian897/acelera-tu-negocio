import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site/footer";
import { SiteNav } from "@/components/site/nav";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad | Acelera tu Negocio" },
      {
        name: "description",
        content:
          "Qué datos personales recoge Acelera, para qué los usa, con quién los comparte, cuánto tiempo los conserva y cómo ejercer tus derechos.",
      },
    ],
  }),
  component: PrivacidadPage,
});

const H2 = "mt-10 mb-2 text-base font-semibold";
const P = "mb-4";
const UL = "mb-4 list-disc space-y-1 pl-6";

function PrivacidadPage() {
  return (
    <main>
      <SiteNav />
      <div className="mx-auto max-w-2xl px-6 pt-32 pb-24 leading-relaxed text-brand-ink">
        <h1 className="mb-2 text-2xl font-semibold">Política de Privacidad</h1>
        <p className="mb-8 text-sm opacity-70">Última actualización: 22 de septiembre de 2026</p>

        <p className={P}>
          Acelera tu Negocio es una consultora de dirección estratégica y ejecución para empresas chilenas. Esta
          política explica qué datos personales recogemos cuando usas este sitio, para qué los usamos, con quién los
          compartimos, cuánto tiempo los conservamos y cómo puedes ejercer tus derechos. Nos regimos por la Ley N°
          19.628 y por las modificaciones de la Ley N° 21.719, que entra en vigencia el 1 de diciembre de 2026.
        </p>

        <h2 className={H2}>1. Qué datos recogemos</h2>
        <ul className={UL}>
          <li>
            <strong>Diagnóstico gratis:</strong> tus datos de contacto, datos generales de tu empresa (rubro,
            facturación, equipo, canal de venta) y tus respuestas sobre tu negocio.
          </li>
          <li>
            <strong>Agendar una llamada o escribirnos:</strong> tus datos de contacto y una breve descripción de tu
            empresa.
          </li>
          <li>
            <strong>Chat del sitio:</strong> tu nombre y los mensajes que escribes.
          </li>
          <li>
            <strong>Portal de clientes:</strong> tu correo y la información de avance que publicamos para ti.
          </li>
          <li>
            <strong>Navegación:</strong> con tu consentimiento, cookies de analítica web.
          </li>
        </ul>
        <p className={P}>No recogemos datos sensibles ni te los pedimos. Por favor no los incluyas en tus respuestas.</p>

        <h2 className={H2}>2. Para qué los usamos</h2>
        <ul className={UL}>
          <li>Generar tu diagnóstico, responder tus consultas y agendar la llamada de calibración.</li>
          <li>Contactarte y darte seguimiento comercial sobre tu solicitud.</li>
          <li>Operar el portal de clientes y avisarte de novedades.</li>
          <li>Mejorar y proteger el sitio.</li>
          <li>Cumplir obligaciones legales cuando corresponda.</li>
        </ul>

        <h2 className={H2}>3. Inteligencia artificial</h2>
        <p className={P}>
          Usamos inteligencia artificial de proveedores externos para generar tu diagnóstico y responder el chat del
          sitio. No tomamos decisiones automatizadas que produzcan efectos jurídicos sobre ti: el resultado es una
          orientación y puedes pedir que una persona de nuestro equipo revise tu caso.
        </p>

        <h2 className={H2}>4. Con quién compartimos tus datos</h2>
        <p className={P}>
          No vendemos tus datos. Los compartimos solo con proveedores de hosting e infraestructura en la nube, envío
          de correos, modelos de inteligencia artificial, y herramientas de agenda, hojas de cálculo y analítica web,
          bajo sus propias condiciones de privacidad. Algunos operan fuera de Chile, por lo que tus datos pueden
          tratarse en otros países.
        </p>

        <h2 className={H2}>5. Cuánto tiempo los conservamos</h2>
        <p className={P}>
          Conservamos tus datos mientras sean necesarios para las finalidades descritas o mientras exista una relación
          comercial con nosotros. Puedes pedirnos en cualquier momento que los eliminemos, salvo que la ley nos obligue
          a mantenerlos.
        </p>

        <h2 className={H2}>6. Tus derechos</h2>
        <p className={P}>
          Puedes pedir acceso, rectificación, eliminación, oposición al tratamiento, retiro del consentimiento y
          portabilidad de tus datos. Escríbenos a{" "}
          <a className="underline" href="mailto:contacto@aceleratunegocio.cl">
            contacto@aceleratunegocio.cl
          </a>{" "}
          indicando el correo con el que nos contactaste. También puedes reclamar ante la Agencia de Protección de
          Datos Personales.
        </p>

        <h2 className={H2}>7. Seguridad y cookies</h2>
        <p className={P}>
          Protegemos tus datos con conexiones cifradas y acceso restringido; el portal de clientes solo se abre con un
          código enviado a tu correo. Ante una brecha que te afecte, te avisaremos como exige la ley. Las cookies de
          analítica solo se activan si las aceptas en el aviso del sitio; el portal de clientes usa una cookie
          necesaria para mantener tu sesión.
        </p>

        <h2 className={H2}>8. Acceso a Google Calendar (aplicación "Acelera - Agenda")</h2>
        <p className={P}>
          Esta sección describe cómo Acelera usa el acceso a Google Calendar que solicita la aplicación "Acelera -
          Agenda".
        </p>
        <p className={P}>
          <strong>Qué acceso pedimos.</strong> Pedimos permiso para ver y editar eventos en el Google Calendar de la
          cuenta que se conecta (scope <code>https://www.googleapis.com/auth/calendar.events</code>), además del correo
          de esa cuenta para identificarla.
        </p>
        <p className={P}>
          <strong>Para qué lo usamos.</strong> Únicamente para crear el evento de una llamada de calibración cuando
          alguien la agenda desde el sitio de Acelera o su chat, e invitar a esa persona como asistente para que reciba
          la invitación nativa de Google Calendar. No leemos, modificamos ni borramos ningún otro evento del calendario,
          y no accedemos a ningún otro dato de la cuenta de Google.
        </p>
        <p className={P}>
          <strong>Con quién compartimos estos datos.</strong> Con nadie. El acceso es exclusivamente entre esta
          aplicación y la cuenta de Google que la autoriza, para el único fin descrito arriba.
        </p>
        <p className={P}>
          <strong>Cómo revocar el acceso.</strong> Cualquier persona puede quitarle el acceso a esta aplicación en
          cualquier momento desde{" "}
          <a className="underline" href="https://myaccount.google.com/permissions">
            myaccount.google.com/permissions
          </a>
          .
        </p>

        <h2 className={H2}>9. Cambios a esta política</h2>
        <p className={P}>
          Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de actualización.
        </p>

        <h2 className={H2}>Contacto</h2>
        <p>
          Consultas sobre esta política o sobre tus datos:{" "}
          <a className="underline" href="mailto:contacto@aceleratunegocio.cl">
            contacto@aceleratunegocio.cl
          </a>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}
