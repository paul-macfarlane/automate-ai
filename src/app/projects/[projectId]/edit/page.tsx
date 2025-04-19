import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/project-form";
import { selectProjectWithMember } from "@/db/projects";
import { auth } from "@/auth";
import { isProjectEditable } from "@/services/projects";

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

  if (isProjectEditable(projectWithMember)) {
    return redirect(`/projects/${projectId}`);
  }

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
        </div>
      </div>
    </div>
  );
}
