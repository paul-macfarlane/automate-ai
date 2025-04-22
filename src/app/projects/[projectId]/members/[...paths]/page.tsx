import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import {
  ProjectWithMember,
  selectProjectWithMember,
  selectProjectWithMembers,
} from "@/db/projects";
import { areMembersManageable } from "@/services/projects";
import { selectProjectInvitesByStatus } from "@/db/project-invites";
import { ProjectInviteStatus } from "@/models/project-invites";
import ManageMembersTab from "./manage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InviteMembersTab from "./invite";
import PendingMembersTab from "./pending";
import { ChevronLeftIcon } from "lucide-react";

const tabs = [
  {
    label: "Manage",
    href: "/projects/[projectId]/members/manage",
    path: "manage",
  },
  {
    label: "Invite",
    href: "/projects/[projectId]/members/invite",
    path: "invite",
  },
  {
    label: "Pending",
    href: "/projects/[projectId]/members/pending",
    path: "pending",
  },
];

export default async function MembersPage({
  params,
}: {
  params: Promise<{ projectId: string; paths: string[] }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirect("/signin");
  }

  const { projectId, paths } = await params;
  const tab = paths[0];

  let tabComponent: React.ReactNode;
  let projectWithMember: ProjectWithMember | undefined;
  switch (tab) {
    case "manage":
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

      tabComponent = (
        <ManageMembersTab project={project} currentUserId={session.user.id} />
      );

      break;
    case "invite":
      projectWithMember = await selectProjectWithMember({
        projectId,
        userId: session.user.id,
      });
      if (!projectWithMember) {
        return redirect("/projects");
      }

      const canInviteMembers = areMembersManageable(
        projectWithMember.member.role
      );
      if (!canInviteMembers) {
        return redirect(`/projects/${projectId}`);
      }

      tabComponent = <InviteMembersTab projectId={projectId} />;
      break;
    case "pending":
      projectWithMember = await selectProjectWithMember({
        projectId,
        userId: session.user.id,
      });
      if (!projectWithMember) {
        return redirect("/projects");
      }

      const canRevokeInvites = areMembersManageable(
        projectWithMember.member.role
      );
      if (!canRevokeInvites) {
        return redirect(`/projects/${projectId}`);
      }

      const pendingInvites = await selectProjectInvitesByStatus({
        projectId,
        status: ProjectInviteStatus.Pending,
      });

      tabComponent = <PendingMembersTab pendingInvites={pendingInvites} />;

      break;
    default:
      return notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-4xl flex flex-col gap-4">
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href={`/projects/${projectId}`}>
              <ChevronLeftIcon className="w-4 h-4" />
              Back to project
            </Link>
          </Button>
        </div>
        <div className="flex gap-4">
          {tabs.map(({ label, href, path }) => (
            <Button
              key={label}
              variant={tab === path ? "default" : "outline"}
              asChild
            >
              <Link href={href.replace("[projectId]", projectId)}>{label}</Link>
            </Button>
          ))}
        </div>
        {tabComponent}
      </div>
    </div>
  );
}
