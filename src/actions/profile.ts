"use server";

import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ProfileActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function updateProfile(
  values: ProfileFormValues
): Promise<ProfileActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    const validationResult = profileSchema.safeParse(values);
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

    await db
      .update(users)
      .set({
        name: validationResult.data.name,
        image: validationResult.data.image || null,
      })
      .where(eq(users.id, session.user.id));

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Error updating profile:", error);

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
