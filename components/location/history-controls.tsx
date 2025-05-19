// components/location/history-controls.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Trash2, Play, Pause, RotateCcw, Map, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CreateLocationInput } from "@/lib/types";
import { useCreateLocation } from "@/lib/hooks";
import { toast } from "sonner";

interface HistoryControlsProps {
  onClearHistory?: () => void;
}

export default function HistoryControls({ onClearHistory }: HistoryControlsProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [customLatitude, setCustomLatitude] = useState("");
  const [customLongitude, setCustomLongitude] = useState("");
  const [customAccuracy, setCustomAccuracy] = useState("10");
  const [isClearing, setIsClearing] = useState(false);
  
  const createLocationMutation = useCreateLocation();
  const supabase = createClient();
  
  // Clear location history
  const clearHistory = async () => {
    try {
      setIsClearing(true);
      
      const { error } = await supabase
        .from("locations")
        .delete()
        .neq("id", "placeholder"); // Delete all records
        
      if (error) {
        console.error("Error clearing history:", error);
        toast.error("Failed to clear location history");
        return;
      }
      
      toast.success("Location history cleared successfully");
      
      if (onClearHistory) {
        onClearHistory();
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear location history");
    } finally {
      setIsClearing(false);
    }
  };
  
  // Add a simulated location
  const addSimulatedLocation = async () => {
    try {
      // Validate inputs
      const lat = parseFloat(customLatitude);
      const lng = parseFloat(customLongitude);
      const acc = parseFloat(customAccuracy);
      
      if (isNaN(lat) || isNaN(lng)) {
        toast.error("Please enter valid latitude and longitude");
        return;
      }
      
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast.error("Latitude must be between -90 and 90, longitude between -180 and 180");
        return;
      }
      
      const locationData: CreateLocationInput = {
        latitude: lat,
        longitude: lng,
        accuracy: isNaN(acc) ? 10 : acc,
        battery_level: 0.85, // Simulated battery level
      };
      
      const result = await createLocationMutation.mutateAsync(locationData);
      
      if (result) {
        toast.success("Simulated location added successfully");
      }
    } catch (error) {
      console.error("Error adding simulated location:", error);
      toast.error("Failed to add simulated location");
    }
  };
  
  // Toggle simulation
  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    // Implementation for continuous simulation would go here
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" /> History Controls
        </CardTitle>
        <CardDescription>
          Manage and simulate location history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Add Custom Location</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input 
                id="latitude" 
                placeholder="e.g. 51.5074" 
                value={customLatitude}
                onChange={(e) => setCustomLatitude(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input 
                id="longitude" 
                placeholder="e.g. -0.1278" 
                value={customLongitude}
                onChange={(e) => setCustomLongitude(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accuracy">Accuracy (meters)</Label>
            <Input 
              id="accuracy" 
              placeholder="e.g. 10" 
              value={customAccuracy}
              onChange={(e) => setCustomAccuracy(e.target.value)}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={addSimulatedLocation}
            disabled={createLocationMutation.isPending}
          >
            <Map className="h-4 w-4 mr-2" />
            Add Location
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Simulation Controls</h3>
            <Switch
              id="simulation-toggle"
              checked={isSimulating}
              onCheckedChange={toggleSimulation}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="speed-slider">Simulation Speed</Label>
              <span className="text-xs text-muted-foreground">{simulationSpeed}x</span>
            </div>
            <Slider
              id="speed-slider"
              min={0.5}
              max={5}
              step={0.5}
              value={[simulationSpeed]}
              onValueChange={(value) => setSimulationSpeed(value[0])}
              disabled={!isSimulating}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={!isSimulating}
            >
              <Pause className="h-4 w-4 mr-1" /> Pause
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              disabled={isSimulating}
            >
              <Play className="h-4 w-4 mr-1" /> Start
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={clearHistory}
          disabled={isClearing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All History
        </Button>
      </CardFooter>
    </Card>
  );
}