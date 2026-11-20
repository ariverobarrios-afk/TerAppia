# Terappia

Programa de gestión para consultas de psicología: web pública, área de la
profesional (`/panel`) y área del paciente (`/mi-area`).

## Ramas y entornos

| Rama | Entorno en Vercel | Qué se ve |
|---|---|---|
| `claude/eager-johnson-jr2q3n` | Preview (URL de Vercel, con sesión iniciada) | La web y el área privada completas. **Es la rama de trabajo diario.** |
| `main` | Producción (`terappia.es`) | Solo la página «Muy pronto», hasta el lanzamiento |

De momento se trabaja siempre en preview: todo cambio va a
`claude/eager-johnson-jr2q3n`. A `main` solo pasa lo que esté validado.

Para abrir producción al público: en Vercel, variable `TERAPPIA_PUBLICA=1`
en el entorno Production y volver a desplegar.

## Base de datos

Terappia tiene su propio proyecto de Supabase (`llbcncpwwrzgaanwfcwi`, ver
`shared/supabasePublic.ts`), separado del de cualquier otro proyecto. Preview
y producción usan esa misma base de datos.

## Puesta en marcha

Ver `AREA-PRIVADA-SETUP.md`.
