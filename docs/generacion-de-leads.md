# Generación de leads (4.ª pata)

Terappia capta pacientes potenciales (leads) y se los ofrece a las profesionales **a precio de coste más una comisión de gestión**. La profesional ve en todo momento cuánto cuesta el lead y decide hasta qué precio quiere recibirlos.

Esta pata es solo de Terappia: Siloz no la tiene.

## Estado: vista previa con datos de ejemplo

Lo que hay es la pantalla, para verla y decidir sobre ella. **No hay campañas, ni tablas, ni cobros detrás.** Los precios y los leads salen de `client/src/lib/leadsDemo.ts` y la orden de compra se guarda solo en el navegador (`localStorage`).

## Regla de precio (`shared/leads.ts`)

- **Coste real por lead** = invertido en anuncios en los últimos 7 días ÷ leads válidos conseguidos en esos 7 días. Se usa una ventana de 7 días porque con pocos leads al día el coste diario salta demasiado.
- **Gestión de Terappia** = 5 % del coste real (`MANAGEMENT_FEE_PCT`).
- **Precio para la profesional** = coste real + gestión.

## La pantalla (`/panel` → Leads, `client/src/pages/area/Leads.tsx`)

| Bloque | Qué enseña |
|---|---|
| Precio del lead hoy | El precio y su desglose: invertido, leads conseguidos, coste real, gestión y total. Comparación con hace una semana. |
| Tu orden de compra | Interruptor activa / en pausa, **precio máximo por lead** (gestión incluida) y **máximo de leads al mes**. Indica cuántos de los últimos 30 días el lead estuvo dentro de ese máximo y el gasto máximo mensual. |
| Estado de la orden | `Recibiendo leads` (el precio de hoy entra en el máximo), `En espera` (está por encima), `Cupo del mes completo` o `En pausa`. |
| Cómo se ha movido el precio | Gráfica de 30 o 90 días con la línea del máximo de la profesional y la franja en la que compraría. |
| Leads recibidos | Cada lead con lo que costó (coste + gestión), su estado y el total del mes. |

## Pendiente de decidir

1. **Reparto cuando hay más demanda que leads.** Si varias profesionales están «recibiendo» a la vez, ¿a quién va cada lead? (por orden de llegada, por turnos, a quien acepta el precio más alto…).
2. **Panel interno de Terappia.** Demanda en espera (cuántas profesionales y a qué precio máximo) frente a los leads que se generan, para decidir cuánto invertir en captación.
3. **Qué precio paga la profesional**: el del día en que recibe el lead (lo que hace hoy la vista previa) u otro.
4. **Qué es un lead válido** y qué pasa con los que no lo son (teléfono falso, no contesta): ¿se devuelven?
5. **Cobro**: cuándo y cómo se cobra el lead (al entregarlo, a fin de mes, con saldo prepagado) y su tratamiento fiscal.
6. **Protección de datos**: consentimiento del lead para ceder sus datos a la profesional.
7. **Comisiones por uso de la plataforma**: el estudio de tramos según sesiones queda para más adelante y es independiente de esta pata.

## Para hacerlo real

- Tablas: gasto y leads por día, órdenes de compra por profesional y leads entregados.
- Sustituir `leadsDemo.ts` por esas consultas y guardar la orden en la base de datos.
- Motor de reparto (punto 1) y entrega del lead (aviso por email y ficha en el panel).
