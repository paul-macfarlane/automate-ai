import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/signin");
  }

  return (
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
          <Avatar className="h-20 w-20 border border-border shadow-md">
            <AvatarImage
              src={session.user.image || undefined}
              alt={session.user.name || "Profile picture"}
            />
            <AvatarFallback className="text-xl font-semibold">
              {getInitials(session.user.name)}
            </AvatarFallback>
          </Avatar>
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
                name: session.user.name || "",
                image: session.user.image || "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
