import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// BORRADOR: Terappia está en pruebas privadas y todavía no tiene sociedad
// constituida. Antes de abrir al público hay que completar el titular, el
// NIF, el domicilio y la lista definitiva de encargados del tratamiento.
export default function AvisoLegal() {
  useEffect(() => {
    const target = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0 });
  }, []);

  const h2 = "font-serif text-2xl font-semibold text-foreground mt-10 mb-3 scroll-mt-28";
  const p = "text-muted-foreground leading-relaxed";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl pb-20 pt-32">
        <h1 className="font-serif text-4xl font-semibold text-foreground md:text-5xl">Aviso legal y privacidad</h1>
        <p className="mt-4 rounded-lg border border-border bg-peach-soft px-4 py-3 text-sm text-foreground">
          Terappia está en fase de pruebas privadas. Este texto es provisional y se completará con los datos de la
          sociedad titular antes de abrir el servicio al público.
        </p>

        <h2 className={h2}>1. Quién está detrás</h2>
        <p className={p}>
          Terappia es un proyecto en desarrollo. Mientras dura la fase de pruebas, el contacto para cualquier cuestión
          sobre este sitio es <a className="text-primary underline underline-offset-2" href="mailto:hola@terappia.es">hola@terappia.es</a>.
        </p>

        <h2 className={h2}>2. Formulario de acceso anticipado</h2>
        <p className={p}>
          Si pides acceso anticipado, usamos tu nombre, email, teléfono y lo que nos cuentes únicamente para
          responderte y, si procede, darte de alta en las pruebas. No se ceden a terceros. Puedes pedir que los
          borremos escribiendo a hola@terappia.es.
        </p>

        <h2 id="area-privada" className={h2}>3. Área privada</h2>
        <p className={p}>
          En el área privada, cada profesional gestiona su agenda, sus pacientes, sus documentos y su facturación, y
          cada paciente ve únicamente su propia información: sus citas, sus documentos firmados y lo que su psicóloga
          decida compartir. Las notas de sesión solo las ve la profesional. El acceso está protegido con contraseña
          personal, las comunicaciones viajan cifradas y los datos se guardan en servidores de la Unión Europea.
        </p>
        <p className={`${p} mt-4`}>
          Durante la fase de pruebas el área privada funciona solo con datos de demostración: no debe usarse todavía
          con datos reales de pacientes.
        </p>

        <h2 className={h2}>4. Proveedores</h2>
        <ul className="ml-4 list-inside list-disc space-y-2 text-muted-foreground">
          <li><strong>Supabase:</strong> base de datos, inicio de sesión y documentos (servidores en Irlanda, UE).</li>
          <li><strong>Vercel:</strong> alojamiento del sitio web.</li>
          <li><strong>Resend:</strong> envío de los emails del servicio.</li>
        </ul>

        <h2 className={h2}>5. Cookies</h2>
        <p className={p}>
          Este sitio no usa cookies de publicidad ni de analítica. Solo se guarda en tu navegador lo imprescindible
          para mantener tu sesión iniciada en el área privada.
        </p>
      </main>
      <Footer />
    </div>
  );
}
