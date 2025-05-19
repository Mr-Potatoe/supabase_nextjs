import { createClient } from "@/utils/supabase/server";
import { 
  Alert, 
  CreateAlertInput, 
  CreateLocationInput, 
  Location, 
  Log, 
  Profile, 
  UpdateProfileInput 
} from "./types";

// Profile API
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.user.id)
    .single();
    
  return data;
}

export async function updateProfile(profile: UpdateProfileInput): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", user.user.id)
    .select()
    .single();
    
  return data;
}

// Location API
export async function getLocations(limit = 100, offset = 0): Promise<Location[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("locations")
    .select("*")
    .order("recorded_at", { ascending: false })
    .range(offset, offset + limit - 1);
    
  return data || [];
}

export async function createLocation(location: CreateLocationInput): Promise<Location | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data } = await supabase
    .from("locations")
    .insert([{ ...location, user_id: user.user.id }])
    .select()
    .single();
    
  return data;
}

export async function getLocationsByDateRange(startDate: Date, endDate: Date): Promise<Location[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("locations")
    .select("*")
    .gte("recorded_at", startDate.toISOString())
    .lte("recorded_at", endDate.toISOString())
    .order("recorded_at", { ascending: true });
    
  return data || [];
}

// Alert API
export async function getAlerts(): Promise<Alert[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false });
    
  return data || [];
}

export async function getAlert(id: string): Promise<Alert | null> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("alerts")
    .select("*")
    .eq("id", id)
    .single();
    
  return data;
}

export async function createAlert(alert: CreateAlertInput): Promise<Alert | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data } = await supabase
    .from("alerts")
    .insert([{ ...alert, user_id: user.user.id }])
    .select()
    .single();
    
  return data;
}

export async function updateAlert(id: string, alert: Partial<CreateAlertInput>): Promise<Alert | null> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("alerts")
    .update(alert)
    .eq("id", id)
    .select()
    .single();
    
  return data;
}

export async function deleteAlert(id: string): Promise<void> {
  const supabase = await createClient();
  
  await supabase
    .from("alerts")
    .delete()
    .eq("id", id);
}

// Logs API
export async function getLogs(limit = 50): Promise<Log[]> {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
    
  return data || [];
}

export async function createLog(action: string, metadata: Record<string, any> = {}): Promise<Log | null> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) return null;
  
  const { data } = await supabase
    .from("logs")
    .insert([{ 
      user_id: user.user.id,
      action,
      metadata
    }])
    .select()
    .single();
    
  return data;
}

// Check if a device is within a geofence alert
export function isWithinGeofence(location: Pick<Location, 'latitude' | 'longitude'>, alert: Alert): boolean {
  if (!alert.latitude || !alert.longitude || !alert.radius) return false;
  
  // Calculate distance between two points using Haversine formula
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (location.latitude * Math.PI) / 180;
  const φ2 = (alert.latitude * Math.PI) / 180;
  const Δφ = ((alert.latitude - location.latitude) * Math.PI) / 180;
  const Δλ = ((alert.longitude - location.longitude) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= alert.radius;
}
