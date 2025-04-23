import { z } from "zod";

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

export type MutateProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};
