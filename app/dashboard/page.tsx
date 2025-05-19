"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HistoryControls from "@/components/location/history-controls";
import HistoryDisplay from "@/components/location/history-display";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Dynamically import DashboardClient with SSR disabled
const DashboardClient = dynamic(
  () => import('./dashboard-client'),
  { 
    ssr: false,
    loading: () => <div>Loading dashboard...</div>
  }
);

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("map");
  const [user, setUser] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Group locations by date for the history view
  const locationsByDate = locations.reduce((acc, location) => {
    const date = new Date(location.recorded_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(location);
    return acc;
  }, {} as Record<string, any[]>);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);

      // Fetch locations
      const { data: locationsData } = await supabase
        .from("locations")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*")
        .eq("active", true);

      setLocations(locationsData || []);
      setAlerts(alertsData || []);
      setIsLoading(false);
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your location and manage tracking settings
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>
                View your current and historical locations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DashboardClient
                initialLocations={locations}
                initialAlerts={alerts}
                showTracker={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <HistoryDisplay
              locationsByDate={locationsByDate}
              onViewLocation={(location) => {
                setActiveTab("map");
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}