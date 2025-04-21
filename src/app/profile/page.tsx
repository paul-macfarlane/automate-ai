import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils";
import { getAuthedUser } from "@/services/users";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{
    newUser: string;
  }>;
}) {
  const user = await getAuthedUser();
  if (!user) {
    return redirect("/signin");
  }

  const { newUser: newUserParam } = await searchParams;
  const newUser = newUserParam === "true";

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            {newUser
              ? "Set up your profile"
              : "Manage your account settings and profile information."}
          </p>
        </div>

        <div className="flex items-center space-x-6 mb-8">
          <Avatar className="h-20 w-20 border border-border shadow-md">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name || "Profile picture"}
            />
            <AvatarFallback className="text-xl font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {user.name}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6 bg-card">
            <h3 className="text-lg font-medium mb-4 text-card-foreground">
              Personal Information
            </h3>
            <ProfileForm
              initialFormValues={{
                name: user.name || "",
                image: user.image || "",
                timezone: user.timezone,
              }}
              newUser={newUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
