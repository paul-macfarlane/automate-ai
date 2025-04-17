import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/signout-button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center p-12">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          <span>Automanager</span>
        </p>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <p className="hidden sm:block">Welcome, {session.user.name}</p>
              <SignOutButton />
            </>
          ) : (
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-24 flex max-w-5xl flex-col items-center text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Automanager</h1>
        <p className="max-w-2xl text-xl mb-8">
          The all-in-one solution for automated project management
        </p>

        {!session?.user && (
          <Button size="lg" asChild className="mt-4">
            <Link href="/signin">Get Started</Link>
          </Button>
        )}

        {session?.user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">Roadmap Generator</h2>
              <p className="mb-4">
                Create automated project roadmaps based on your requirements
              </p>
              <Button asChild className="w-full">
                <Link href="/roadmap">Create Roadmap</Link>
              </Button>
            </div>
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-semibold mb-2">Project Dashboard</h2>
              <p className="mb-4">Visualize your projects and track progress</p>
              <Button asChild className="w-full">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
