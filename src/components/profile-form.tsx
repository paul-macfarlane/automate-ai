"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { updateProfile } from "@/actions/profile";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

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

interface ProfileFormProps {
  initialFormValues: ProfileFormValues;
}

export function ProfileForm({ initialFormValues }: ProfileFormProps) {
  // todo this might be able to be updated to use action state
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialFormValues.name || "",
      image: initialFormValues.image || "",
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);

    try {
      const result = await updateProfile(values);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Watch the image field to display preview
  const imageUrl = form.watch("image");
  const name = form.watch("name");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your name" />
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
                />
              </FormControl>
              <FormDescription>
                Enter a URL for your profile picture.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Preview */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={imageUrl || undefined} alt="Profile preview" />
            <AvatarFallback>{getInitials(name || "", "U")}</AvatarFallback>
          </Avatar>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  );
}
