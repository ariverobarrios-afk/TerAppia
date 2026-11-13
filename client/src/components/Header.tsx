import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NAV = [
  { id: "funciones", label: "Funciones" },
  { id: "pacientes", label: "Para tus pacientes" },
  { id: "en-camino", label: "En camino" },
  { id: "preguntas", label: "Preguntas" },
];

export default function Header() {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);

  // Las secciones viven en la portada: desde otra página, primero se vuelve.
  const goTo = (id: string) => {
    setOpen(false);
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (location !== "/") {
      setLocation("/");
      setTimeout(scroll, 100);
    } else {
      scroll();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Terappia, inicio" onClick={() => window.scrollTo({ top: 0 })}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Secciones">
          {NAV.map((item) => (
            <button key={item.id} type="button" onClick={() => goTo(item.id)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/acceso">Entrar</Link>
          </Button>
          <Button size="sm" className="rounded-full px-4" onClick={() => goTo("acceso-anticipado")}>
            Pedir acceso
          </Button>
          <button type="button" onClick={() => setOpen(!open)} aria-label="Menú" aria-expanded={open}
            className="rounded-md p-2 text-foreground hover:bg-secondary lg:hidden">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden" aria-label="Secciones">
          <div className="container flex flex-col py-3">
            {NAV.map((item) => (
              <button key={item.id} type="button" onClick={() => goTo(item.id)}
                className="rounded-md px-2 py-3 text-left text-sm font-medium text-foreground hover:bg-secondary">
                {item.label}
              </button>
            ))}
            <Link href="/acceso" onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-sm font-medium text-primary hover:bg-secondary">
              Entrar al área privada
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
