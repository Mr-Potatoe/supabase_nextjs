<h1 align="center">Mobile Tracker Web App</h1>

<p align="center">
 Real-time GPS tracking with geofencing and multi-device support
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#database-schema"><strong>Database Schema</strong></a> ·
  <a href="#setup-and-installation"><strong>Setup and Installation</strong></a> ·
  <a href="#usage"><strong>Usage</strong></a>
</p>
<br/>

## Features

- **Real-time Location Tracking**
  - High-accuracy GPS tracking using navigator.geolocation
  - Battery level monitoring
  - Configurable tracking intervals
  - Real-time updates via Supabase Realtime

- **Geofencing & Smart Alerts**
  - Create custom geofence boundaries
  - Set radius and location for each alert
  - Activate/deactivate alerts as needed
  - Receive notifications when devices enter or exit geofences

- **Multi-Device Support**
  - Track multiple devices under one account
  - View all device locations on a single map
  - Individual device history and settings

- **Activity History & Logs**
  - Detailed location history with timestamps
  - Activity logs for all actions
  - Filter history by date and device
  - Export data in various formats

- **Privacy & Security**
  - End-to-end security
  - Row-Level Security policies in Supabase
  - User-controlled tracking settings
  - Secure authentication

## Tech Stack

- **Frontend**
  - [Next.js](https://nextjs.org) with App Router
  - [TanStack Query](https://tanstack.com/query) for data fetching and state management
  - [shadcn/ui](https://ui.shadcn.com/) for UI components
  - [TailwindCSS](https://tailwindcss.com) for styling
  - [Leaflet](https://leafletjs.com/) for interactive maps
  - [Zod](https://zod.dev/) for validation
  - PWA support with [next-pwa](https://www.npmjs.com/package/next-pwa)

- **Backend**
  - [Supabase](https://supabase.com) for authentication, database, and realtime updates
  - PostgreSQL database
  - Row-Level Security policies
  - Supabase Auth with SSR cookie-based auth

## Database Schema

The application uses the following database tables in Supabase:

```sql
-- Users table (linked to Supabase's built-in auth.users)
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
```

## Setup and Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/mobile-tracker.git
   cd mobile-tracker
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Create a Supabase project at [https://supabase.com](https://supabase.com)

4. Run the SQL migration in the Supabase SQL editor to create the database schema
   - Copy the contents of `supabase/migrations/20250519_mobile_tracker_schema.sql`
   - Paste and run in the Supabase SQL editor

5. Set up environment variables
   - Rename `.env.example` to `.env.local`
   - Update with your Supabase project credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

6. Run the development server

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Authentication

- Create an account or sign in using the login/register pages
- Authentication is handled by Supabase Auth with secure cookie-based sessions

### Dashboard

- The main dashboard displays a map with your current and historical locations
- Toggle real-time tracking to start sending your location data
- View your location history organized by date

### Geofence Alerts

- Create alerts by setting a title, description, location, and radius
- Activate or deactivate alerts as needed
- Receive notifications when entering or exiting geofenced areas

### Settings

- Update your profile information
- Configure tracking settings (accuracy, intervals, etc.)
- View your activity logs
- Manage data privacy and export options

### PWA Support

- Install the app on your mobile device as a Progressive Web App
- Access tracking features even with limited connectivity
- Receive push notifications for alerts (when supported)

## Deployment

This application can be easily deployed to Vercel or any other hosting platform that supports Next.js applications.

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy!
