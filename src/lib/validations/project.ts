import { z } from "zod";

export const projectRoleEnum = z.enum(["admin", "editor", "viewer"]);
export type ProjectRole = z.infer<typeof projectRoleEnum>;

export const projectSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
    .or(z.literal("")),
  icon: z // todo could create reusable logo url schema
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const projectMemberSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  role: projectRoleEnum,
});

export type ProjectMember = z.infer<typeof projectMemberSchema>;
