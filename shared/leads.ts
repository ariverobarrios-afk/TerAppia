// Generación de leads: la 4.ª pata de Terappia (Siloz no la tiene).
//
// Regla de precio, transparente para la profesional: paga lo que ha costado
// conseguir el lead más una comisión de gestión. Ella decide hasta qué precio
// quiere recibir leads (su «orden de compra»).

/** Comisión de gestión de Terappia sobre el coste real del lead. */
export const MANAGEMENT_FEE_PCT = 5;

/** El precio de cada día sale de la inversión y los leads de estos últimos días. */
export const PRICE_WINDOW_DAYS = 7;

/** Lo invertido en captación y los leads válidos conseguidos en un día. */
export interface LeadDay {
  day: string; // yyyy-MM-dd
  spend_cents: number;
  leads: number;
}

/** Precio del lead en un día, con todo lo que lo explica. */
export interface LeadPrice {
  day: string;
  window_spend_cents: number; // invertido en la ventana
  window_leads: number; // leads válidos en la ventana
  cost_cents: number; // coste real por lead
  fee_cents: number; // gestión de Terappia
  price_cents: number; // lo que paga la profesional
}

export function feeCents(costCents: number): number {
  return Math.round((costCents * MANAGEMENT_FEE_PCT) / 100);
}

export function priceFromCost(costCents: number): { cost_cents: number; fee_cents: number; price_cents: number } {
  const fee = feeCents(costCents);
  return { cost_cents: costCents, fee_cents: fee, price_cents: costCents + fee };
}

// Precio de cada día: inversión de los últimos 7 días ÷ leads válidos de esos
// mismos días. Los primeros días (sin ventana completa) no tienen precio; si en
// una ventana no hubo ningún lead, se mantiene el último precio conocido.
export function priceSeries(days: LeadDay[], windowDays = PRICE_WINDOW_DAYS): LeadPrice[] {
  const out: LeadPrice[] = [];
  for (let i = windowDays - 1; i < days.length; i++) {
    const window = days.slice(i - windowDays + 1, i + 1);
    const spend = window.reduce((s, d) => s + d.spend_cents, 0);
    const leads = window.reduce((s, d) => s + d.leads, 0);
    const previous = out[out.length - 1];
    if (leads === 0 && !previous) continue;
    const cost = leads > 0 ? Math.round(spend / leads) : previous.cost_cents;
    out.push({ day: days[i].day, window_spend_cents: spend, window_leads: leads, ...priceFromCost(cost) });
  }
  return out;
}

/** Orden de compra de una profesional. El máximo incluye la gestión. */
export interface LeadOrder {
  active: boolean;
  max_price_cents: number;
  monthly_cap: number;
}

export type OrderStatus = "pausada" | "cupo_completo" | "recibiendo" | "en_espera";

export function orderStatus(order: LeadOrder, priceCents: number, receivedThisMonth: number): OrderStatus {
  if (!order.active) return "pausada";
  if (receivedThisMonth >= order.monthly_cap) return "cupo_completo";
  return priceCents <= order.max_price_cents ? "recibiendo" : "en_espera";
}

/** Días de la serie en los que el lead estuvo al precio máximo o por debajo. */
export function daysAtOrBelow(series: LeadPrice[], maxPriceCents: number): number {
  return series.filter((p) => p.price_cents <= maxPriceCents).length;
}
