import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { selectProjectWithMembers } from "@/db/projects";
import { areMembersManageable } from "@/services/projects";
import { ProjectMembersUI } from "@/components/project-members-ui";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/signin");
  }

  const { projectId } = await params;

  const project = await selectProjectWithMembers(projectId);
  if (!project) {
    return redirect("/projects");
  }
  const currentUserMember = project.members.find(
    (member) => member.user.id === session.user?.id
  );
  if (!currentUserMember) {
    return redirect("/projects");
  }

  const canManageMembers = areMembersManageable(currentUserMember.role);
  if (!canManageMembers) {
    return redirect(`/projects/${projectId}`);
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <ProjectMembersUI project={project} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
