import { Link } from "wouter";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            El programa de gestión hecho desde dentro de una consulta de psicología.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/acceso" className="text-muted-foreground hover:text-primary">Área privada</Link>
          <Link href="/aviso-legal" className="text-muted-foreground hover:text-primary">Aviso legal y privacidad</Link>
          <a href="mailto:hola@terappia.es" className="text-muted-foreground hover:text-primary">hola@terappia.es</a>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Terappia. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
