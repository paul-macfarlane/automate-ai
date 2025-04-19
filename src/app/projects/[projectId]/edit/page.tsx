import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/project-form";
import { selectProjectWithMember } from "@/db/projects";
import { auth } from "@/auth";
import { isProjectDeletable, isProjectEditable } from "@/services/projects";
import DeleteProjectButton from "@/components/delete-project-button";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/signin");
  }

  const { projectId } = await params;

  const projectWithMember = await selectProjectWithMember({
    projectId,
    userId: session.user.id,
  });
  if (!projectWithMember) {
    return redirect("/projects");
  }

  if (!isProjectEditable(projectWithMember)) {
    return redirect(`/projects/${projectId}`);
  }

  const canDeleteProject = isProjectDeletable(projectWithMember);

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Edit Project
          </h1>
          <p className="text-muted-foreground mt-2">
            Update your project&apos;s details.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6 bg-card">
            <ProjectForm project={projectWithMember} />
          </div>

          {canDeleteProject && (
            <div className="rounded-lg border border-border p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
              <p className="text-muted-foreground mb-4">
                Once you delete a project, there is no going back. Please be
                sure.
              </p>
              <DeleteProjectButton
                projectId={projectId}
                projectTitle={projectWithMember.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
