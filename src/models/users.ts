import { Timezone } from "@/timezones";
import { z } from "zod";

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(50, { message: "Name must be less than 50 characters" }),
  image: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  timezone: z.nativeEnum(Timezone),
});

export type UpdateUserValues = z.infer<typeof updateUserSchema>;

export type UpdateUserActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};
