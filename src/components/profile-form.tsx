"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { updateProfile, type ProfileActionResult } from "@/actions/profile";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActionState } from "react";

interface ProfileFormProps {
  initialFormValues: ProfileFormValues;
}

// Separate submit button component to leverage useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Updating..." : "Update Profile"}
    </Button>
  );
}

export function ProfileForm({ initialFormValues }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialFormValues.name || "",
      image: initialFormValues.image || "",
    },
  });

  const [, action] = useActionState<ProfileActionResult, FormData>(
    async (_prevState, formData) => {
      try {
        const values = {
          name: formData.get("name") as string,
          image: formData.get("image") as string,
        };

        const result = await updateProfile(values);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);

          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof ProfileFormValues, {
                type: "server",
                message: errors.join(", "),
              });
            });
          }
        }

        return result;
      } catch (err) {
        console.error("Profile update error:", err);
        toast.error("Something went wrong. Please try again.");
        return {
          success: false,
          message: "An unexpected error occurred.",
        };
      }
    },
    { success: false, message: "" }
  );

  const imageUrl = form.watch("image");
  const name = form.watch("name");

  return (
    <Form {...form}>
      <form action={action} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your name" name="name" />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://example.com/your-image.jpg"
                  name="image"
                />
              </FormControl>
              <FormDescription>
                Enter a URL for your profile picture.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={imageUrl || undefined} alt="Profile preview" />
            <AvatarFallback>{getInitials(name || "", "U")}</AvatarFallback>
          </Avatar>
        </div>

        <SubmitButton />
      </form>
    </Form>
  );
}
