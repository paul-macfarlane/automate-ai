"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, type UpdateUserValues } from "@/models/users";
import { updateUserAction, type UpdateUserActionResult } from "@/actions/users";
import { toast } from "sonner";
import { getInitials } from "@/utils";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES, TimezoneValue } from "@/timezones";

interface ProfileFormProps {
  initialFormValues: {
    name?: string;
    image?: string;
    timezone?: TimezoneValue;
  };
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
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: initialFormValues.name || "",
      image: initialFormValues.image || "",
      timezone: initialFormValues.timezone || TimezoneValue.AMERICA_NEW_YORK,
    },
  });

  const [, action] = useActionState<UpdateUserActionResult, FormData>(
    async (_prevState, formData) => {
      try {
        const values = {
          name: formData.get("name") as string,
          image: formData.get("image") as string,
          timezone: formData.get("timezone") as TimezoneValue,
        };

        const result = await updateUserAction(values);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);

          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof UpdateUserValues, {
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

  const clearImage = () => {
    form.setValue("image", "", { shouldValidate: true });
  };

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
              <div className="flex space-x-2">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://example.com/your-image.jpg"
                    name="image"
                  />
                </FormControl>
                {field.value && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={clearImage}
                    title="Clear image URL"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormDescription>
                Enter a URL for your profile picture. We recommend using
                services like Gravatar or a direct image URL.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                name="timezone"
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={"Select your timezone"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIMEZONES.map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                This will be used to display times and dates in your local
                timezone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4">
            <Avatar className="h-16 w-16 border border-border">
              <AvatarImage src={imageUrl || undefined} alt="Profile preview" />
              <AvatarFallback>{getInitials(name || "", "U")}</AvatarFallback>
            </Avatar>
            {!imageUrl && (
              <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
                No image URL provided. Your profile will show initials instead.
              </p>
            )}
          </div>
        </div>

        <SubmitButton />
      </form>
    </Form>
  );
}
