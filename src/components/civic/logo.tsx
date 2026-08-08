import { cn } from "@/lib/utils";

export function CivicLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "gradient-hero grid place-items-center rounded-xl text-primary-foreground shadow-md",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M12 2.5 3.5 7v2h17V7L12 2.5Z" strokeLinejoin="round" />
        <path d="M6 10v7M10 10v7M14 10v7M18 10v7" strokeLinecap="round" />
        <path d="M3.5 20.5h17" strokeLinecap="round" />
        <circle cx="12" cy="6.4" r="1" fill="currentColor" stroke="none" />
      </svg>
    </span>
  );
}
