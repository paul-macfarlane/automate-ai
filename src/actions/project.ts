"use server";

import {
  createProjectSchema,
  type CreateProjectValues,
} from "@/lib/models/projects";
import { auth } from "@/auth";
import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";

export type CreateProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function createProject(
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

    const queryResult = await db
      .insert(projects)
      .values({
        title: validationResult.data.title,
        description: validationResult.data.description || null,
        icon: validationResult.data.icon || null,
        createdById: session.user.id,
      })
      .returning();

    await db.insert(projectMembers).values({
      userId: session.user.id,
      role: "admin",
      projectId: queryResult[0].id,
    });

    return {
      success: true,
      message: "Project created successfully.",
      projectId: queryResult[0].id,
    };
  } catch (error) {
    console.error("Error creating project:", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
