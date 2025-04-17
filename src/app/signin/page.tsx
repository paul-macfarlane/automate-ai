import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButton } from "@/components/signin-button";
import { Navbar } from "@/components/navbar";

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={null} />

      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to Automanager</CardTitle>
            <CardDescription>
              Sign in to access your automated project management tools
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignInButton />
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
