import { test } from "node:test";
import assert from "node:assert/strict";
import { daysAtOrBelow, feeCents, orderStatus, priceFromCost, priceSeries, type LeadDay, type LeadOrder } from "../shared/leads";

test("el precio es el coste real más un 5 % de gestión", () => {
  assert.equal(feeCents(4000), 200);
  assert.deepEqual(priceFromCost(4658), { cost_cents: 4658, fee_cents: 233, price_cents: 4891 });
});

const day = (n: number, spend: number, leads: number): LeadDay => ({
  day: `2026-11-${String(n).padStart(2, "0")}`,
  spend_cents: spend,
  leads,
});

test("el precio del día sale de la inversión y los leads de los últimos 7 días", () => {
  const days = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => day(n, 7000, n === 8 ? 3 : 1));
  const series = priceSeries(days);
  assert.equal(series.length, 2); // los 6 primeros días no tienen ventana completa
  assert.deepEqual(series[0], {
    day: "2026-11-07", window_spend_cents: 49000, window_leads: 7, cost_cents: 7000, fee_cents: 350, price_cents: 7350,
  });
  // Día 8: mismos 490 € pero 9 leads en la ventana (días 2 a 8).
  assert.equal(series[1].cost_cents, Math.round(49000 / 9));
});

test("una semana sin leads mantiene el último precio conocido", () => {
  const days = [
    ...[1, 2, 3, 4, 5, 6, 7].map((n) => day(n, 7000, 1)),
    ...[8, 9, 10, 11, 12, 13, 14].map((n) => day(n, 7000, 0)),
  ];
  const series = priceSeries(days);
  assert.equal(series[series.length - 1].window_leads, 0);
  assert.equal(series[series.length - 1].cost_cents, series[series.length - 2].cost_cents);
});

test("estado de la orden de compra", () => {
  const order: LeadOrder = { active: true, max_price_cents: 4800, monthly_cap: 6 };
  assert.equal(orderStatus(order, 4800, 0), "recibiendo"); // el máximo entra
  assert.equal(orderStatus(order, 4801, 0), "en_espera");
  assert.equal(orderStatus(order, 3000, 6), "cupo_completo");
  assert.equal(orderStatus({ ...order, active: false }, 3000, 0), "pausada");
});

test("días en los que el lead estuvo dentro del máximo", () => {
  const series = priceSeries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => day(n, 7000, n >= 8 ? 5 : 1)));
  assert.equal(daysAtOrBelow(series, 7350), 3);
  assert.equal(daysAtOrBelow(series, 5000), 2);
  assert.equal(daysAtOrBelow(series, 4000), 1);
  assert.equal(daysAtOrBelow(series, 1000), 0);
});
