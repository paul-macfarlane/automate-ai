/* eslint-disable @next/next/no-img-element */
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/signin");
  }

  // todo this should be updated to use avatar component

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="w-full border-b border-border bg-background/70 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold text-foreground">
              Automanager
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto py-10 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Profile
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and profile information.
            </p>
          </div>

          <div className="flex items-center space-x-6 mb-8">
            <div className="h-20 w-20 rounded-full overflow-hidden border border-border shadow-md">
              <img
                src={session.user.image || "https://via.placeholder.com/150"}
                alt={session.user.name || "Profile picture"}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {session.user.name}
              </h2>
              <p className="text-muted-foreground">{session.user.email}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-border p-6 bg-card">
              <h3 className="text-lg font-medium mb-4 text-card-foreground">
                Personal Information
              </h3>
              <ProfileForm
                initialFormValues={{
                  name: session.user.name!,
                  image: session.user.image || "",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
