import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { projects, projectMembers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getInitials } from "@/lib/utils";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userId = session.user.id;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, params.projectId),
  });
  if (!project) {
    return notFound();
  }

  const members = await db
    .select({
      member: projectMembers,
      user: users,
    })
    .from(projectMembers)
    .innerJoin(users, eq(projectMembers.userId, users.id))
    .where(eq(projectMembers.projectId, project.id));

  const userMember = members.find((m) => m.user.id === userId);
  if (!userMember && project.createdById !== userId) {
    redirect("/projects");
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "editor":
        return <Badge variant="secondary">Editor</Badge>;
      case "viewer":
        return <Badge variant="outline">Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start gap-6 mb-8">
          <Avatar className="h-24 w-24 border border-border shadow-md">
            <AvatarImage src={project.icon || undefined} alt={project.title} />
            <AvatarFallback className="text-2xl font-semibold">
              {getInitials(project.title, "P")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {project.title}
            </h1>
            {project.description && (
              <p className="text-muted-foreground mb-4">
                {project.description}
              </p>
            )}
            <div className="text-sm text-muted-foreground">
              Created {new Date(project.createdAt).toLocaleDateString()}
              {project.updatedAt !== project.createdAt &&
                ` · Updated ${new Date(
                  project.updatedAt
                ).toLocaleDateString()}`}
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Project Members
          </h2>
          <div className="space-y-4">
            {members.map(({ member, user }) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(user.name || "", "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div>{getRoleBadge(member.role)}</div>
              </div>
            ))}
          </div>
        </div>

        {userMember?.member.role === "admin" && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={`/projects/${project.id}/members`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Manage Members
              </a>
              <a
                href={`/projects/${project.id}/edit`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 px-4 py-2"
              >
                Edit Project
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
