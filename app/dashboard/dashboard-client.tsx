"use client";

import { Alert, Location } from "@/lib/types";
import { useAlerts, useLocations } from "@/lib/hooks";
import { useEffect, useState, useCallback } from "react";
import MapView from "@/components/map/map-view";
import LocationTracker from "@/components/location/location-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { useUIStore } from "@/lib/store";
import { Layers } from "lucide-react";

interface DashboardClientProps {
  initialLocations: Location[];
  initialAlerts: Alert[];
  showTracker?: boolean;
  showHistory?: boolean;
}

export default function DashboardClient({
  initialLocations,
  initialAlerts,
  showTracker = false,
  showHistory = false,
}: DashboardClientProps) {
  // State for locations and alerts
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [isMounted, setIsMounted] = useState(false);
   // Add a state to track if we're in the browser
   const [isClient, setIsClient] = useState(false);

  
  // Get tracking state from store
  const { switchStates } = useUIStore();
  const isTracking = switchStates['location-tracking'] || false;
  
  // Query hooks for data fetching
  const locationsQuery = useLocations();
  const alertsQuery = useAlerts();
  
  // Supabase client for realtime subscriptions
  const supabase = createClient();
  

    // Set isMounted and isClient to true when component mounts
    useEffect(() => {
      setIsMounted(true);
      setIsClient(true);
      return () => setIsMounted(false);
    }, []);
  
  // Update state when queries complete
  useEffect(() => {
    if (locationsQuery.data) {
      setLocations(locationsQuery.data);
    }
  }, [locationsQuery.data]);
  
  useEffect(() => {
    if (alertsQuery.data) {
      setAlerts(alertsQuery.data);
    }
  }, [alertsQuery.data]);
  
  // Set up realtime subscription for location updates
  useEffect(() => {
    const channel = supabase
      .channel('location_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'locations',
        },
        (payload) => {
          // Add new location to state
          const newLocation = payload.new as Location;
          setLocations((prev) => [newLocation, ...prev]);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);
  
  // Get current position for the map
  useEffect(() => {
    if (!isMounted || !isClient) return;
    
    // Don't track if not enabled
    if (!isTracking) return;
    
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentPosition(position);
          },
          (error) => {
            console.error('Error getting current position:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        
        // Watch position changes
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentPosition(position);
          },
          (error) => {
            console.error('Error watching position:', error);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
        
        return () => {
          navigator.geolocation.clearWatch(watchId);
        };
      }
    } catch (error) {
      console.error('Error setting up geolocation:', error);
    }
  }, [isMounted, isTracking, isClient]);
  
  // Group locations by date for history view
  const locationsByDate = locations.reduce<Record<string, Location[]>>((acc, location) => {
    const date = format(new Date(location.recorded_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(location);
    return acc;
  }, {});
  
  return (
    <div className="space-y-6">
      {/* Map View */}
      {!showHistory && (
        <div className="rounded-lg overflow-hidden">
          <MapView 
            locations={locations} 
            alerts={alerts}
            height="500px"
            width="100%"
            followLastLocation
            currentPosition={currentPosition}
            showCurrentLocation={true}
          />
        </div>
      )}
      
      {/* Location Tracker */}
      {showTracker && (
        <div className="grid gap-4">
          <LocationTracker interval={30000} highAccuracy={true} />
          
          <Card>
            <CardHeader>
              <CardTitle>Tracking Options</CardTitle>
              <CardDescription>
                Configure additional tracking settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Tracking Interval</h3>
                  <p className="text-sm text-muted-foreground">
                    Current interval: 30 seconds
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    10s
                  </Button>
                  <Button variant="default" size="sm">
                    30s
                  </Button>
                  <Button variant="outline" size="sm">
                    1m
                  </Button>
                  <Button variant="outline" size="sm">
                    5m
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Location History */}
      {showHistory && (
        <div className="space-y-6">
          {Object.entries(locationsByDate).map(([date, dateLocations]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                <CardDescription>
                  {dateLocations.length} location points
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dateLocations.slice(0, 5).map((location) => (
                    <div 
                      key={location.id} 
                      className="p-3 bg-muted rounded-md flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(location.recorded_at), 'h:mm a')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                  
                  {dateLocations.length > 5 && (
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      Show {dateLocations.length - 5} more
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {Object.keys(locationsByDate).length === 0 && (
            <div className="text-center p-12">
              <p className="text-muted-foreground">No location history found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
