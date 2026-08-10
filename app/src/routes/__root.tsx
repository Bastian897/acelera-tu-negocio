import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { BRAND_BG_HEX } from "../lib/brand";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
// Page metadata (browser <title>/favicon + social og: tags), read at build time.
import appMetaJson from "../app-meta.json";

declare const __HF_DESIGN_INSPECTOR__: boolean;

const DEFAULT_TITLE = "Acelera tu Negocio | Dirección y consultoría estratégica";
const DEFAULT_DESCRIPTION =
  "Dirección estratégica y consultoría ejecutiva para empresas chilenas que quieren crecer con control.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
  marketplace_cover_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = meta.og_image_url ?? null;
  const ogVideo = meta.og_video_url ?? null;

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "theme-color", content: BRAND_BG_HEX },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CL" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "favicon-32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "favicon-16.png", sizes: "16x16", type: "image/png" },
      { rel: "apple-touch-icon", href: "apple-touch-icon.png" },
      { rel: "manifest", href: "site.webmanifest" },
    ],
  };
}

function NotFoundComponent() {
  return (
    <div className="bg-brand flex min-h-dvh items-center justify-center px-4">
      <div className="text-center">
        <p className="text-brand-muted font-mono text-sm uppercase tracking-[0.2em]">
          Error 404
        </p>
        <h1 className="text-brand-ink mt-3 text-4xl font-semibold tracking-tighter">
          Esta página no existe.
        </h1>
        <p className="text-brand-muted mt-3">
          Puede que se haya movido o nunca haya existido.
        </p>
        <Link
          to="/"
          className="border-brand text-brand-ink mt-8 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="bg-brand flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-brand-ink text-2xl font-semibold tracking-tighter">
          Esta página no cargó bien.
        </h1>
        <p className="text-brand-muted mt-2 text-sm">
          Algo falló de nuestro lado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-brand-accent text-brand-accent-ink rounded-full px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="border-brand text-brand-ink rounded-full border px-6 py-3 text-sm font-medium transition-transform active:scale-[0.98]"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-theme="default-dark" style={{ colorScheme: "dark" }}>
      <head>
        <HeadContent />
      </head>
      <body className="acelera-site">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) {
      return;
    }

    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(
          error instanceof Error ? error : new Error("Failed to load design inspector"),
          {
            boundary: "higgsfield_design_inspector_import",
          }
        );
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
