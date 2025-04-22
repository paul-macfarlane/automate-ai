import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { selectProjectWithMembers } from "@/db/projects";
import { areMembersManageable } from "@/services/projects";
import { ProjectMembersTabs } from "@/components/project-members-tabs";
import { selectProjectInvitesByStatus } from "@/db/project-invites";
import { ProjectInviteStatus } from "@/models/project-invites";

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

  const pendingInvites = await selectProjectInvitesByStatus({
    projectId,
    status: ProjectInviteStatus.Pending,
  });

  // todo have tab be part of url so that selected tab can be navigated to via url

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <ProjectMembersTabs
          project={project}
          currentUserId={session.user.id}
          pendingInvites={pendingInvites}
        />
      </div>
    </div>
  );
}
