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

-- Row Level Security Policies
-- Profiles: Users can only read/write their own profiles
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Locations: Users can only read/write their own locations
alter table locations enable row level security;

create policy "Users can view their own locations"
  on locations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own locations"
  on locations for insert
  with check (auth.uid() = user_id);

-- Alerts: Users can only read/write their own alerts
alter table alerts enable row level security;

create policy "Users can view their own alerts"
  on alerts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own alerts"
  on alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own alerts"
  on alerts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own alerts"
  on alerts for delete
  using (auth.uid() = user_id);

-- Logs: Users can only read their own logs
alter table logs enable row level security;

create policy "Users can view their own logs"
  on logs for select
  using (auth.uid() = user_id);

-- Create function to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
