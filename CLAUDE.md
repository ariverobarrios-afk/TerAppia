# Terappia: reglas del proyecto

## Las 4 patas (regla fija)

Terappia tiene cuatro patas. Las tres primeras son las mismas que tiene Siloz; la cuarta es solo de Terappia.

| # | Pata | Qué cubre | Dónde vive hoy | ¿En Siloz? |
|---|---|---|---|---|
| 1 | **Pacientes** | Todo lo que ve el paciente: su área privada | `/mi-area` | Sí |
| 2 | **Agenda** | Gestión de citas y de la agenda del psicólogo | `/panel` → Agenda y Pacientes | Sí |
| 3 | **Facturación** | Cobros, bonos, facturas y demás del psicólogo | `/panel` → Pagos | Sí |
| 4 | **Generación de leads** | Panel donde el psicólogo ve el precio del lead y decide cuándo comprar | `/panel` → Leads | **No** |

Detalle de la cuarta pata: `docs/generacion-de-leads.md`.

## Siloz

Terappia nació como copia del área privada de Siloz. El repo y el proyecto de Siloz no se tocan: de Siloz solo se copia o se consulta, y todos los cambios van a este repo.

## Ramas

El trabajo diario va a `dev` y se ve en preview. A `main` (producción, `terappia.es`) solo pasa lo validado. Ver `README.md`.

## Antes de subir

`npm run check`, `npm test` y `npm run build`.
