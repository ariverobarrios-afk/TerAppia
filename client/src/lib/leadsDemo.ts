import { priceSeries, type LeadDay, type LeadPrice } from "../../../shared/leads";

// DATOS DE EJEMPLO del panel de leads. Todavía no hay campañas ni tablas
// detrás: esto solo sirve para ver y probar la pantalla. Cuando la captación
// sea real, `demoLeadDays` se sustituye por lo invertido y los leads de cada
// día, y `demoReceivedLeads` por los leads entregados a la profesional.

// Número pseudoaleatorio estable para un día: el historial no cambia al recargar.
function rand(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

function dayKey(n: number): string {
  return new Date(n * 86_400_000).toISOString().slice(0, 10);
}

/** Inversión y leads por día hasta hoy (incluye los días de arranque de la ventana). */
export function demoLeadDays(today: Date, count: number): LeadDay[] {
  const end = dayNumber(today);
  const days: LeadDay[] = [];
  for (let n = end - count + 1; n <= end; n++) {
    const spend = Math.round(6000 + rand(n) * 4500); // 60–105 € al día
    // Coste de fondo que sube y baja con las semanas (entre 28 € y 66 €).
    const target = 4700 + 1300 * Math.sin(n / 9) + 600 * Math.sin(n / 23 + 1);
    const expected = spend / target;
    const leads = Math.floor(expected) + (rand(n * 7 + 3) < expected % 1 ? 1 : 0);
    days.push({ day: dayKey(n), spend_cents: spend, leads });
  }
  return days;
}

export type ReceivedLeadStatus = "nuevo" | "contactado" | "cita_reservada" | "sin_respuesta";

export interface ReceivedLead {
  id: string;
  day: string;
  name: string;
  reason: string;
  status: ReceivedLeadStatus;
  cost_cents: number;
  fee_cents: number;
  price_cents: number;
}

const NAMES = ["Marta G.", "Daniel R.", "Lucía P.", "Carlos M.", "Elena S.", "Javier T.", "Nuria B.", "Pablo H.", "Irene V.", "Sergio L."];
const REASONS = ["Ansiedad", "Terapia de pareja", "Duelo", "Estrés laboral", "Autoestima", "Insomnio"];
const OLDER_STATUS: ReceivedLeadStatus[] = ["cita_reservada", "contactado", "cita_reservada", "sin_respuesta"];

/** Precio máximo de la orden de ejemplo con la que se «compraron» estos leads. */
export const DEMO_MAX_PRICE_CENTS = 4800;

/** Leads de ejemplo recibidos: días en los que el precio estaba dentro del máximo. */
export function demoReceivedLeads(prices: LeadPrice[]): ReceivedLead[] {
  const recent = prices.slice(-45);
  const out: ReceivedLead[] = [];
  recent.forEach((p, i) => {
    const n = Math.floor(Date.parse(p.day) / 86_400_000);
    if (p.price_cents > DEMO_MAX_PRICE_CENTS || rand(n * 13 + 5) > 0.4) return;
    const age = recent.length - 1 - i;
    out.push({
      id: p.day,
      day: p.day,
      name: NAMES[n % NAMES.length],
      reason: REASONS[(n * 5) % REASONS.length],
      status: age <= 2 ? "nuevo" : OLDER_STATUS[n % OLDER_STATUS.length],
      cost_cents: p.cost_cents,
      fee_cents: p.fee_cents,
      price_cents: p.price_cents,
    });
  });
  return out.reverse(); // el más reciente primero
}

export function demoPrices(today: Date, days: number): LeadPrice[] {
  return priceSeries(demoLeadDays(today, days + 6));
}
