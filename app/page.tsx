import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Bell, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return redirect("/dashboard");
  }
  
  return (
    <div className="flex-1 flex flex-col gap-8 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-4 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-primary">Mobile</span>Tracker
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Real-time GPS tracking with geofencing and multi-device support
        </p>
        <div className="flex gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Key Features</h2>
          <p className="text-muted-foreground max-w-[600px] mx-auto">
            Everything you need to track and monitor locations in real-time
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>
                Monitor device locations with high accuracy GPS tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your devices in real-time with precise location data, including accuracy and battery level information.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Bell className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Geofence Alerts</CardTitle>
              <CardDescription>
                Create custom alerts for specific geographic areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up virtual boundaries and receive notifications when devices enter or exit these areas.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>History & Logs</CardTitle>
              <CardDescription>
                Access detailed location history and activity logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View historical location data with timestamps and export your data in various formats.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Your data is secure and private
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                End-to-end security with row-level security policies ensuring your data remains private.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-muted rounded-lg text-center px-4 my-8">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Start Tracking?</h2>
        <p className="text-muted-foreground max-w-[600px] mx-auto mb-8">
          Create an account now and start tracking your devices in minutes. No credit card required.
        </p>
        <Button asChild size="lg">
          <Link href="/register">Get Started for Free</Link>
        </Button>
      </section>
    </div>
  );
}
