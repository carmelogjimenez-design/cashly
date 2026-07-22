-- ============================================================
-- Cashly · Migración Fases 1–3
-- Tablas: perfil_financiero, cuentas, movimientos, prestamos,
--         objetivos, presupuestos
-- Seguridad: RLS activada (cada usuario solo ve y edita lo suyo)
-- Puedes re-ejecutar este script sin miedo: usa IF NOT EXISTS
-- y recrea las políticas.
-- ============================================================

-- PERFIL FINANCIERO (1 fila por usuario)
create table if not exists public.perfil_financiero (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ingreso_mensual numeric(12,2) default 0,
  tipo_ingreso text default 'fijo',            -- 'fijo' | 'variable'
  situacion text default 'solo',               -- 'solo' | 'pareja' | 'familia'
  num_hijos int default 0,
  objetivo_principal text,
  fondo_objetivo numeric(12,2),
  creado_en timestamptz default now()
);

-- CUENTAS
create table if not exists public.cuentas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo text not null default 'corriente',      -- corriente|ahorro|conjunta|efectivo|inversion
  saldo numeric(12,2) not null default 0,
  creado_en timestamptz default now()
);
create index if not exists idx_cuentas_user on public.cuentas(user_id);

-- MOVIMIENTOS
create table if not exists public.movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cuenta_id uuid references public.cuentas(id) on delete set null,
  fecha date not null default current_date,
  comercio text not null,
  importe numeric(12,2) not null,              -- siempre positivo
  tipo text not null default 'gasto',          -- 'ingreso' | 'gasto'
  categoria text not null default 'Imprevistos',
  recurrente boolean not null default false,
  prescindible boolean not null default false,
  creado_en timestamptz default now()
);
create index if not exists idx_mov_user on public.movimientos(user_id);
create index if not exists idx_mov_fecha on public.movimientos(user_id, fecha desc);

-- PRESTAMOS / DEUDAS
create table if not exists public.prestamos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo text not null default 'personal',       -- hipoteca|coche|personal|tarjeta|otro
  saldo_pendiente numeric(12,2) not null default 0,
  cuota_mensual numeric(12,2) not null default 0,
  tin numeric(5,2) not null default 0,          -- % anual
  fecha_fin date,
  comision_amortizacion numeric(5,2) default 0, -- %
  creado_en timestamptz default now()
);
create index if not exists idx_prestamos_user on public.prestamos(user_id);

-- OBJETIVOS
create table if not exists public.objetivos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo text default 'otros',
  cantidad_objetivo numeric(12,2) not null default 0,
  cantidad_actual numeric(12,2) not null default 0,
  fecha_objetivo date,
  creado_en timestamptz default now()
);
create index if not exists idx_objetivos_user on public.objetivos(user_id);

-- PRESUPUESTOS (límites por categoría; opcional)
create table if not exists public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria text not null,
  limite_mensual numeric(12,2) not null default 0,
  creado_en timestamptz default now(),
  unique (user_id, categoria)
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.perfil_financiero enable row level security;
alter table public.cuentas          enable row level security;
alter table public.movimientos      enable row level security;
alter table public.prestamos        enable row level security;
alter table public.objetivos        enable row level security;
alter table public.presupuestos     enable row level security;

drop policy if exists "own_perfil" on public.perfil_financiero;
create policy "own_perfil" on public.perfil_financiero
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_cuentas" on public.cuentas;
create policy "own_cuentas" on public.cuentas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_movimientos" on public.movimientos;
create policy "own_movimientos" on public.movimientos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_prestamos" on public.prestamos;
create policy "own_prestamos" on public.prestamos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_objetivos" on public.objetivos;
create policy "own_objetivos" on public.objetivos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_presupuestos" on public.presupuestos;
create policy "own_presupuestos" on public.presupuestos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Listo. Cashly ya tiene su base de datos.
