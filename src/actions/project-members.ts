"use server";

import { auth } from "@/auth";
import { selectProjectWithMember } from "@/db/projects";
import {
  selectProjectMember,
  updateProjectMemberRole,
  deleteProjectMember,
} from "@/db/project-members";
import { ProjectRole } from "@/models/project-members";
import { areMembersManageable } from "@/services/projects";
import { z } from "zod";

const updateProjectMemberActionParamsSchema = z.object({
  projectId: z.string(),
  memberId: z.string(),
  role: z.nativeEnum(ProjectRole),
});

type UpdateProjectMemberActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: { [key: string]: string[] };
};

export async function updateProjectMemberAction(
  params: unknown
): Promise<UpdateProjectMemberActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to update a member's role.",
      };
    }

    const validationResult =
      updateProjectMemberActionParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Invalid input parameters.",
        fieldErrors: validationResult.error.flatten().fieldErrors as {
          [key: string]: string[];
        },
      };
    }

    const { projectId, memberId, role } = validationResult.data;

    const projectWithMember = await selectProjectWithMember({
      projectId,
      userId: session.user.id,
    });
    if (!projectWithMember) {
      return {
        success: false,
        message: "Project not found.",
      };
    }

    if (!areMembersManageable(projectWithMember.member.role)) {
      return {
        success: false,
        message: "You do not have permission to manage project members.",
      };
    }

    const projectMember = await selectProjectMember(memberId);
    if (!projectMember) {
      return {
        success: false,
        message: "Member not found.",
      };
    }

    if (projectMember.userId === session.user.id) {
      return {
        success: false,
        message: "You cannot change your own role.",
      };
    }

    await updateProjectMemberRole({
      memberId,
      role,
    });

    return {
      success: true,
      message: "Member role updated successfully.",
    };
  } catch (error) {
    console.error("Error updating member role:", error);

    let message = "An unexpected error occurred. Please try again later.";
    if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
}
const removeProjectMemberActionParamsSchema = z.object({
  projectId: z.string(),
  memberId: z.string(),
});
type RemoveProjectMemberActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: { [key: string]: string[] };
};

export async function removeProjectMemberAction(
  params: unknown
): Promise<RemoveProjectMemberActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to remove a project member.",
      };
    }

    const validationResult =
      removeProjectMemberActionParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Invalid input parameters.",
        fieldErrors: validationResult.error.flatten().fieldErrors as {
          [key: string]: string[];
        },
      };
    }

    const { projectId, memberId } = validationResult.data;

    const projectWithMember = await selectProjectWithMember({
      projectId,
      userId: session.user.id,
    });
    if (!projectWithMember) {
      return {
        success: false,
        message: "Project not found.",
      };
    }

    if (!areMembersManageable(projectWithMember.member.role)) {
      return {
        success: false,
        message: "You do not have permission to manage project members.",
      };
    }

    const projectMember = await selectProjectMember(memberId);
    if (!projectMember) {
      return {
        success: false,
        message: "Member not found.",
      };
    }

    if (projectMember.userId === session.user.id) {
      return {
        success: false,
        message: "You cannot remove yourself from the project.",
      };
    }

    await deleteProjectMember(memberId);

    return {
      success: true,
      message: "Member removed successfully.",
    };
  } catch (error) {
    console.error("Error removing project member:", error);

    let message = "An unexpected error occurred. Please try again later.";
    if (error instanceof Error) {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
}
