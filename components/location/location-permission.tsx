"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { MapPin, AlertTriangle } from "lucide-react";
import { createLocation } from "@/lib/api";
import { useUIStore, isBrowser } from "@/lib/store";

export function LocationPermission() {
  // Use our global UI store for state management
  const { locationPermissionAsked, setLocationPermissionAsked } = useUIStore();

  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Error checking auth:", error);
      }
    };

    checkAuth();
  }, [supabase, isMounted]);

  // Show the dialog if user is authenticated and we haven't asked before
  useEffect(() => {
    if (isMounted && isAuthenticated && !locationPermissionAsked) {
      setIsOpen(true);
    }
  }, [isAuthenticated, locationPermissionAsked, isMounted]);

  // Check current permission status
  useEffect(() => {
    if (!isMounted) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          setPermissionState(result.state);

          // Listen for changes to permission state
          result.onchange = () => {
            setPermissionState(result.state);

            // If permission is granted, get location and close dialog
            if (result.state === 'granted') {
              getCurrentPosition();
              setIsOpen(false);
            }
          };
        }).catch(error => {
          console.error("Error querying permissions:", error);
        });
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    }
  }, [isMounted]);

  // Get current position and save to database
  const getCurrentPosition = () => {
    if (!isMounted) return;

    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Get battery level if available
              let batteryLevel = null;
              if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
                try {
                  // @ts-ignore - getBattery is not in the standard navigator type
                  const battery = await navigator.getBattery();
                  batteryLevel = Math.round(battery.level * 100);
                } catch (batteryError) {
                  console.error("Error getting battery:", batteryError);
                }
              }

              // Save location to database
              const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                battery_level: batteryLevel ?? undefined,
              };

              await createLocation(locationData);

              // Mark that we've asked for permission
              setLocationPermissionAsked(true);

              // Also save to localStorage for persistence
              try {
                if (isBrowser()) {
                  localStorage.setItem("locationPermissionAsked", "true");
                }
              } catch (storageError) {
                console.error("Error setting localStorage:", storageError);
              }

              // Close the dialog
              setIsOpen(false);
            } catch (error) {
              console.error("Error saving location:", error);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            // Still mark that we've asked
            setLocationPermissionAsked(true);

            // Also save to localStorage for persistence
            try {
              if (isBrowser()) {
                localStorage.setItem("locationPermissionAsked", "true");
              }
            } catch (storageError) {
              console.error("Error setting localStorage:", storageError);
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.error("Error accessing geolocation:", error);
    }
  };

  // Handle request permission button click
  const handleRequestPermission = () => {
    getCurrentPosition();
  };

  // Handle skip button click
  const handleSkip = () => {
    // Update state in our store
    setLocationPermissionAsked(true);

    // Also save to localStorage for persistence
    try {
      if (isBrowser()) {
        localStorage.setItem("locationPermissionAsked", "true");
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error setting localStorage:", error);
      setIsOpen(false);
    }
  };

  // Don't render anything until mounted to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Enable Location Services
          </DialogTitle>
          <DialogDescription>
            MobileTracker needs your location to provide real-time tracking services.
            Your location data is private and only accessible to you.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
            <div className="mt-0.5 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Why we need your location</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Location access allows us to track your device, provide geofencing alerts,
                and show your position on the map.
              </p>
            </div>
          </div>

          {permissionState === 'denied' && (
            <div className="flex items-start gap-4 p-4 bg-destructive/10 text-destructive rounded-lg">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Location access denied</h4>
                <p className="text-sm mt-1">
                  You've previously denied location access. Please enable location in your browser settings to use all features.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="sm:w-auto w-full">
            Skip for now
          </Button>
          <Button onClick={handleRequestPermission} className="sm:w-auto w-full">
            Allow location access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
