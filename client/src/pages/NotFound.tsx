import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <Logo />
      <h1 className="font-serif text-4xl font-semibold">Esta página no existe</h1>
      <p className="max-w-md text-muted-foreground">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Button asChild className="rounded-full">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
