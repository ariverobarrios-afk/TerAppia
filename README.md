# Terappia

Programa de gestión para consultas de psicología: web pública, área de la
profesional (`/panel`) y área del paciente (`/mi-area`).

## Ramas y entornos

| Rama | Entorno en Vercel | Qué se ve |
|---|---|---|
| `main` | Producción (`terappia.es`) | Solo la página «Muy pronto», hasta el lanzamiento |
| `dev` y cualquier otra | Preview (URL de Vercel, con sesión iniciada) | La web y el área privada completas |

Para abrir producción al público: en Vercel, variable `TERAPPIA_PUBLICA=1`
en el entorno Production y volver a desplegar.

El trabajo diario va a `dev`. A `main` solo pasa lo que esté validado.

## Puesta en marcha

Ver `AREA-PRIVADA-SETUP.md`.
