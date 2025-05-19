"use client";

import { Location } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { divIcon, Icon, LatLngBounds, LatLng } from "leaflet";
import { Alert } from "@/lib/types";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";
import { LocateFixed } from "lucide-react";
import { Trash2 } from "lucide-react";

// Custom icons for different marker types
const defaultIcon = new Icon({
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const deviceIcon = new Icon({
  iconUrl: "/images/device-marker.svg",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const currentLocationIcon = new Icon({
  iconUrl: "/images/current-location.svg",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Create a pulse effect for current location
const createPulseIcon = (radius: number) => {
  return divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      position: absolute;
      border-radius: 50%;
      height: ${radius * 2}px;
      width: ${radius * 2}px;
      transform: translate(-50%, -50%);
      background-color: rgba(59, 130, 246, 0.2);
      border: 2px solid rgba(59, 130, 246, 0.5);
      animation: pulse 1.5s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
    </style>`,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius]
  });
};

interface MapViewProps {
  locations: Location[];
  alerts?: Alert[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
  showPath?: boolean;
  followLastLocation?: boolean;
  showCurrentLocation?: boolean;
  currentPosition?: GeolocationPosition | null;
  onClearHistory?: () => void;
  showHistory?: boolean;
  onToggleHistory?: (show: boolean) => void;
}

// Component to handle map view updates
function MapUpdater({ center, zoom }: { center?: [number, number]; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
}

// Component to fit bounds when locations change
function BoundsUpdater({ locations, currentPosition }: { locations: Location[], currentPosition?: GeolocationPosition | null }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0 && !currentPosition) return;

    // Create bounds object
    const bounds = new LatLngBounds([]);

    // Add all locations to bounds
    locations.forEach(location => {
      bounds.extend(new LatLng(location.latitude, location.longitude));
    });

    // Add current position to bounds if available
    if (currentPosition) {
      bounds.extend(new LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude));
    }

    // Only fit bounds if we have points
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, currentPosition, map]);

  return null;
}

export default function MapView({
  locations,
  alerts = [],
  center,
  zoom = 13,
  height = "600px",
  width = "100%",
  showPath = false,
  followLastLocation = true,
  showCurrentLocation = true,
  currentPosition = null,
  onClearHistory,
  showHistory = false,
  onToggleHistory,
}: MapViewProps) {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(center);
  const [showHistoryLocal, setShowHistoryLocal] = useState(showHistory);
  const [showCurrentLocationLocal, setShowCurrentLocationLocal] = useState(showCurrentLocation);

  // Sync with parent component
  useEffect(() => {
    setShowHistoryLocal(showHistory);
  }, [showHistory]);

  // Toggle history visibility
  const handleToggleHistory = () => {
    const newValue = !showHistoryLocal;
    setShowHistoryLocal(newValue);
    if (onToggleHistory) {
      onToggleHistory(newValue);
    }
  };

  // Toggle current location visibility
  const handleToggleCurrentLocation = () => {
    setShowCurrentLocationLocal(!showCurrentLocationLocal);
  };

  // Set map center to the last location if followLastLocation is true
  useEffect(() => {
    if (followLastLocation && locations.length > 0) {
      const lastLocation = locations[0]; // Assuming locations are ordered by recorded_at desc
      setMapCenter([lastLocation.latitude, lastLocation.longitude]);
    }
  }, [locations, followLastLocation]);

  // Default center if no locations or center provided
  const defaultCenter: [number, number] = [51.505, -0.09];

  // Add custom CSS to fix Leaflet z-index issues
  useEffect(() => {
    // Add custom CSS to fix z-index issues
    const style = document.createElement('style');
    style.textContent = `
      .leaflet-pane { z-index: 10 !important; }
      .leaflet-top, .leaflet-bottom { z-index: 95 !important; }
      .leaflet-popup { z-index: 16 !important; }
      .leaflet-control { z-index: 98 !important; }
      .leaflet-tooltip { z-index: 97 !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ height, width, position: 'relative' }}>
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleToggleHistory}
          className="bg-background/80 backdrop-blur-sm"
          title={showHistoryLocal ? 'Hide History' : 'Show History'}
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleToggleCurrentLocation}
          className="bg-background/80 backdrop-blur-sm"
          title={showCurrentLocationLocal ? 'Hide Current Location' : 'Show Current Location'}
        >
          <LocateFixed className="h-4 w-4" />
        </Button>
        {onClearHistory && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onClearHistory}
            className="bg-background/80 backdrop-blur-sm text-destructive"
            title="Clear History"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <MapContainer
        center={mapCenter || defaultCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update map view when center changes */}
        <MapUpdater center={mapCenter} zoom={zoom} />

        {/* Fit map to show all locations */}
        <BoundsUpdater locations={locations} currentPosition={currentPosition} />

        {/* Display current location if available and enabled */}
        {showCurrentLocationLocal && currentPosition && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[currentPosition.coords.latitude, currentPosition.coords.longitude]}
              radius={currentPosition.coords.accuracy}
              pathOptions={{ color: '#3B82F6', fillColor: '#93C5FD', fillOpacity: 0.2, weight: 1 }}
            />

            {/* Pulse effect */}
            <Marker
              position={[currentPosition.coords.latitude, currentPosition.coords.longitude]}
              icon={createPulseIcon(30)}
              zIndexOffset={-1000}
            />

            {/* Current location marker */}
            <Marker
              position={[currentPosition.coords.latitude, currentPosition.coords.longitude]}
              icon={currentLocationIcon}
              zIndexOffset={1000}
            >
             <Popup>
               <div className="text-sm">
                 <p className="font-semibold">Current Location</p>
                 <p>Accuracy: {currentPosition.coords.accuracy.toFixed(2)}m</p>
                 <p>Updated: {new Date().toLocaleTimeString()}</p>
               </div>
             </Popup>
              <Tooltip permanent direction="top" offset={[0, -10]}>You are here</Tooltip>
            </Marker>
          </>
        )}

        {/* Display location history markers if enabled */}
        {showHistoryLocal && locations.map((location, index) => {
          const isLatest = index === 0;
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={isLatest ? deviceIcon : defaultIcon}
              zIndexOffset={isLatest ? 500 : 0}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{isLatest ? 'Device Location' : 'Location History'}</p>
                  <p>Accuracy: {location.accuracy ? `${location.accuracy.toFixed(2)}m` : "Unknown"}</p>
                  <p>Battery: {location.battery_level ? `${location.battery_level}%` : "Unknown"}</p>
                  <p>Time: {format(new Date(location.recorded_at), 'PPpp')}</p>
                </div>
              </Popup>
              {isLatest && (
                <Tooltip permanent direction="top" offset={[0, -40]}>Your device</Tooltip>
              )}
            </Marker>
          );
        })}

        {/* Display geofence alerts */}
        {showHistoryLocal && alerts
          .filter((alert) => alert.latitude && alert.longitude && alert.radius)
          .map((alert) => (
            <Circle
              key={alert.id}
              center={[alert.latitude!, alert.longitude!]}
              radius={alert.radius!}
              pathOptions={{
                color: alert.active ? "#3B82F6" : "#9CA3AF",
                fillColor: alert.active ? "#93C5FD" : "#E5E7EB",
                fillOpacity: 0.3,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{alert.title}</p>
                  {alert.description && <p>{alert.description}</p>}
                  <p>Radius: {alert.radius}m</p>
                  <p>Status: {alert.active ? "Active" : "Inactive"}</p>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>
    </div>
  );
}
