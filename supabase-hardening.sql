-- =====================================================================
-- ACP-Studio: lock down the "Emails" table in Supabase
-- Run in: Supabase Dashboard > SQL Editor.  Safe to run more than once.
--
-- WHY: the publishable key in script.js is public by design (anyone can
-- read it in the browser). That is fine ONLY if the database refuses to
-- let that key do anything except what you intend. Without Row Level
-- Security, anyone could download your whole email list.
--
-- ORDER:  1. run STEPS 1-3   2. upload the new site files
--         3. test a login    4. run STEP 4   5. run the TESTS at the bottom
-- =====================================================================


-- ---------------------------------------------------------------------
-- STEP 0 (just look): which policies exist on the table right now?
-- If you see one with cmd = SELECT (or ALL) for anon / public, anyone on
-- the internet can read every email. STEP 4 removes it.
-- ---------------------------------------------------------------------
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'Emails';


-- ---------------------------------------------------------------------
-- STEP 1: switch Row Level Security on (with no policy = nobody gets in)
-- ---------------------------------------------------------------------
alter table public."Emails" enable row level security;


-- ---------------------------------------------------------------------
-- STEP 2: the table itself refuses junk, even if someone skips the site.
-- NOT VALID = new rows are checked; old rows are left alone.
-- ---------------------------------------------------------------------
alter table public."Emails" drop constraint if exists emails_sane_chk;
alter table public."Emails" add constraint emails_sane_chk
  check (
    length("Email") between 6 and 254
    and "Email" = lower("Email")
    and "Email" ~ '^[^[:space:]@<>"]+@[^[:space:]@<>"]+\.[^[:space:]@<>"]{2,}$'
  ) not valid;

-- One row per email, ignoring upper/lower case.
-- (If this fails with "could not create unique index", you already have
--  duplicates: delete the extra rows first, then run it again.)
create unique index if not exists emails_email_lower_uniq
  on public."Emails" (lower("Email"));


-- ---------------------------------------------------------------------
-- STEP 3: the ONLY way the website saves an email.
-- It validates the address, lower-cases it, and quietly ignores
-- duplicates, so nobody can use the site to test "is X in your list?".
-- ---------------------------------------------------------------------
create or replace function public.register_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v text := lower(btrim(p_email));
begin
  if v is null
     or length(v) > 254
     or length(split_part(v, '@', 1)) > 64
     or v ~ '(^\.)|(\.@)|(\.\.)'
     or v !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$'
     or v !~ '\.([a-z]{2,}|xn--[a-z0-9-]{2,})$'
  then
    raise exception 'invalid email' using errcode = '22023';
  end if;

  insert into public."Emails" ("Email") values (v) on conflict do nothing;
end;
$$;

revoke all on function public.register_email(text) from public, anon, authenticated;
grant execute on function public.register_email(text) to anon, authenticated;


-- ---------------------------------------------------------------------
-- STEP 4: close the table to direct access.
-- Run this AFTER you have uploaded the new site and a test login worked.
-- (Your dashboard / service role key still sees everything; only the
--  public key is shut out.)
-- Then open script.js and set FALLBACK_TO_DIRECT_INSERT = false.
-- ---------------------------------------------------------------------
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'Emails'
  loop
    execute format('drop policy %I on public."Emails"', pol.policyname);
  end loop;
end $$;

revoke all on table public."Emails" from anon, authenticated;


-- =====================================================================
-- TESTS: run these from any terminal after STEP 4 (replace the two
-- placeholders). Use the PUBLISHABLE key, the same one as in script.js.
--
-- 1) Reading the list must FAIL (permission denied) or return [] :
--    curl "https://YOUR-PROJECT.supabase.co/rest/v1/Emails?select=*" \
--         -H "apikey: YOUR_PUBLISHABLE_KEY"
--
-- 2) Writing straight to the table must FAIL:
--    curl -X POST "https://YOUR-PROJECT.supabase.co/rest/v1/Emails" \
--         -H "apikey: YOUR_PUBLISHABLE_KEY" -H "Content-Type: application/json" \
--         -d '{"Email":"hacker@example.com"}'
--
-- 3) The function must reject a bad address (HTTP 400, "invalid email"):
--    curl -X POST "https://YOUR-PROJECT.supabase.co/rest/v1/rpc/register_email" \
--         -H "apikey: YOUR_PUBLISHABLE_KEY" -H "Content-Type: application/json" \
--         -d '{"p_email":"<script>alert(1)</script>@x.com"}'
--
-- 4) Also open Dashboard > Advisors > Security Advisor and fix anything
--    it reports for the Emails table.
--
-- STILL NOT SOLVED BY SQL: anyone can call register_email in a loop and
-- fill the table with fake (but valid-looking) addresses. If that ever
-- happens, add a CAPTCHA such as Cloudflare Turnstile or hCaptcha.
-- =====================================================================
