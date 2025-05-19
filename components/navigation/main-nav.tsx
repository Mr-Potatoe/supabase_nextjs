"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { MapPin, Menu, User, LogOut, Map, Bell, Settings } from "lucide-react";

export function MainNav() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("");
  const pathname = usePathname();
  const supabase = createClient();

// Remove the first useEffect and modify the second one to handle both cases
useEffect(() => {
  // Initial auth check
  const checkAuth = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await handleAuthChange(user);
    setIsLoading(false);
  };

  // Handle auth state changes
  const handleAuthChange = async (user: any) => {
    if (user) {
      setIsAuthenticated(true);
      // Update user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
        
      if (profile?.full_name) {
        setUserName(profile.full_name);
      } else {
        setUserName(user.email?.split('@')[0] || "User");
      }
    } else {
      setIsAuthenticated(false);
      setUserName("");
    }
  };

  // Initial check
  checkAuth();

  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      await handleAuthChange(session?.user || null);
    }
  );

  // Cleanup
  return () => {
    subscription?.unsubscribe();
  };
}, [supabase]);

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  // Check if the path is in auth pages
  const isAuthPage = pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.includes("/forgot-password");

  // If on auth page, show minimal nav
  if (isAuthPage) {
    return (
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
          <Link href={"/"} className="text-lg font-semibold">
            <span className="text-primary">Mobile</span>Tracker
          </Link>
          <ThemeSwitcher />
        </div>
      </nav>
    );
  }

  // Main navigation for authenticated and non-authenticated users
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5">
        <div className="flex items-center gap-2">
          <Link href={"/"} className="text-lg font-semibold flex items-center">
            <MapPin className="h-5 w-5 text-primary mr-1" />
            <span className="text-primary">Mobile</span>Tracker
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className={`hover:text-primary transition-colors ${pathname === '/dashboard' ? 'text-primary font-medium' : ''}`}
                >
                  Dashboard
                </Link>
                {/* <Link
                  href="/alerts"
                  className={`hover:text-primary transition-colors ${pathname === '/alerts' ? 'text-primary font-medium' : ''}`}
                >
                  Alerts
                </Link>
                <Link
                  href="/settings"
                  className={`hover:text-primary transition-colors ${pathname === '/settings' ? 'text-primary font-medium' : ''}`}
                >
                  Settings
                </Link> */}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 flex items-center gap-2 rounded-full">
                    <User className="h-4 w-4" />
                    <span>{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <ThemeSwitcher />
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Create account</Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-6">
                {isAuthenticated ? (
                  <>
                    <div className="flex flex-col space-y-3 border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-medium">{userName}</span>
                      </div>
                      <Link
                        href="/dashboard"
                        className={`flex items-center gap-2 hover:text-primary transition-colors ${pathname === '/dashboard' ? 'text-primary font-medium' : ''}`}
                      >
                        <Map className="h-4 w-4" />
                        Dashboard
                      </Link>
                      {/* <Link
                        href="/alerts"
                        className={`flex items-center gap-2 hover:text-primary transition-colors ${pathname === '/alerts' ? 'text-primary font-medium' : ''}`}
                      >
                        <Bell className="h-4 w-4" />
                        Alerts
                      </Link>
                      <Link
                        href="/settings"
                        className={`flex items-center gap-2 hover:text-primary transition-colors ${pathname === '/settings' ? 'text-primary font-medium' : ''}`}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link> */}
                    </div>
                    <div className="flex flex-col space-y-3">
                      <ThemeSwitcher />
                      <Button
                        variant="destructive"
                        onClick={handleSignOut}
                        className="flex items-center gap-2 mt-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col space-y-3 border-b pb-4">
                      <Link href="/" className="flex items-center gap-2 font-medium">
                        <MapPin className="h-5 w-5 text-primary" />
                        Home
                      </Link>
                    </div>
                    <div className="flex flex-col space-y-3">
                      <ThemeSwitcher />
                      <Link href="/sign-in" className="w-full">
                        <Button variant="outline" className="w-full">Sign in</Button>
                      </Link>
                      <Link href="/sign-up" className="w-full">
                        <Button className="w-full">Create account</Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
