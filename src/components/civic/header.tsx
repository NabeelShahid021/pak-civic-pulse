import { Link, useNavigate } from "@tanstack/react-router";
import {
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Radar,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authStore, formatCnic } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import { useAuthDialog } from "@/components/civic/auth-dialog";
import { ThemeToggle } from "@/components/civic/theme-toggle";
import { CivicLogo } from "@/components/civic/logo";

const links = [
  { to: "/", label: "Submit Complaint", icon: FilePlus2 },
  { to: "/my-complaints", label: "My Complaints", icon: LayoutDashboard },
  { to: "/track", label: "Public Tracker", icon: Radar },
] as const;

export function Header() {
  const session = useSession();
  const { open } = useAuthDialog();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleAdminClick = () => {
    navigate({ to: "/admin" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <CivicLogo className="h-9 w-9 shrink-0" />
          <span className="min-w-0">
            <span className="block truncate text-sm leading-tight font-extrabold tracking-tight sm:text-base text-foreground">
              Pak Civic Pulse
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block font-urdu">
              پاک سِوک پلس
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeToggle />

          {/* Citizen Auth Section */}
          {session.citizenToken ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
                  </span>
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {session.citizenName || `Citizen #${session.citizenId}`}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  CNIC {session.citizenCnic ? formatCnic(session.citizenCnic) : "—"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/my-complaints">My Complaints</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/">Submit a Complaint</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    authStore.logoutCitizen();
                    toast.success("Signed out.");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => open("citizen")}>
              Sign in
            </Button>
          )}

          {/* Admin Button next to Sign in */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdminClick}
            className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary font-medium"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
            {session.adminToken && (
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald" />
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="animate-fade-in border-t border-border/60 bg-background px-4 py-3 lg:hidden space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              handleAdminClick();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin Portal
          </button>
        </nav>
      )}
    </header>
  );
}
