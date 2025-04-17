import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <>
      {!session?.user ? (
        <div className="flex flex-1 flex-col">
          {/* Hero Section */}
          <section className="container mx-auto grid gap-8 py-16 md:grid-cols-2 md:py-24">
            <div className="flex flex-col justify-center space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
                Automate Your{" "}
                <span className="text-primary">Project Management</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Streamline your workflow with AI-powered roadmaps, task
                management, and analytics.
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href="/signin">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[300px] w-[400px] overflow-hidden rounded-lg shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1 via-chart-4 to-chart-5 opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-6 text-center text-primary-foreground">
                    <h3 className="text-2xl font-bold">
                      Generate roadmaps with AI
                    </h3>
                    <p className="mt-2">
                      Turn your ideas into actionable project plans
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="bg-muted py-16">
            <div className="container mx-auto px-4">
              <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
                Features
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-lg bg-card p-6 shadow-md">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 p-2 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    AI Roadmap Generator
                  </h3>
                  <p className="text-muted-foreground">
                    Automatically generate project roadmaps based on your
                    requirements and goals.
                  </p>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-md">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 p-2 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    Analytics Dashboard
                  </h3>
                  <p className="text-muted-foreground">
                    Track project progress with real-time analytics and
                    insightful visualizations.
                  </p>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-md">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 p-2 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-8 w-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-card-foreground">
                    Team Collaboration
                  </h3>
                  <p className="text-muted-foreground">
                    Collaborate with your team in real-time with shared
                    workspaces and task assignments.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-primary py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="mb-6 text-3xl font-bold text-primary-foreground">
                Ready to Streamline Your Project Management?
              </h2>
              <p className="mb-8 text-xl text-primary-foreground">
                Join the teams already using Automanager to supercharge their
                productivity.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-background text-primary hover:bg-muted"
              >
                <Link href="/signin">Get Started for Free</Link>
              </Button>
            </div>
          </section>

          <footer className="bg-card py-8 text-card-foreground">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Automanager</h3>
                  <p className="text-muted-foreground">
                    Automated project management tools for your needs
                  </p>
                </div>
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Features</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>Roadmap Generator</li>
                    <li>Analytics Dashboard</li>
                    <li>Team Collaboration</li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your projects with our suite of automated tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full">
            <div className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
              <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
                Roadmap Generator
              </h2>
              <p className="mb-4 text-muted-foreground">
                Create automated project roadmaps based on your requirements
              </p>
              <Button asChild className="w-full">
                <Link href="/roadmap">Create Roadmap</Link>
              </Button>
            </div>
            <div className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow bg-card">
              <h2 className="text-2xl font-semibold mb-2 text-card-foreground">
                Project Dashboard
              </h2>
              <p className="mb-4 text-muted-foreground">
                Visualize your projects and track progress
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
