import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-8">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <MapPin className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Mobile</span>Tracker
          </h1>
        </div>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={signInAction}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                name="email" 
                type="email"
                placeholder="you@example.com" 
                required 
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  className="text-xs text-primary hover:underline"
                  href="/forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                required
                autoComplete="current-password"
              />
            </div>
            
            <FormMessage message={searchParams} />
            
            <SubmitButton className="w-full mt-2" pendingText="Signing In...">
              Sign in
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-up">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
