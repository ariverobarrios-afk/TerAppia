import { type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight, CalendarDays, CalendarCheck, FileSignature, Receipt, Sparkles, Ticket,
  Smartphone, ShieldCheck, MapPin, Lock, Check, Clock3,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadForm from "@/components/LeadForm";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

// ── Maqueta de la agenda (ilustración de la portada, datos inventados) ──────
type Block = { day: number; top: number; height: number; label: string; kind: "cita" | "hueco" | "evento" };
const DAYS = ["Lun 16", "Mar 17", "Mié 18", "Jue 19", "Vie 20"];
const HOURS = ["9:00", "10:00", "11:00", "12:00", "13:00", "16:00", "17:00"];
const BLOCKS: Block[] = [
  { day: 0, top: 0, height: 1, label: "M. R.", kind: "cita" },
  { day: 0, top: 2, height: 1, label: "A. G.", kind: "cita" },
  { day: 0, top: 5, height: 1, label: "Hueco libre", kind: "hueco" },
  { day: 1, top: 1, height: 1, label: "L. P.", kind: "cita" },
  { day: 1, top: 3, height: 1, label: "Hueco libre", kind: "hueco" },
  { day: 1, top: 5, height: 2, label: "Reunión", kind: "evento" },
  { day: 2, top: 0, height: 1, label: "C. V.", kind: "cita" },
  { day: 2, top: 1, height: 1, label: "J. M.", kind: "cita" },
  { day: 2, top: 4, height: 1, label: "Hueco libre", kind: "hueco" },
  { day: 3, top: 2, height: 1, label: "Pareja · S. y D.", kind: "cita" },
  { day: 3, top: 5, height: 1, label: "E. T.", kind: "cita" },
  { day: 4, top: 0, height: 1, label: "Hueco libre", kind: "hueco" },
  { day: 4, top: 1, height: 1, label: "N. B.", kind: "cita" },
  { day: 4, top: 3, height: 1, label: "R. O.", kind: "cita" },
];
const ROW = 44; // px por hora

function AgendaMock() {
  const kindClass: Record<Block["kind"], string> = {
    cita: "bg-primary text-primary-foreground",
    hueco: "border border-dashed border-primary/50 bg-secondary text-primary",
    evento: "bg-peach text-foreground",
  };
  return (
    <div role="img" aria-label="Ejemplo de la agenda semanal de Terappia con citas, huecos libres y eventos"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_oklch(0.44_0.15_272/0.45)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-serif text-sm font-semibold">Semana del 16 al 20</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Cita</span>
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-dashed border-primary" />Hueco</span>
          <span className="hidden items-center gap-1.5 sm:flex"><span className="size-2 rounded-full bg-peach" />Evento</span>
        </div>
      </div>
      <div className="grid grid-cols-[2.75rem_repeat(5,minmax(0,1fr))]">
        <div />
        {DAYS.map((d) => (
          <div key={d} className="border-l border-border px-1 py-2 text-center text-[11px] font-medium text-muted-foreground">{d}</div>
        ))}
        <div className="border-t border-border">
          {HOURS.map((h) => (
            <div key={h} style={{ height: ROW }} className="pr-1.5 pt-1 text-right text-[10px] text-muted-foreground">{h}</div>
          ))}
        </div>
        {DAYS.map((d, i) => (
          <div key={d} className="relative border-l border-t border-border" style={{ height: ROW * HOURS.length }}>
            {HOURS.map((h, r) => r > 0 && (
              <div key={h} className="absolute inset-x-0 border-t border-border/60" style={{ top: r * ROW }} />
            ))}
            {BLOCKS.filter((b) => b.day === i).map((b) => (
              <div key={`${b.day}-${b.top}`}
                className={`absolute inset-x-1 overflow-hidden rounded-md px-1.5 py-1 text-[10px] font-medium leading-tight ${kindClass[b.kind]}`}
                style={{ top: b.top * ROW + 3, height: b.height * ROW - 6 }}>
                {b.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Contenido ───────────────────────────────────────────────────────────────
const FEATURES: { icon: typeof CalendarDays; title: string; text: string }[] = [
  { icon: CalendarDays, title: "Agenda semanal", text: "Citas, eventos y días que pasas en otro centro, en una sola vista. Se sincroniza con Google Calendar, el iPhone u Outlook." },
  { icon: CalendarCheck, title: "Reserva sobre tus huecos", text: "Tú abres los huecos y el paciente reserva desde su área. Una cita por semana y cancelación con más de 24 horas, sin que tengas que perseguir a nadie." },
  { icon: FileSignature, title: "Consentimientos firmados", text: "El paciente firma la protección de datos y las normas del servicio dentro de la app. El PDF queda guardado y descargable para los dos." },
  { icon: Ticket, title: "Bonos, tarifas y pagos", text: "Sesión suelta o bono, tarifa individual o de pareja y precios especiales por paciente. Sabes en todo momento qué está pagado." },
  { icon: Receipt, title: "Facturación", text: "Facturas numeradas a partir de los pagos, listas para enviar, y descarga en Excel por periodo para tu gestoría." },
  { icon: Sparkles, title: "Notas de sesión con IA", text: "A partir de tus notas, la IA te propone las claves de la sesión. Tú las revisas y decides cuáles compartes con el paciente." },
];

const PATIENT_POINTS = [
  "Reserva y cancela sus citas sin escribirte",
  "Firma sus documentos desde el móvil",
  "Consulta sus próximas citas y su historial",
  "Lee las claves de su proceso que tú publiques",
];

const ROADMAP: { title: string; text: string }[] = [
  { title: "Facturas con VeriFactu", text: "Envío de las facturas a la Agencia Tributaria desde la propia app." },
  { title: "Pago online", text: "Que el paciente pague la sesión o el bono al reservar." },
  { title: "Recordatorios", text: "Avisos automáticos antes de cada cita para reducir ausencias." },
  { title: "Equipos y centros", text: "Varias profesionales en una misma consulta, cada una con sus pacientes." },
];

const FAQ: { q: string; a: string }[] = [
  { q: "¿En qué se diferencia de otros programas para psicólogos?", a: "Terappia nace dentro de una consulta de psicología online que la usa cada día. Por eso el paciente no es un añadido: reserva, firma y sigue su proceso desde su propia área, y tú dejas de hacer de secretaria." },
  { q: "¿Mis pacientes tienen que instalar algo?", a: "No. Entran desde el navegador con su email y su contraseña. Si quieren, pueden añadirla a la pantalla de inicio del móvil y se abre como una app." },
  { q: "¿Dónde se guardan los datos?", a: "En servidores de la Unión Europea, cifrados, y cada paciente solo puede ver su propia información. Las notas de sesión solo las ves tú." },
  { q: "¿Qué hace exactamente la IA con mis notas?", a: "Lee solo el texto de tus notas, sin nombre ni DNI del paciente, y te propone un borrador de las claves de la sesión. No diagnostica ni decide nada: nada llega al paciente si tú no lo publicas." },
  { q: "¿Cuánto cuesta?", a: "Todavía estamos en acceso anticipado con un grupo reducido de consultas y el precio de lanzamiento no está cerrado. Quien entre ahora lo conocerá antes que nadie y sin compromiso." },
  { q: "¿Puedo traer mis pacientes y facturas de otro programa?", a: "Sí. En el acceso anticipado te ayudamos a pasar tus pacientes y tus facturas anteriores para que no empieces de cero." },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">{children}</p>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Portada */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-peach-soft blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-40 size-[28rem] rounded-full bg-secondary blur-3xl" />
        <div className="container relative grid items-center gap-12 pb-20 lg:grid-cols-[1fr_1.1fr] lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-peach" /> Acceso anticipado para consultas de psicología
            </p>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Tu consulta, organizada.<br />
              <span className="text-primary">Tú, con tus pacientes.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Agenda, reservas, consentimientos, bonos, facturas y notas de sesión en un solo sitio. Hecho desde dentro
              de una consulta de psicología, no adaptado de un programa para clínicas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="rounded-full px-6" onClick={() => scrollTo("acceso-anticipado")}>
                Pedir acceso anticipado <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-6" onClick={() => scrollTo("funciones")}>
                Ver qué hace
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="size-4 text-primary" />Datos en la Unión Europea</li>
              <li className="flex items-center gap-2"><Lock className="size-4 text-primary" />Cada paciente solo ve lo suyo</li>
            </ul>
          </div>
          <AgendaMock />
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="scroll-mt-20 border-t border-border bg-card py-20 md:py-28">
        <div className="container">
          <div className="max-w-2xl">
            <Eyebrow>Lo que ya hace</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Todo el trabajo de fuera de la sesión, en un solo sitio</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nada de esto es una promesa: son las funciones con las que ya trabaja una consulta cada semana.
            </p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-card p-7">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-serif text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lado del paciente */}
      <section id="pacientes" className="scroll-mt-20 py-20 md:py-28">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Para tus pacientes</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Su propia área, no un enlace de reservas</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Cada paciente entra con su cuenta y encuentra todo lo de su proceso contigo. Tú decides qué huecos abres
              y qué compartes; lo demás ocurre sin mensajes de ida y vuelta.
            </p>
            <ul className="mt-8 space-y-3">
              {PATIENT_POINTS.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                  <span className="text-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Maqueta del área del paciente (datos inventados) */}
          <div role="img" aria-label="Ejemplo del área del paciente en el móvil" className="mx-auto w-full max-w-sm">
            <div className="rounded-[2rem] border border-border bg-card p-5 shadow-[0_30px_80px_-30px_oklch(0.44_0.15_272/0.45)]">
              <div className="flex items-center justify-between">
                <p className="font-serif text-lg font-semibold">Mi área</p>
                <Smartphone className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-4 rounded-xl bg-primary p-4 text-primary-foreground">
                <p className="text-xs opacity-80">Tu próxima cita</p>
                <p className="mt-1 font-serif text-xl font-semibold">Martes 17, 10:00</p>
                <p className="mt-1 text-xs opacity-80">Sesión individual · videollamada</p>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Huecos disponibles</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {["Lun 16:00", "Mar 12:00", "Mié 13:00"].map((h) => (
                  <span key={h} className="rounded-lg border border-dashed border-primary/50 bg-secondary px-2 py-2 text-center text-xs font-medium text-primary">{h}</span>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <FileSignature className="size-4 text-primary" />
                  <p className="text-sm">Consentimiento</p>
                </div>
                <span className="rounded-full bg-peach-soft px-2 py-0.5 text-xs font-medium">Pendiente de firma</span>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm">Claves de mi proceso</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* En camino */}
      <section id="en-camino" className="scroll-mt-20 border-y border-border bg-secondary/50 py-20 md:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <Eyebrow>En camino</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Lo siguiente que estamos construyendo</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Todavía no está disponible. Lo decimos claro para que sepas qué hay hoy y qué viene.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((r) => (
              <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-peach-soft px-2.5 py-1 text-xs font-medium">
                  <Clock3 className="size-3" /> Próximamente
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacidad */}
      <section className="py-20 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <h2 className="mt-5 font-serif text-3xl font-semibold md:text-4xl">Datos de salud, tratados como tales</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { t: "En la Unión Europea", d: "La base de datos y los documentos firmados se guardan en servidores europeos." },
              { t: "Permisos en la base de datos", d: "Cada paciente solo puede leer lo suyo, aunque alguien manipule la web." },
              { t: "Tus notas son tuyas", d: "Las notas de sesión no las ve el paciente ni nadie más que tú." },
            ].map((x) => (
              <div key={x.t}>
                <h3 className="font-serif text-base font-semibold">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section id="preguntas" className="scroll-mt-20 border-t border-border bg-card py-20 md:py-24">
        <div className="container max-w-3xl">
          <Eyebrow>Preguntas</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-semibold md:text-4xl">Lo que suelen preguntarnos</h2>
          <Accordion type="single" collapsible className="mt-8">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-serif text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Acceso anticipado */}
      <section id="acceso-anticipado" className="scroll-mt-20 py-20 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>Acceso anticipado</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl font-semibold md:text-5xl">Pruébalo con tu consulta antes que nadie</h2>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Estamos abriendo Terappia a un grupo reducido de psicólogas y psicólogos. Cuéntanos cómo trabajas y te
              avisamos cuando haya plaza.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/acceso" className="font-medium text-primary underline underline-offset-4">Entra al área privada</Link>
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <LeadForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
