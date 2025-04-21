"use server";

import { createProjectSchema, ProjectRole } from "@/models/projects";
import { auth } from "@/auth";
import { transaction } from "@/db/transaction";
import {
  insertProject,
  insertProjectMember,
  selectProjectWithMember,
  updateProject,
  deleteProject,
} from "@/db/projects";
import { isProjectDeletable, isProjectEditable } from "@/services/projects";
import { z } from "zod";

export type MutateProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function createProjectAction(
  params: unknown
): Promise<MutateProjectActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to create a project.",
      };
    }

    const validationResult = createProjectSchema.safeParse(params);
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

    const project = await transaction(async (tx) => {
      const project = await insertProject(
        {
          ...validationResult.data,
          createdById: session.user!.id!,
        },
        tx
      );

      await insertProjectMember(
        {
          userId: session.user!.id!,
          role: ProjectRole.Admin,
          projectId: project.id,
        },
        tx
      );

      return project;
    });

    return {
      success: true,
      message: "Project created successfully.",
      projectId: project.id,
    };
  } catch (error) {
    console.error("Error creating project:", error);

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

export const updateProjectActionParamsSchema = z.object({
  projectId: z.string(),
  values: createProjectSchema,
});

export async function updateProjectAction(
  params: unknown
): Promise<MutateProjectActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to update a project.",
      };
    }

    const validationResult = updateProjectActionParamsSchema.safeParse(params);
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

    const { projectId, values } = validationResult.data;

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

    if (!isProjectEditable(projectWithMember.member.role)) {
      return {
        success: false,
        message: "You do not have permission to update this project.",
      };
    }

    await updateProject({
      projectId,
      values,
    });

    return {
      success: true,
      message: "Project updated successfully.",
    };
  } catch (error) {
    console.error("Error updating project:", error);

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

export const deleteProjectActionParamsSchema = z.object({
  projectId: z.string(),
});

export async function deleteProjectAction(
  params: unknown
): Promise<MutateProjectActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to delete a project.",
      };
    }

    const validationResult = deleteProjectActionParamsSchema.safeParse(params);
    if (!validationResult.success) {
      return {
        success: false,
        message: "Please fix the errors in the form.",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      };
    }

    const projectWithMember = await selectProjectWithMember({
      projectId: validationResult.data.projectId,
      userId: session.user.id,
    });
    if (!projectWithMember) {
      return {
        success: false,
        message: "Project not found.",
      };
    }

    if (!isProjectDeletable(projectWithMember.member.role)) {
      return {
        success: false,
        message: "You do not have permission to delete this project.",
      };
    }

    await deleteProject(validationResult.data.projectId);

    return {
      success: true,
      message: "Project deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting project:", error);

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
