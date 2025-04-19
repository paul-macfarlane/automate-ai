"use server";

import {
  createProjectSchema,
  type CreateProjectValues,
} from "@/models/projects";
import { auth } from "@/auth";
import { transaction } from "@/db/transaction";
import { insertProject, insertProjectMember } from "@/db/projects";

export type CreateProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function createProjectAction(
  values: CreateProjectValues
): Promise<CreateProjectActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to create a project.",
      };
    }

    const validationResult = createProjectSchema.safeParse(values);
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
          role: "admin",
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
