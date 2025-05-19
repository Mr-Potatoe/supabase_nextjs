import { QueryProvider } from "@/components/providers/query-provider";
import { MainNav } from "@/components/navigation/main-nav";
import { LocationProvider } from "@/components/providers/location-provider";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Mobile Tracker - Real-time GPS Tracking",
  description: "Real-time GPS tracking application with geofencing and multi-device support",
  icons: {
    icon: '/favicon.ico', // for default browsers
  },
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <main className="min-h-screen flex flex-col items-center">
              <div className="flex-1 w-full flex flex-col items-center">
                {/* Custom navigation that adapts based on authentication status */}
                <MainNav />
                
                {/* Location permission dialog - client-side only */}
                <LocationProvider />
                
                <div className="flex-1 w-full max-w-7xl py-4 px-4">
                  {children}
                  <Toaster position="top-center" richColors />
                </div>

                <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-8">
                  <p>
                    Powered by{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      className="font-bold hover:underline"
                      rel="noreferrer"
                    >
                      Supabase
                    </a>
                  </p>
                </footer>
              </div>
            </main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
