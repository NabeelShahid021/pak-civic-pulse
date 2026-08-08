import { createFileRoute } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { API_BASE, authStore } from "@/lib/api";
import { ThemeToggle } from "@/components/civic/theme-toggle";
import { AdminPageHeader } from "@/components/civic/admin-shell";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Admin Settings — AI Smart Civic Services" },
      {
        name: "description",
        content: "Operator session details, appearance and backend connection for the admin panel.",
      },
      { property: "og:title", content: "Admin Settings — AI Smart Civic Services" },
      { property: "og:description", content: "Operator session and appearance settings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <AdminPageHeader title="Settings" subtitle="Operator session & panel preferences" />

      <section className="glass-card mt-6 space-y-4 rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-bold">Session</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          You are signed in as a municipal operator. Admin tokens are stored locally on this device
          and cleared on sign out.
        </p>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            authStore.logoutAdmin();
            toast.success("Admin signed out.");
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </section>

      <section className="glass-card mt-4 rounded-2xl p-5">
        <h2 className="text-sm font-bold">Appearance</h2>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Switch between light and dark panel theme</p>
          <ThemeToggle />
        </div>
      </section>

      <section className="glass-card mt-4 rounded-2xl p-5">
        <h2 className="text-sm font-bold">Backend</h2>
        <p className="mt-2 text-xs break-all text-muted-foreground">{API_BASE}</p>
      </section>
    </div>
  );
}