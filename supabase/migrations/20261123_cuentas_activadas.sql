-- ─────────────────────────────────────────────────────────────────────────────
-- CUENTAS ACTIVADAS
-- ─────────────────────────────────────────────────────────────────────────────
-- Pacientes que ya han activado su cuenta (han elegido contraseña): la ficha
-- marca «Invitación sin aceptar» a los demás.
create or replace function public.activated_patient_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $fn$
  select u.id
    from auth.users u
   where public.is_admin() and coalesce(u.encrypted_password, '') <> '';
$fn$;
revoke all on function public.activated_patient_ids() from public, anon;
grant execute on function public.activated_patient_ids() to authenticated;
