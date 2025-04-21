import { z } from "zod";

export enum ProjectRole {
  Admin = "admin",
  Editor = "editor",
  Viewer = "viewer",
}

export const PROJECT_ROLES = Object.values(ProjectRole);

export const EDITABLE_PROJECT_ROLES = [ProjectRole.Admin, ProjectRole.Editor];
export const DELETABLE_PROJECT_ROLES = [ProjectRole.Admin];
export const MEMBER_MANAGEMENT_PROJECT_ROLES = [ProjectRole.Admin];

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
    .or(z.literal("")),
  icon: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
});

export type CreateProjectValues = z.infer<typeof createProjectSchema>;
