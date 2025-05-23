import { redirect } from "next/navigation";
import Link from "next/link";
import { getInitials } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { selectUserProjects } from "@/db/projects";
import { formatDateShort } from "@/dates";
import { getAuthedUser } from "@/services/users";
import { getUserPendingInvitesAction } from "@/actions/project-invites";
import { PendingInvites } from "@/components/pending-invites";

export default async function ProjectsPage() {
  const user = await getAuthedUser();
  if (!user) {
    redirect("/signin");
  }

  const userProjects = await selectUserProjects(user.id);
  const { invites } = await getUserPendingInvitesAction();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            My Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">Create New Project</Link>
        </Button>
      </div>

      {invites.length > 0 && (
        <div className="mb-8">
          <PendingInvites invites={invites} />
        </div>
      )}

      {userProjects.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first project to get started
          </p>
          <Button asChild>
            <Link href="/projects/new">Create Project</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map(({ project, role, memberCount }) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="border rounded-lg p-5 hover:shadow-md hover:bg-muted focus:ring-0 transition-shadow bg-card"
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage
                    src={project.icon || undefined}
                    alt={project.title}
                  />
                  <AvatarFallback>
                    {getInitials(project.title, "P")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {project.title}
                  </h2>
                  {project.description && (
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <Badge variant="outline" className="mr-2">
                    {memberCount} {memberCount === 1 ? "Member" : "Members"}
                  </Badge>
                  {role === "admin" && <Badge>Admin</Badge>}
                  {role === "editor" && (
                    <Badge variant="secondary">Editor</Badge>
                  )}
                  {role === "viewer" && <Badge variant="outline">Viewer</Badge>}
                </div>
                <span className="text-muted-foreground">
                  {formatDateShort(project.updatedAt, user.timezone)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
