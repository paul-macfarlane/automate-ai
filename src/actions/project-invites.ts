"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  selectProjectWithMember,
  selectProjectWithMembers,
} from "@/db/projects";
import { selectProjectMemberByEmail } from "@/db/project-members";
import { areMembersManageable } from "@/services/projects";
import {
  insertProjectInvite,
  ProjectInvite,
  selectProjectInvite,
  selectProjectInviteByEmailAndStatus,
  updateProjectInvite,
  selectUserInvitesByEmailAndStatus,
  ProjectInviteWithInviter,
} from "@/db/project-invites";
import {
  inviteUserSchema,
  ProjectInviteStatus,
  INVITE_EXPIRATION_TIME_MS,
  InviteResponse,
} from "@/models/project-invites";
import { searchUsersByEmailExcluding, User } from "@/db/users";
import { insertProjectMember } from "@/db/projects";
import { transaction } from "@/db/transaction";

type InviteUserActionResult = {
  success: boolean;
  message: string;
  invite?: ProjectInvite;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function inviteUserAction(
  params: unknown
): Promise<InviteUserActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to invite users.",
      };
    }

    const validationResult = inviteUserSchema.safeParse(params);
    if (!validationResult.success) {
      const fieldErrors: { [key: string]: string[] } = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      });

      return {
        success: false,
        message: "Please fix the errors in the form.",
        fieldErrors,
      };
    }

    const { projectId, email, role } = validationResult.data;

    const projectWithMember = await selectProjectWithMember({
      projectId,
      userId: session.user.id,
    });
    if (!projectWithMember) {
      return {
        success: false,
        message: "Project not found or you don't have access to it.",
      };
    }

    if (!areMembersManageable(projectWithMember.member.role)) {
      return {
        success: false,
        message: "You don't have permission to invite users to this project.",
      };
    }

    const pendingInvites = await selectProjectInviteByEmailAndStatus({
      email,
      status: ProjectInviteStatus.Pending,
      projectId,
      expiresAfter: new Date(),
    });
    if (pendingInvites.length > 0) {
      return {
        success: false,
        message: "There is already an open invite for this email.",
      };
    }

    const projectMemberWithEmail = await selectProjectMemberByEmail({
      email,
      projectId,
    });
    if (projectMemberWithEmail) {
      return {
        success: false,
        message: "User is already a member of the project.",
      };
    }

    const invite = await insertProjectInvite({
      projectId,
      email,
      role,
      inviterId: session.user.id,
      inviteeId: null,
      expiresAt: new Date(Date.now() + INVITE_EXPIRATION_TIME_MS),
    });

    return {
      success: true,
      message: `Invitation sent to ${email}.`,
      invite,
    };
  } catch (error) {
    console.error("Error inviting user:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

const revokeInviteSchema = z.object({
  inviteId: z.string(),
});

type RevokeInviteActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function revokeInviteAction(
  params: unknown
): Promise<RevokeInviteActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to revoke invitations.",
      };
    }

    const validationResult = revokeInviteSchema.safeParse(params);
    if (!validationResult.success) {
      const fieldErrors: { [key: string]: string[] } = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      });

      return {
        success: false,
        message: "Please fix the errors in the form.",
        fieldErrors,
      };
    }

    const { inviteId } = validationResult.data;

    const invite = await selectProjectInvite(inviteId);
    if (!invite) {
      return {
        success: false,
        message: "Invitation not found.",
      };
    }

    const projectWithMember = await selectProjectWithMember({
      projectId: invite.projectId,
      userId: session.user.id,
    });
    if (!projectWithMember) {
      return {
        success: false,
        message: "Project not found or you don't have access to it.",
      };
    }

    if (!areMembersManageable(projectWithMember.member.role)) {
      return {
        success: false,
        message:
          "You don't have permission to revoke invitations for this project.",
      };
    }

    const result = await updateProjectInvite({
      inviteId,
      status: ProjectInviteStatus.Revoked,
    });
    if (!result) {
      return {
        success: false,
        message: "Invitation not found or already processed.",
      };
    }

    return {
      success: true,
      message: "Invitation revoked successfully.",
    };
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

type SearchProjectInviteCandidatesActionResult = {
  success: boolean;
  message: string;
  users: User[];
  fieldErrors?: {
    [key: string]: string[];
  };
};

const searchProjectInviteCandidatesSchema = z.object({
  query: z.string().min(3),
  projectId: z.string(),
});

export async function searchProjectInviteCandidatesAction(
  params: unknown
): Promise<SearchProjectInviteCandidatesActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to search for users.",
        users: [],
      };
    }

    const validationResult =
      searchProjectInviteCandidatesSchema.safeParse(params);
    if (!validationResult.success) {
      const fieldErrors: { [key: string]: string[] } = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      });

      return {
        success: false,
        message: "Please fix the errors in the form.",
        fieldErrors,
        users: [],
      };
    }

    const { query, projectId } = validationResult.data;

    const projectWithMembers = await selectProjectWithMembers(projectId);
    if (!projectWithMembers) {
      return {
        success: false,
        message: "Project not found.",
        users: [],
      };
    }

    const userMember = projectWithMembers.members.find(
      (member) => member.userId === session.user!.id
    );
    if (!userMember) {
      return {
        success: false,
        message: "You are not a member of this project.",
        users: [],
      };
    }

    if (!areMembersManageable(userMember.role)) {
      return {
        success: false,
        message: "You don't have permission to invite users to this project.",
        users: [],
      };
    }

    const excludingUserIds = projectWithMembers.members.map(
      (member) => member.userId
    );

    const results = await searchUsersByEmailExcluding({
      query,
      excludingUserIds,
    });
    return {
      success: true,
      message: "Users found.",
      users: results,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      users: [],
    };
  }
}

const respondToInviteSchema = z.object({
  inviteId: z.string(),
  response: z.nativeEnum(InviteResponse),
});

type RespondToInviteActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function respondToInviteAction(
  params: unknown
): Promise<RespondToInviteActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to respond to invitations.",
      };
    }

    const validationResult = respondToInviteSchema.safeParse(params);
    if (!validationResult.success) {
      const fieldErrors: { [key: string]: string[] } = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(error.message);
      });

      return {
        success: false,
        message: "Please fix the errors in the form.",
        fieldErrors,
      };
    }

    const { inviteId, response } = validationResult.data;

    const invite = await selectProjectInvite(inviteId);
    if (!invite) {
      return {
        success: false,
        message: "Invitation not found.",
      };
    }

    if (new Date() > invite.expiresAt) {
      return {
        success: false,
        message: "This invitation has expired.",
      };
    }

    if (invite.email !== session.user.email) {
      return {
        success: false,
        message: "This invitation is not for your account.",
      };
    }

    if (invite.status !== ProjectInviteStatus.Pending) {
      return {
        success: false,
        message: "This invitation has already been processed.",
      };
    }

    if (response === InviteResponse.Accept) {
      await transaction(async (tx) => {
        await updateProjectInvite(
          {
            inviteId,
            inviteeId: session.user!.id,
            status: ProjectInviteStatus.Accepted,
          },
          tx
        );

        await insertProjectMember(
          {
            userId: session.user!.id!,
            projectId: invite.projectId,
            role: invite.role,
          },
          tx
        );
      });

      return {
        success: true,
        message: "You have successfully joined the project.",
        projectId: invite.projectId as string,
      };
    } else {
      await updateProjectInvite({
        inviteId,
        inviteeId: session.user!.id,
        status: ProjectInviteStatus.Rejected,
      });

      return {
        success: true,
        message: "You have declined the invitation.",
      };
    }
  } catch (error) {
    console.error("Error responding to invitation:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

type GetUserPendingInvitesActionResult = {
  success: boolean;
  message: string;
  invites: ProjectInviteWithInviter[];
};

export async function getUserPendingInvitesAction(): Promise<GetUserPendingInvitesActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return {
        success: false,
        message: "You must be logged in to get your pending invites.",
        invites: [],
      };
    }

    const pendingInvites = await selectUserInvitesByEmailAndStatus({
      email: session.user.email,
      status: ProjectInviteStatus.Pending,
      expiresAfter: new Date(),
    });

    return {
      success: true,
      message: "Pending invites fetched successfully.",
      invites: pendingInvites,
    };
  } catch (error) {
    console.error("Error fetching user invites:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      invites: [],
    };
  }
}
