import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/civic/header";
import { ChatAssistant } from "@/components/civic/chat-assistant";
import { AuthDialogProvider } from "@/components/civic/auth-dialog";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pak Civic Pulse — AI Civic Complaint Reporting" },
      {
        name: "description",
        content:
          "Pak Civic Pulse: AI-powered civic complaint triage for Pakistani cities. File, track and resolve municipal issues in English, Urdu and Roman Urdu.",
      },
      { name: "author", content: "Pak Civic Pulse" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Pak Civic Pulse — AI Civic Complaint Reporting" },
      {
        property: "og:description",
        content:
          "Fast AI-powered civic complaint triage for Pakistani cities across WASA, TEPA, LESCO, and Waste Management.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pak Civic Pulse — AI Civic Complaint Reporting" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/logo-icon.svg" },
      { rel: "shortcut icon", type: "image/svg+xml", href: "/logo-icon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthDialogProvider>
          <div className="min-h-screen bg-background">
            <Outlet />
          </div>
          <Toaster richColors position="top-center" />
        </AuthDialogProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthDialogProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
            <p>Pak Civic Pulse · AI-Powered Municipal Issue Resolution for Pakistani Cities</p>
          </footer>
          <ChatAssistant />
          <Toaster richColors position="top-center" />
        </div>
      </AuthDialogProvider>
    </QueryClientProvider>
  );
}
