import { createClient } from "@/utils/supabase/client";
import { 
  Alert, 
  CreateAlertInput, 
  CreateLocationInput, 
  Location, 
  Log, 
  Profile, 
  UpdateProfileInput 
} from "./types";

// Client-side location API
export async function createLocationClient(location: CreateLocationInput): Promise<Location | null> {
  try {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error("No authenticated user found");
      return null;
    }
    
    console.log("Creating location with user ID:", user.user.id);
    
    const { data, error } = await supabase
      .from("locations")
      .insert([{ 
        ...location, 
        user_id: user.user.id,
        // Ensure we have a recorded_at timestamp
        recorded_at: new Date().toISOString()
      }])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating location:", error);
      throw error;
    }
      
    return data;
  } catch (error) {
    console.error("Error in createLocationClient:", error);
    throw error;
  }
}

// Get locations client-side
export async function getLocationsClient(limit = 100, offset = 0): Promise<Location[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("recorded_at", { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error("Error fetching locations:", error);
      throw error;
    }
      
    return data || [];
  } catch (error) {
    console.error("Error in getLocationsClient:", error);
    return [];
  }
}
