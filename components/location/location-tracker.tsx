"use client";

// Import from client-side utils instead of server API
import { useCreateLocation } from "@/lib/hooks";
import { CreateLocationInput } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store";

interface LocationTrackerProps {
  interval?: number; // Tracking interval in milliseconds
  highAccuracy?: boolean;
}

export default function LocationTracker({
  interval = 30000, // Default to 30 seconds
  highAccuracy = true,
}: LocationTrackerProps) {
  // Use our global UI store for tracking state
  const { switchStates, setSwitchState } = useUIStore();
  const isTracking = switchStates['location-tracking'] || false;

  // Use refs for values that shouldn't trigger re-renders
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const createLocationMutation = useCreateLocation();
  const supabase = createClient();

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Get battery level if supported
  useEffect(() => {
    if (!isMounted) return;

    try {
      if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
        // @ts-ignore - getBattery is not in the standard navigator type
        navigator.getBattery().then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100));

          const handleLevelChange = () => {
            setBatteryLevel(Math.round(battery.level * 100));
          };

          battery.addEventListener('levelchange', handleLevelChange);

          return () => {
            battery.removeEventListener('levelchange', handleLevelChange);
          };
        }).catch((err: Error) => {
          console.error("Error getting battery:", err);
        });
      }
    } catch (error) {
      console.error("Error accessing battery API:", error);
    }
  }, [isMounted]);

  // Toggle tracking state
  const toggleTracking = useCallback((value: boolean) => {
    setSwitchState('location-tracking', value);
  }, [setSwitchState]);

  // Handle location tracking
  useEffect(() => {
    if (!isMounted) return;

    try {
      // Clear existing watch if tracking is turned off
      if (!isTracking) {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        return;
      }

      // Check if geolocation is supported
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        toggleTracking(false);
        return;
      }

      // Start tracking
      const handlePositionUpdate = async (position: GeolocationPosition) => {
        console.log("Position update received:", position.coords.latitude, position.coords.longitude);
        setCurrentPosition(position);
        setError(null);
        setLastUpdated(new Date());

        // Send location to server
        const locationData: CreateLocationInput = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          battery_level: batteryLevel !== null ? batteryLevel / 100 : undefined,
        };

        try {
          console.log("Sending location data to database:", locationData);
          const result = await createLocationMutation.mutateAsync(locationData);
          console.log("Location data saved successfully:", result);
        } catch (err) {
          console.error("Failed to send location data", err);
          setError("Failed to save location data to database");
        }
      };

      const handlePositionError = (err: GeolocationPositionError) => {
        setError(`Error: ${err.message}`);
        console.error("Geolocation error:", err);
      };

      // Get initial position immediately
      navigator.geolocation.getCurrentPosition(
        handlePositionUpdate,
        handlePositionError,
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Then set up the watch
      const id = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        {
          enableHighAccuracy: highAccuracy,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      watchIdRef.current = id;
      console.log("Location watch started with ID:", id);

      // Cleanup on unmount or when tracking is disabled
      return () => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          console.log("Location watch cleared");
        }
      };
    } catch (error) {
      console.error("Error setting up location tracking:", error);
      setError("Failed to initialize location tracking");
      toggleTracking(false);
    }
  }, [isTracking, highAccuracy, batteryLevel, createLocationMutation, isMounted, toggleTracking]);

  // Set up interval for periodic location updates
  useEffect(() => {
    if (!isMounted || !isTracking || !currentPosition) return;

    try {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const updateLocation = async () => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setCurrentPosition(position);
            setLastUpdated(new Date());

            // Send location to server
            const locationData: CreateLocationInput = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              battery_level: batteryLevel ?? undefined,
            };

            try {
              await createLocationMutation.mutateAsync(locationData);
            } catch (err) {
              console.error("Failed to send location data", err);
            }
          },
          (err) => {
            setError(`Error: ${err.message}`);
            console.error("Geolocation error:", err);
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      };

      // Set up the interval
      timerRef.current = setInterval(updateLocation, interval);

      // Cleanup function
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error setting up location interval:", error);
    }
  }, [isTracking, currentPosition, interval, highAccuracy, batteryLevel, createLocationMutation, isMounted]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Tracker</CardTitle>
        <CardDescription>
          Track your device location in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tracking-toggle">Tracking Status</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="location-tracking"
                checked={isTracking}
                onCheckedChange={toggleTracking}
              />
              <Badge variant={isTracking ? "default" : "outline"}>
                {isTracking ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {currentPosition && (
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Latitude</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPosition.coords.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Longitude</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPosition.coords.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Accuracy</p>
                  <p className="text-sm text-muted-foreground">
                    {currentPosition.coords.accuracy.toFixed(2)} meters
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Battery</p>
                  <p className="text-sm text-muted-foreground">
                    {batteryLevel !== null ? `${batteryLevel}%` : "Unknown"}
                  </p>
                </div>
              </div>
              {lastUpdated && (
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => toggleTracking(!isTracking)}
        >
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </Button>
        {/* {isTracking && (
          <Button
            variant="secondary"
            onClick={async () => {
              if (!isMounted || !currentPosition) return;
              
              try {
                const locationData: CreateLocationInput = {
                  latitude: currentPosition.coords.latitude,
                  longitude: currentPosition.coords.longitude,
                  accuracy: currentPosition.coords.accuracy,
                  battery_level: batteryLevel !== null ? batteryLevel / 100 : null, // Convert to decimal (0-1) for database
                };
                
                console.log("Manual update - sending location data:", locationData);
                const result = await createLocationMutation.mutateAsync(locationData);
                console.log("Manual update - location saved successfully:", result);
                setLastUpdated(new Date());
                setError(null); // Clear any previous errors
              } catch (err) {
                console.error("Failed to send location data", err);
                setError("Failed to save location data to database");
              }
            }}
          >
            Update Now
          </Button>
        )} */}
      </CardFooter>
    </Card>
  );
}
