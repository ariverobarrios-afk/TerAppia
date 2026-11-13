import { cn } from "@/lib/utils";

// Marca de Terappia: dos círculos que se solapan (psicóloga y paciente, y
// las dos «p» del nombre) junto al nombre en minúsculas.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 28" className={cn("h-6 w-auto", className)} aria-hidden="true">
      <circle cx="14" cy="14" r="13" className="fill-primary" />
      <circle cx="30" cy="14" r="13" className="fill-peach" fillOpacity="0.9" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-foreground", className)}>
      <LogoMark />
      <span>
        tera<span className="text-primary">pp</span>ia
      </span>
    </span>
  );
}
