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
        <p className="mb-8 text-sm opacity-70">Última actualización: 21 de septiembre de 2026</p>

        <p className={P}>
          Acelera tu Negocio ("Acelera", "nosotros") es una consultora de dirección estratégica y ejecución para
          empresas chilenas. Esta política explica qué datos personales recogemos cuando usas este sitio, para qué los
          usamos, con quién los compartimos, cuánto tiempo los conservamos y cómo puedes ejercer tus derechos. Nos
          regimos por la Ley N° 19.628 y por las modificaciones de la Ley N° 21.719, que entra en vigencia el 1 de
          diciembre de 2026.
        </p>

        <h2 className={H2}>1. Qué datos recogemos y cuándo</h2>
        <ul className={UL}>
          <li>
            <strong>Diagnóstico gratis:</strong> nombre, correo, teléfono (opcional), nombre de tu empresa, página web,
            Instagram, industria, facturación mensual, canal de venta, tamaño del equipo, cantidad de clientes, meses de
            mayor y menor facturación, tus respuestas sobre finanzas, ventas, procesos, equipo y digitalización, y el
            problema u objetivo que nos cuentas.
          </li>
          <li>
            <strong>Agendar una llamada o escribirnos:</strong> nombre, correo, teléfono, facturación mensual y la
            descripción de tu empresa.
          </li>
          <li>
            <strong>Chat del sitio:</strong> tu nombre, los mensajes que escribes y el correo si nos lo compartes.
          </li>
          <li>
            <strong>Portal de clientes:</strong> tu correo (para enviarte el código de acceso) y la información de avance
            que nuestro equipo publica para ti: pasos, entregables, archivos, reuniones e indicadores.
          </li>
          <li>
            <strong>Datos técnicos y de uso:</strong> con tu consentimiento, cookies de analítica (Google Analytics) para
            entender cómo se usa el sitio. También usamos Cloudflare Web Analytics, que mide visitas sin cookies.
          </li>
        </ul>
        <p className={P}>No recogemos datos sensibles ni te los pedimos. Por favor no los incluyas en tus respuestas.</p>

        <h2 className={H2}>2. Para qué los usamos</h2>
        <ul className={UL}>
          <li>Generar y enviarte tu diagnóstico y responder tus consultas.</li>
          <li>Agendar y preparar la llamada de calibración. Para eso el equipo puede revisar información pública de la web e Instagram que declaraste.</li>
          <li>Contactarte para ofrecerte nuestros servicios y darte seguimiento comercial, sobre la base de tu solicitud.</li>
          <li>Operar el portal de clientes y avisarte cuando publicamos novedades en él.</li>
          <li>Mejorar el sitio y mantener su seguridad.</li>
          <li>Cumplir obligaciones legales cuando corresponda.</li>
        </ul>

        <h2 className={H2}>3. Inteligencia artificial</h2>
        <p className={P}>
          Para redactar tu diagnóstico y responder el chat usamos modelos de inteligencia artificial de proveedores
          externos. Tus respuestas del formulario o tus mensajes se envían a esos proveedores únicamente para generar el
          texto. El puntaje de tu diagnóstico se calcula con reglas fijas, no con inteligencia artificial. No tomamos
          decisiones automatizadas que produzcan efectos jurídicos sobre ti: el informe es una orientación y puedes
          pedir que una persona de nuestro equipo revise tu caso.
        </p>

        <h2 className={H2}>4. Con quién compartimos tus datos</h2>
        <p className={P}>
          No vendemos tus datos. Los compartimos solo con los proveedores que nos permiten operar, bajo sus propias
          condiciones de privacidad y únicamente para los fines descritos:
        </p>
        <ul className={UL}>
          <li>Cloudflare: alojamiento del sistema, base de datos y almacenamiento de archivos.</li>
          <li>Vercel: alojamiento de este sitio web.</li>
          <li>Resend: envío de correos (diagnóstico, códigos de acceso, avisos).</li>
          <li>Proveedores de modelos de lenguaje (por ejemplo OpenRouter, OpenAI o Anthropic): generación de textos.</li>
          <li>Google: agenda de llamadas (Calendar), registro interno de contactos (Sheets) y analítica del sitio (Analytics, con tu consentimiento).</li>
        </ul>
        <p className={P}>
          Algunos de estos proveedores operan fuera de Chile, por lo que tus datos pueden tratarse en otros países,
          como Estados Unidos.
        </p>

        <h2 className={H2}>5. Cuánto tiempo los conservamos</h2>
        <p className={P}>
          Conservamos tus datos mientras sean necesarios para las finalidades descritas o mientras exista una relación
          comercial con nosotros. Puedes pedirnos en cualquier momento que los eliminemos, salvo que la ley nos obligue
          a mantenerlos.
        </p>

        <h2 className={H2}>6. Tus derechos</h2>
        <p className={P}>
          Puedes pedirnos acceso a tus datos, que los rectifiquemos, los eliminemos o los bloqueemos, oponerte a su
          tratamiento, retirar tu consentimiento y solicitar su portabilidad. Para ejercer cualquiera de estos derechos
          escríbenos a{" "}
          <a className="underline" href="mailto:contacto@aceleratunegocio.cl">
            contacto@aceleratunegocio.cl
          </a>{" "}
          indicando el correo con el que nos contactaste. También puedes reclamar ante la Agencia de Protección de Datos
          Personales.
        </p>

        <h2 className={H2}>7. Seguridad</h2>
        <p className={P}>
          Protegemos tus datos con conexiones cifradas, acceso restringido al equipo, y un portal de clientes al que solo
          se entra con un código enviado al correo autorizado. Ningún sistema es infalible: si ocurriera una brecha que
          te afecte, te lo informaremos como exige la ley.
        </p>

        <h2 className={H2}>8. Cookies</h2>
        <p className={P}>
          Las cookies de analítica solo se activan si las aceptas en el aviso del sitio, y puedes cambiar tu decisión
          borrando las cookies de tu navegador. El portal de clientes usa una cookie necesaria para mantener tu sesión.
        </p>

        <h2 className={H2}>9. Acceso a Google Calendar (aplicación "Acelera - Agenda")</h2>
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

        <h2 className={H2}>10. Cambios a esta política</h2>
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
