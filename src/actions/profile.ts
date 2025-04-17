"use server";

import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateProfile(values: ProfileFormValues) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    // todo add better validation that returns more detailed errors to client
    const validatedValues = profileSchema.parse(values);

    await db
      .update(users)
      .set({
        name: validatedValues.name,
        image: validatedValues.image || null,
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
