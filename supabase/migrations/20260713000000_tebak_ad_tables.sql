-- =============================================================================
-- Migration: Tabel Ad Banner untuk monetisasi game Tebak Aku (Fase 3)
--
-- Tabel:
--   1. ad_banners     — data banner iklan
--   2. ad_impressions — log tayangan (impresi)
--   3. ad_clicks      — log klik
--
-- RLS: baca banner aktif (public), tulis impresi/klik (auth), kelola banner (admin)
-- =============================================================================

-- 1. Tabel ad_banners ----------------------------------------------------------
create table if not exists public.ad_banners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image_url   text not null,
  click_url   text,
  location    text not null check (location in ('match_intro', 'panduan', 'jeda')),
  is_active   boolean not null default true,
  start_date  timestamptz,
  end_date    timestamptz,
  created_at  timestamptz not null default now()
);

comment on table public.ad_banners is 'Banner iklan yang tampil di game Tebak Aku (MatchIntro, Panduan, Jeda)';

-- 2. Tabel ad_impressions ------------------------------------------------------
create table if not exists public.ad_impressions (
  id          uuid primary key default gen_random_uuid(),
  banner_id   uuid not null references public.ad_banners(id) on delete cascade,
  session_id  text not null,
  user_id     uuid,
  created_at  timestamptz not null default now()
);

comment on table public.ad_impressions is 'Log setiap kali banner tampil ke pengguna';

-- 3. Tabel ad_clicks -----------------------------------------------------------
create table if not exists public.ad_clicks (
  id          uuid primary key default gen_random_uuid(),
  banner_id   uuid not null references public.ad_banners(id) on delete cascade,
  session_id  text not null,
  user_id     uuid,
  created_at  timestamptz not null default now()
);

comment on table public.ad_clicks is 'Log setiap kali banner diklik pengguna';

-- =============================================================================
-- Indeks
-- =============================================================================

-- Prevent duplicate impression counting (same user × banner × session)
create unique index if not exists idx_ad_impressions_dedup
  on public.ad_impressions (banner_id, session_id, user_id);

create index if not exists idx_ad_impressions_banner
  on public.ad_impressions (banner_id);

create index if not exists idx_ad_clicks_banner
  on public.ad_clicks (banner_id);

-- =============================================================================
-- RLS
-- =============================================================================

alter table public.ad_banners enable row level security;
alter table public.ad_impressions enable row level security;
alter table public.ad_clicks enable row level security;

-- Policy: siapa saja bisa baca banner AKTIF (untuk display di game)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_banners' and policyname = 'Anyone can read active banners'
  ) then
    create policy "Anyone can read active banners" on public.ad_banners
      for select
      using (is_active = true
        and (start_date is null or start_date <= now())
        and (end_date is null or end_date >= now()));
  end if;
end $$;

-- Policy: admin / superadmin / redaksi bisa kelola banner (CRUD)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_banners' and policyname = 'Admin can manage banners'
  ) then
    create policy "Admin can manage banners" on public.ad_banners
      for all
      using (auth.uid() is not null and exists (
        select 1 from public.users
        where id = auth.uid() and role in ('admin', 'superadmin', 'redaksi')
      ));
  end if;
end $$;

-- Policy: user terautentikasi bisa INSERT impresi
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_impressions' and policyname = 'Auth users can insert impressions'
  ) then
    create policy "Auth users can insert impressions" on public.ad_impressions
      for insert
      with check (auth.uid() is not null);
  end if;
end $$;

-- Policy: admin bisa SELECT semua impresi (untuk statistik)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_impressions' and policyname = 'Admin can read impressions'
  ) then
    create policy "Admin can read impressions" on public.ad_impressions
      for select
      using (auth.uid() is not null and exists (
        select 1 from public.users
        where id = auth.uid() and role in ('admin', 'superadmin', 'redaksi')
      ));
  end if;
end $$;

-- Policy: user terautentikasi bisa INSERT klik
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_clicks' and policyname = 'Auth users can insert clicks'
  ) then
    create policy "Auth users can insert clicks" on public.ad_clicks
      for insert
      with check (auth.uid() is not null);
  end if;
end $$;

-- Policy: admin bisa SELECT semua klik (untuk statistik)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_clicks' and policyname = 'Admin can read clicks'
  ) then
    create policy "Admin can read clicks" on public.ad_clicks
      for select
      using (auth.uid() is not null and exists (
        select 1 from public.users
        where id = auth.uid() and role in ('admin', 'superadmin', 'redaksi')
      ));
  end if;
end $$;
