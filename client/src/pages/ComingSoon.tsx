import { useEffect } from "react";
import Logo from "@/components/Logo";

// Lo único que se ve en producción antes del lanzamiento (ver vite.config.ts).
export default function ComingSoon() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-[30rem] rounded-full bg-peach-soft blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 size-[26rem] rounded-full bg-secondary blur-3xl" />
      <div className="relative flex flex-col items-center gap-6">
        <Logo className="text-2xl" />
        <h1 className="font-serif text-4xl font-semibold text-foreground sm:text-5xl">Muy pronto</h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Estamos preparando Terappia, el programa de gestión para consultas de psicología.
        </p>
        <a href="mailto:hola@terappia.es" className="text-sm font-medium text-primary underline underline-offset-4">
          hola@terappia.es
        </a>
      </div>
    </main>
  );
}
