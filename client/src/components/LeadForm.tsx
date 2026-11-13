import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContact } from "@/lib/sendContact";

const TIPOS = ["Trabajo por mi cuenta", "Somos un equipo o centro", "Todavía estoy empezando"];

// Solicitud de acceso anticipado: llega por email a Terappia (api/contact).
export default function LeadForm() {
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await sendContact({
        name: String(f.get("name") || "").trim(),
        email: String(f.get("email") || "").trim(),
        phone: String(f.get("phone") || "").trim(),
        message: String(f.get("message") || "").trim() || "Quiero probar Terappia.",
        sessionType: tipo,
        website: String(f.get("website") || ""),
      });
      setSent(true);
    } catch {
      setError("No se ha podido enviar. Escríbenos a hola@terappia.es y te respondemos.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-3 py-6">
        <CheckCircle2 className="size-8 text-primary" />
        <p className="font-serif text-xl font-semibold">Solicitud recibida</p>
        <p className="text-sm text-muted-foreground">Te escribimos en cuanto haya una plaza para tu consulta.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-name">Nombre</Label>
          <Input id="lead-name" name="name" required autoComplete="name" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-phone">Teléfono <span className="font-normal text-muted-foreground">(opcional)</span></Label>
        <Input id="lead-phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">¿Cómo trabajas?</legend>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button key={t} type="button" onClick={() => setTipo(t)} aria-pressed={tipo === t}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                tipo === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
              }`}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-message">¿Qué es lo que más te quita tiempo hoy? <span className="font-normal text-muted-foreground">(opcional)</span></Label>
        <Textarea id="lead-message" name="message" rows={3} />
      </div>
      {/* Trampa anti-spam: invisible para personas. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} size="lg" className="rounded-full">
        {busy && <Loader2 className="size-4 animate-spin" />}
        Pedir acceso anticipado
      </Button>
      <p className="text-xs text-muted-foreground">
        Usamos tus datos solo para responderte. Más información en el{" "}
        <a href="/aviso-legal" className="underline underline-offset-2 hover:text-primary">aviso legal</a>.
      </p>
    </form>
  );
}
