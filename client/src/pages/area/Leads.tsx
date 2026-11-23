import { useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDownRight, ArrowUpRight, FlaskConical, Minus, Plus } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { euros } from "@/lib/tariffs";
import { DEMO_MAX_PRICE_CENTS, demoPrices, demoReceivedLeads, type ReceivedLeadStatus } from "@/lib/leadsDemo";
import {
  MANAGEMENT_FEE_PCT,
  PRICE_WINDOW_DAYS,
  daysAtOrBelow,
  orderStatus,
  type LeadOrder,
  type LeadPrice,
  type OrderStatus,
} from "../../../../shared/leads";

// Pestaña «Leads» del panel: la 4.ª pata de Terappia. La profesional ve cuánto
// cuesta hoy conseguir un lead (coste real + gestión) y decide hasta qué precio
// quiere recibirlos. De momento funciona con datos de ejemplo (lib/leadsDemo.ts)
// y la orden se guarda solo en este navegador.

const MIN_PRICE_EUR = 20;
const MAX_PRICE_EUR = 90;
const MAX_CAP = 30;
const ORDER_KEY = "terappia.leads.orden";
const DEFAULT_ORDER: LeadOrder = { active: true, max_price_cents: DEMO_MAX_PRICE_CENTS, monthly_cap: 6 };

function loadOrder(): LeadOrder {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ORDER_KEY) ?? "null") as Partial<LeadOrder> | null;
    if (saved && typeof saved.max_price_cents === "number" && typeof saved.monthly_cap === "number") {
      return { active: saved.active !== false, max_price_cents: saved.max_price_cents, monthly_cap: saved.monthly_cap };
    }
  } catch {
    // sin almacenamiento disponible: se usa la orden por defecto
  }
  return DEFAULT_ORDER;
}

function saveOrder(order: LeadOrder) {
  try {
    window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // la orden sigue valiendo mientras la pestaña esté abierta
  }
}

const STATUS: Record<OrderStatus, { label: string; className: string }> = {
  recibiendo: { label: "Recibiendo leads", className: "border-primary/30 bg-primary/10 text-primary" },
  en_espera: { label: "En espera", className: "border-amber-300 bg-amber-50 text-amber-900" },
  cupo_completo: { label: "Cupo del mes completo", className: "border-border bg-secondary text-muted-foreground" },
  pausada: { label: "En pausa", className: "border-border bg-secondary text-muted-foreground" },
};

const LEAD_STATUS: Record<ReceivedLeadStatus, { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "border-primary/30 bg-primary/10 text-primary" },
  contactado: { label: "Contactado", className: "border-border text-muted-foreground" },
  cita_reservada: { label: "Primera cita reservada", className: "border-emerald-300 bg-emerald-50 text-emerald-900" },
  sin_respuesta: { label: "Sin respuesta", className: "border-border bg-secondary text-muted-foreground" },
};

const chartConfig = { price: { label: "Precio del lead", color: "var(--primary)" } } satisfies ChartConfig;

const shortDay = (day: string) => format(new Date(`${day}T12:00:00`), "d MMM", { locale: es });
const longDay = (day: string) => format(new Date(`${day}T12:00:00`), "EEEE d 'de' MMMM", { locale: es });

function statusText(status: OrderStatus, order: LeadOrder, today: LeadPrice, received: number): string {
  switch (status) {
    case "recibiendo":
      return `El lead está hoy a ${euros(today.price_cents)}, dentro de tu máximo. Te pasaremos los siguientes que entren.`;
    case "en_espera":
      return `El lead está hoy a ${euros(today.price_cents)}, por encima de tu máximo de ${euros(order.max_price_cents)}. Empezarás a recibir en cuanto baje.`;
    case "cupo_completo":
      return `Ya has recibido ${received} ${received === 1 ? "lead" : "leads"} este mes, tu máximo. Volverás a recibir el mes que viene.`;
    case "pausada":
      return "No recibirás leads hasta que vuelvas a activar la orden.";
  }
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 text-sm ${strong ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
      <dt>{label}</dt>
      <dd className={`shrink-0 tabular-nums ${strong ? "" : "text-foreground"}`}>{value}</dd>
    </div>
  );
}

function PriceTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: LeadPrice }> }) {
  const p = active ? payload?.[0]?.payload : undefined;
  if (!p) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground first-letter:uppercase">{longDay(p.day)}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-foreground">{euros(p.price_cents)}</p>
      <p className="tabular-nums text-muted-foreground">
        {euros(p.cost_cents)} de coste + {euros(p.fee_cents)} de gestión
      </p>
      <p className="tabular-nums text-muted-foreground">
        {p.window_leads} leads con {euros(p.window_spend_cents)} en {PRICE_WINDOW_DAYS} días
      </p>
    </div>
  );
}

export function LeadsTab() {
  const [range, setRange] = useState<30 | 90>(30);
  const [saved, setSaved] = useState<LeadOrder>(loadOrder);
  const [order, setOrder] = useState<LeadOrder>(saved);

  const { prices, received } = useMemo(() => {
    const prices = demoPrices(new Date(), 90);
    return { prices, received: demoReceivedLeads(prices) };
  }, []);

  const today = prices[prices.length - 1];
  const weekAgo = prices[prices.length - 8];
  const delta = today.price_cents - weekAgo.price_cents;
  const visible = useMemo(() => prices.slice(-range).map((p) => ({ ...p, price: p.price_cents / 100 })), [prices, range]);
  const last30 = prices.slice(-30);

  const month = today.day.slice(0, 7);
  const receivedThisMonth = received.filter((l) => l.day.startsWith(month));
  const spentThisMonth = receivedThisMonth.reduce((s, l) => s + l.price_cents, 0);

  const status = orderStatus(order, today.price_cents, receivedThisMonth.length);
  const daysInRange = daysAtOrBelow(last30, order.max_price_cents);
  const dirty = JSON.stringify(order) !== JSON.stringify(saved);

  const maxEur = order.max_price_cents / 100;
  const values = visible.map((p) => p.price);
  const yMin = Math.floor((Math.min(...values, maxEur) - 3) / 10) * 10;
  const yMax = Math.ceil((Math.max(...values, maxEur) + 3) / 10) * 10;
  const yTicks = Array.from({ length: (yMax - yMin) / 10 + 1 }, (_, i) => yMin + i * 10);
  const lowest = visible.reduce((a, b) => (b.price_cents < a.price_cents ? b : a));
  const highest = visible.reduce((a, b) => (b.price_cents > a.price_cents ? b : a));
  const average = Math.round(visible.reduce((s, p) => s + p.price_cents, 0) / visible.length);

  const save = () => {
    saveOrder(order);
    setSaved(order);
    toast.success("Orden guardada en este navegador (vista previa).");
  };

  const setCap = (cap: number) => setOrder({ ...order, monthly_cap: Math.min(MAX_CAP, Math.max(1, cap)) });

  return (
    <div className="flex flex-col gap-6">
      <p className="flex items-start gap-2 rounded-2xl border border-peach bg-peach-soft px-4 py-3 text-sm text-foreground">
        <FlaskConical className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Vista previa con datos de ejemplo.</strong> Los precios y los leads son inventados y todavía no
          se compra ni se cobra nada.
        </span>
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Precio de hoy, desglosado */}
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="leads-precio">
          <h2 id="leads-precio" className="text-sm text-muted-foreground">Precio del lead hoy</h2>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-serif text-4xl font-semibold tabular-nums text-foreground">{euros(today.price_cents)}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              {delta === 0 ? null : delta < 0 ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
              {delta === 0
                ? "Igual que hace una semana"
                : `${euros(Math.abs(delta))} ${delta < 0 ? "menos" : "más"} que hace una semana`}
            </p>
          </div>
          <dl className="mt-4 divide-y divide-border border-t border-border">
            <Row label={`Invertido en anuncios (últimos ${PRICE_WINDOW_DAYS} días)`} value={euros(today.window_spend_cents)} />
            <Row label="Leads conseguidos en esos días" value={String(today.window_leads)} />
            <Row label="Coste real por lead" value={euros(today.cost_cents)} />
            <Row label={`Gestión de Terappia (${MANAGEMENT_FEE_PCT} %)`} value={`+ ${euros(today.fee_cents)}`} />
            <Row label="Lo que pagas por lead" value={euros(today.price_cents)} strong />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Pagas lo que nos cuesta conseguir el lead más un {MANAGEMENT_FEE_PCT} % de gestión. Nada más.
          </p>
        </section>

        {/* Orden de compra */}
        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="leads-orden">
          <div className="flex items-center justify-between gap-3">
            <h2 id="leads-orden" className="font-serif text-xl font-semibold text-foreground">Tu orden de compra</h2>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {order.active ? "Activa" : "En pausa"}
              <Switch checked={order.active} onCheckedChange={(active) => setOrder({ ...order, active })}
                aria-label="Recibir leads" />
            </label>
          </div>

          <div className={order.active ? "" : "opacity-50"}>
            <div className="mt-5 flex items-baseline justify-between gap-3">
              <label id="leads-max-label" className="text-sm font-medium text-foreground">
                Quiero leads cuando cuesten como máximo
              </label>
              <span className="shrink-0 whitespace-nowrap font-serif text-2xl font-semibold tabular-nums text-foreground">{euros(order.max_price_cents)}</span>
            </div>
            <Slider className="mt-4 py-2" min={MIN_PRICE_EUR} max={MAX_PRICE_EUR} step={1} disabled={!order.active}
              aria-labelledby="leads-max-label"
              value={[maxEur]} onValueChange={([v]) => setOrder({ ...order, max_price_cents: v * 100 })} />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
              <span>{MIN_PRICE_EUR} €</span>
              <span>{MAX_PRICE_EUR} €</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Gestión incluida. En los últimos 30 días el lead ha estado a ese precio o menos{" "}
              <strong className="text-foreground">{daysInRange} de {last30.length} días</strong>.
            </p>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span id="leads-cap-label" className="text-sm font-medium text-foreground">Máximo de leads al mes</span>
              <div className="flex items-center gap-2" role="group" aria-labelledby="leads-cap-label">
                <Button variant="outline" size="icon" className="size-8 rounded-full" disabled={!order.active || order.monthly_cap <= 1}
                  onClick={() => setCap(order.monthly_cap - 1)} aria-label="Un lead menos">
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center font-serif text-xl font-semibold tabular-nums text-foreground">{order.monthly_cap}</span>
                <Button variant="outline" size="icon" className="size-8 rounded-full" disabled={!order.active || order.monthly_cap >= MAX_CAP}
                  onClick={() => setCap(order.monthly_cap + 1)} aria-label="Un lead más">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Como mucho gastarías <strong className="tabular-nums text-foreground">{euros(order.monthly_cap * order.max_price_cents)}</strong> al mes.
            </p>
          </div>

          <div className="mt-5 rounded-xl bg-secondary px-4 py-3">
            <Badge variant="outline" className={STATUS[status].className}>{STATUS[status].label}</Badge>
            <p className="mt-2 text-sm text-foreground">{statusText(status, order, today, receivedThisMonth.length)}</p>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            {dirty && (
              <Button variant="ghost" className="rounded-full" onClick={() => setOrder(saved)}>Descartar</Button>
            )}
            <Button className="rounded-full" disabled={!dirty} onClick={save}>
              {dirty ? "Guardar orden" : "Orden guardada"}
            </Button>
          </div>
        </section>
      </div>

      {/* Evolución del precio */}
      <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="leads-evolucion">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="leads-evolucion" className="font-serif text-xl font-semibold text-foreground">Cómo se ha movido el precio</h2>
            <p className="text-sm text-muted-foreground">
              Precio por lead con la gestión incluida. La franja marca lo que entra en tu máximo.
            </p>
          </div>
          <div className="flex w-fit rounded-full border border-border bg-secondary p-1" role="group" aria-label="Periodo">
            {([30, 90] as const).map((days) => (
              <Button key={days} size="sm" className="rounded-full" variant={range === days ? "default" : "ghost"}
                aria-pressed={range === days} onClick={() => setRange(days)}>
                {days} días
              </Button>
            ))}
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-0.5 w-5 rounded-full bg-primary" aria-hidden />
            Precio del lead
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 border-t-2 border-dashed border-foreground/60" aria-hidden />
            Tu máximo: <span className="tabular-nums text-foreground">{euros(order.max_price_cents)}</span>
          </li>
        </ul>

        <ChartContainer config={chartConfig} className="mt-2 aspect-auto h-60 w-full sm:h-80"
          role="img"
          aria-label={`Precio del lead en los últimos ${range} días: mínimo ${euros(lowest.price_cents)}, medio ${euros(average)}, máximo ${euros(highest.price_cents)}. Tu máximo es ${euros(order.max_price_cents)}.`}>
          <LineChart data={visible} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={40} tickFormatter={shortDay} />
            <YAxis domain={[yMin, yMax]} ticks={yTicks} width={44} tickLine={false} axisLine={false} tickMargin={4}
              tickFormatter={(v: number) => `${v} €`} />
            <ReferenceArea y1={yMin} y2={maxEur} fill="var(--color-price)" fillOpacity={0.08} stroke="none" />
            <ReferenceLine y={maxEur} stroke="var(--foreground)" strokeDasharray="4 4" strokeOpacity={0.6} />
            <ChartTooltip cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }} content={<PriceTooltip />} />
            <Line dataKey="price" type="linear" stroke="var(--color-price)"
              strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false} />
            <ReferenceDot x={today.day} y={today.price_cents / 100} r={5} fill="var(--color-price)" stroke="var(--card)" strokeWidth={2} />
          </LineChart>
        </ChartContainer>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Más barato</dt>
            <dd className="font-semibold tabular-nums text-foreground">{euros(lowest.price_cents)}</dd>
            <dd className="text-xs text-muted-foreground">{shortDay(lowest.day)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Precio medio</dt>
            <dd className="font-semibold tabular-nums text-foreground">{euros(average)}</dd>
            <dd className="text-xs text-muted-foreground">{range} días</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Más caro</dt>
            <dd className="font-semibold tabular-nums text-foreground">{euros(highest.price_cents)}</dd>
            <dd className="text-xs text-muted-foreground">{shortDay(highest.day)}</dd>
          </div>
        </dl>
      </section>

      {/* Leads recibidos */}
      <section aria-labelledby="leads-recibidos">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="leads-recibidos" className="font-serif text-2xl font-semibold text-foreground">Leads recibidos</h2>
          <p className="text-sm text-muted-foreground">
            Este mes: {receivedThisMonth.length} de {saved.monthly_cap} · {euros(spentThisMonth)}
          </p>
        </div>
        {received.length === 0 ? (
          <p className="text-muted-foreground">Todavía no has recibido ningún lead.</p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {received.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{l.name}</p>
                  <p className="text-muted-foreground">{l.reason} · {shortDay(l.day)}</p>
                  <Badge variant="outline" className={`mt-2 ${LEAD_STATUS[l.status].className}`}>{LEAD_STATUS[l.status].label}</Badge>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium tabular-nums text-foreground">{euros(l.price_cents)}</p>
                  <p className="text-xs tabular-nums text-muted-foreground">
                    {euros(l.cost_cents)} + {euros(l.fee_cents)} gestión
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
