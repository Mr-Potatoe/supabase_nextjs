import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { MapPin } from "lucide-react";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-4 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-center mb-2">
          <MapPin className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Mobile</span>Tracker
          </h1>
        </div>
        <Card className="w-full">
          <CardContent className="pt-6">
            <FormMessage message={searchParams} />
            <div className="mt-4 text-center">
              <Link href="/sign-in" className="text-primary hover:underline">
                Return to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-8">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <MapPin className="h-8 w-8 text-primary mr-2" />
          <h1 className="text-3xl font-bold">
            <span className="text-primary">Mobile</span>Tracker
          </h1>
        </div>
        <p className="text-muted-foreground">Create an account to start tracking</p>
      </div>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" action={signUpAction}>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name"
                name="full_name" 
                placeholder="John Doe" 
                required 
                autoComplete="name"
              />
            </div>
            
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                minLength={6}
                required
                autoComplete="new-password"
              />
            </div>
            
            <FormMessage message={searchParams} />
            
            <SubmitButton className="w-full mt-2" formAction={signUpAction} pendingText="Creating account...">
              Create account
            </SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
      <SmtpMessage />
    </div>
  );
}
