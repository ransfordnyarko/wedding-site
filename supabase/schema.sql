-- "Nine years, one thread": guest uploads.
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query).

-- ── Table ────────────────────────────────────────────────────────────────
create table if not exists public.guest_uploads (
  id          uuid primary key default gen_random_uuid(),
  upload_id   uuid unique not null,            -- from the signed upload session; blocks replays
  kind        text not null check (kind in ('wedding', 'memory')),
  year        text null,
  caption     text null check (char_length(caption) <= 280),
  guest_name  text not null check (char_length(guest_name) between 1 and 80),
  files       jsonb not null,                  -- [{ path, mime, width, height, poster? }]
  status      text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at  timestamptz not null default now(),
  constraint memory_needs_year check (kind <> 'memory' or year is not null)
);
create index if not exists guest_uploads_public_idx
  on public.guest_uploads (created_at) where kind = 'memory' and status = 'visible';

-- Per-IP rate limiting (hashed IPs only). Never readable by the browser.
create table if not exists public.upload_attempts (
  id          bigint generated always as identity primary key,
  ip_hash     text not null,
  created_at  timestamptz not null default now()
);
create index if not exists upload_attempts_ip_idx on public.upload_attempts (ip_hash, created_at);

-- ── Row-level security ──────────────────────────────────────────────────
-- The browser (anon key) can only READ visible memories. All writes go
-- through /api with the service-role key, which bypasses RLS.
-- Wedding-day rows are never readable by anon.
alter table public.guest_uploads  enable row level security;
alter table public.upload_attempts enable row level security;

drop policy if exists "public reads visible memories" on public.guest_uploads;
create policy "public reads visible memories" on public.guest_uploads
  for select to anon, authenticated
  using (kind = 'memory' and status = 'visible');

-- ── Realtime ────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.guest_uploads;

-- ── Storage buckets ─────────────────────────────────────────────────────
-- vault: private, wedding-day originals. No public read; writes only via
--        signed upload URLs issued by /api/uploads/sign.
-- memories: public read, earlier-year files (already EXIF-stripped in the browser).
-- Size limits: lower these to your plan's cap (Free = 50 MB per file).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vault',    'vault',    false, 209715200, array['image/*', 'video/*']),
  ('memories', 'memories', true,  209715200, array['image/jpeg', 'image/png', 'video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
-- No storage.objects policies are added on purpose: anon can't list or
-- write either bucket directly. Public bucket files are still served by URL.
