import { cn } from "@/lib/utils";

export function CivicLogo({ className }: { className?: string }) {
  return (
    <img
      src="/logo-icon.svg"
      alt="Pak Civic Pulse Logo"
      className={cn("h-9 w-9 shrink-0 rounded-xl object-contain shadow-sm", className)}
    />
  );
}
