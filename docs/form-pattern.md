# Form and Server Action Pattern

This document outlines the standardized pattern for creating forms with server actions in our application.

## Overview

Our application uses a consistent pattern for forms that combines:

1. Zod for validation
2. React Hook Form for form state management
3. React Server Actions for server-side processing
4. Typed responses for error handling
5. Direct error mapping between server and client

## Pattern Structure

### 1. Schema Definition

Create a validation schema in `src/lib/models` using Zod:

```typescript
// Example from src/lib/models/project.ts
import { z } from "zod";

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
  // ... other fields
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
```

### 2. Server Action Implementation

Create a server action in `src/actions` with typed responses:

```typescript
// Example from src/actions/project.ts
"use server";

import {
  projectSchema,
  type ProjectFormValues,
} from "@/lib/validations/project";
// ... other imports

export type ProjectActionResult = {
  success: boolean;
  message: string;
  projectId?: string; // Optional contextual data
  fieldErrors?: {
    [key: string]: string[];
  };
};

export async function createProject(
  values: ProjectFormValues
): Promise<ProjectActionResult> {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You must be logged in to perform this action.",
      };
    }

    // 2. Validation with detailed errors
    const validationResult = projectSchema.safeParse(values);
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

    // 3. Database operation
    // ... perform database operations with validated data

    // 4. Return success result
    return {
      success: true,
      message: "Operation completed successfully.",
      // Include any relevant data like IDs
    };
  } catch (error) {
    // 5. Error handling
    console.error("Action error:", error);

    // Handle specific error types
    if (error instanceof z.ZodError) {
      // ... format Zod errors
    }

    // Return appropriate error response
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}
```

### 3. Form Component Implementation

Create a form component in `src/components` using React Hook Form and the `useActionState` hook:

```typescript
// Example from src/components/project-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
// ... other imports

// Separate submit button for loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Processing..." : "Submit"}
    </Button>
  );
}

export function ProjectForm() {
  const router = useRouter();

  // 1. Initialize form with React Hook Form + Zod
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      // ... default values
    },
  });

  // 2. Use action state for server action integration
  const [, action] = useActionState<ProjectActionResult, FormData>(
    async (_prevState, formData) => {
      try {
        // Extract values from form data
        const values = {
          // ... get values from formData
        };

        // Call server action
        const result = await serverAction(values);

        // Handle response synchronously
        if (result.success) {
          toast.success(result.message);
          // Optional redirect or other success actions
        } else {
          toast.error(result.message);

          // Map server errors to form fields
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof FormValues, {
                type: "server",
                message: errors.join(", "),
              });
            });
          }
        }

        return result;
      } catch (err) {
        // Handle unexpected errors
        console.error("Form action error:", err);
        toast.error("Something went wrong");
        return {
          success: false,
          message: "An unexpected error occurred.",
        };
      }
    },
    { success: false, message: "" } // Initial state
  );

  // 3. Form rendering with shadcn/ui components
  return (
    <Form {...form}>
      <form action={action} className="space-y-6">
        {/* Form fields */}
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field Label</FormLabel>
              <FormControl>
                <Input {...field} name="fieldName" />
              </FormControl>
              <FormDescription>Helper text</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button with loading state */}
        <SubmitButton />
      </form>
    </Form>
  );
}
```

### 4. Page Implementation

Create a page component that includes the form:

```typescript
// Example from src/app/projects/new/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/project-form";

export default async function NewProjectPage() {
  // Authentication check
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <h1>Create Project</h1>
        <ProjectForm />
      </div>
    </div>
  );
}
```

## Key Benefits

1. **Type Safety**: End-to-end type safety from validation schema to server action to form component
2. **Consistent Error Handling**: Standard pattern for error propagation from server to client
3. **Field-Level Validation**: Both client-side and server-side validation with field-specific errors
4. **Loading States**: Automatic loading states using React's built-in hooks
5. **Separation of Concerns**: Clear separation between validation, form state, and server actions

## Best Practices

1. Always use Zod for validation both client-side and server-side
2. Return typed responses from server actions with consistent structure
3. Handle errors gracefully with appropriate user feedback
4. Use React Hook Form for client-side form state management
5. Leverage the `useActionState` hook for synchronous server response handling
6. Separate the submit button to leverage `useFormStatus` for loading states
7. Include toast notifications for success/error feedback
8. Apply server validation errors directly to form fields when available
