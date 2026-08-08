import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/civic/admin-shell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — AI Smart Civic Services" },
      {
        name: "description",
        content:
          "Municipal operator admin panel: analytics, complaint dispatch and operator settings.",
      },
      { property: "og:title", content: "Admin Panel — AI Smart Civic Services" },
      {
        property: "og:description",
        content: "Municipal operator admin panel for civic complaint triage.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
