"use server";

import { updateUserSchema, type UpdateUserValues } from "@/models/users";
import { auth } from "@/auth";
import { updateUser } from "@/db/users";
import { revalidatePath } from "next/cache";

export type UpdateUserActionResult = {
  success: boolean;
  message: string;
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function updateUserAction(
  values: UpdateUserValues
): Promise<UpdateUserActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    const validationResult = updateUserSchema.safeParse(values);
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

    await updateUser({
      userId: session.user.id,
      name: validationResult.data.name,
      image: validationResult.data.image || null,
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profile updated successfully.",
    };
  } catch (error) {
    console.error("Error updating profile:", error);

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
