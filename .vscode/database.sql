-- Users table (you can use Supabase's built-in auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default now()
);

-- Location tracking table
create table locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  battery_level numeric,
  recorded_at timestamp with time zone default now()
);

-- Smart alerts / Geofencing table
create table alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  latitude double precision,
  longitude double precision,
  radius double precision, -- in meters
  created_at timestamp with time zone default now(),
  active boolean default true
);

-- Optional: Track access/activity
create table logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);
