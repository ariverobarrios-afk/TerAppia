-- ─────────────────────────────────────────────────────────────────────────────
-- RECORDATORIOS POR EMAIL (docs/recordatorios.md)
--
--   · Recordatorio de cita: 24 horas antes, al paciente.
--   · Recordatorio de pago: los domingos, a quien tenga sesiones pasadas (o
--     un bono) sin pagar.
--
-- Los emails los envía api/reminders.ts con Resend. Quien lo pone en marcha
-- es esta base de datos: pg_cron ejecuta run_reminders() cada 15 minutos y
-- esta llama a la función de Vercel con pg_net. Para que nadie más pueda
-- dispararla no hay clave compartida: run_reminders() guarda un token de un
-- solo uso en reminder_tokens y lo envía; el servidor solo sigue si consigue
-- borrarlo (con service_role).
-- ─────────────────────────────────────────────────────────────────────────────

-- Recordatorios de cita ya enviados. La hora forma parte de la clave: si la
-- cita se mueve, se vuelve a avisar de la nueva hora.
create table if not exists public.appointment_reminders (
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  starts_at      timestamptz not null,
  sent_at        timestamptz not null default now(),
  primary key (appointment_id, starts_at)
);
alter table public.appointment_reminders enable row level security;
drop policy if exists "appointment_reminders: admin lee" on public.appointment_reminders;
create policy "appointment_reminders: admin lee"
  on public.appointment_reminders for select to authenticated using (public.is_admin());

-- Recordatorios de pago ya enviados: uno por paciente y domingo.
create table if not exists public.payment_reminders (
  patient_id  uuid not null references public.profiles (id) on delete cascade on update cascade,
  week        date not null, -- el domingo (de Madrid) en que se envió
  total_cents integer not null,
  sent_at     timestamptz not null default now(),
  primary key (patient_id, week)
);
alter table public.payment_reminders enable row level security;
drop policy if exists "payment_reminders: admin lee" on public.payment_reminders;
create policy "payment_reminders: admin lee"
  on public.payment_reminders for select to authenticated using (public.is_admin());

-- Tokens de un solo uso para llamar a api/reminders.ts.
-- (Sin políticas: solo el servidor, con service_role.)
create table if not exists public.reminder_tokens (
  token      uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
alter table public.reminder_tokens enable row level security;

create or replace function public.run_reminders(
  p_url text default 'https://terappia.es/api/reminders'
)
returns void
language plpgsql security definer set search_path = public
as $fn$
declare
  v_token uuid;
begin
  delete from public.reminder_tokens where created_at < now() - interval '1 hour';
  insert into public.reminder_tokens default values returning token into v_token;
  perform net.http_post(
    url := p_url,
    body := jsonb_build_object('token', v_token),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 30000
  );
end;
$fn$;
revoke all on function public.run_reminders(text) from public, anon, authenticated;

-- Programación: se activa a mano cuando api/reminders.ts esté en producción
-- (pasos en docs/recordatorios.md):
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net with schema extensions;
--   select cron.schedule('terappia-recordatorios', '*/15 * * * *', 'select public.run_reminders()');
-- Para pausar los recordatorios: select cron.unschedule('terappia-recordatorios');
