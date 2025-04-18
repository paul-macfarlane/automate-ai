"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectSchema,
  type CreateProjectValues,
} from "@/lib/models/projects";
import {
  createProject,
  type CreateProjectActionResult,
} from "@/actions/project";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActionState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating Project..." : "Create Project"}
    </Button>
  );
}

export function ProjectForm() {
  const router = useRouter();
  const form = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
    },
  });

  const [, action] = useActionState<CreateProjectActionResult, FormData>(
    async (_prevState, formData) => {
      try {
        const values = {
          title: formData.get("title") as string,
          description: formData.get("description") as string,
          icon: formData.get("icon") as string,
        };

        const result = await createProject(values);

        if (result.success) {
          toast.success(result.message);
          router.push(`/projects/${result.projectId!}`);
        } else {
          toast.error(result.message);

          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof CreateProjectValues, {
                type: "server",
                message: errors.join(", "),
              });
            });
          }
        }

        return result;
      } catch (err) {
        console.error("Project creation error:", err);
        toast.error("Something went wrong. Please try again.");
        return {
          success: false,
          message: "An unexpected error occurred.",
        };
      }
    },
    { success: false, message: "" }
  );

  const iconUrl = form.watch("icon");
  const title = form.watch("title");

  return (
    <Form {...form}>
      <form action={action} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My New Project" name="title" />
              </FormControl>
              <FormDescription>A clear name for your project.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe your project (optional)"
                  name="description"
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                A brief description of your project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Icon URL</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://example.com/icon.png (optional)"
                  name="icon"
                />
              </FormControl>
              <FormDescription>
                Enter a URL for your project icon.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Icon Preview:</p>
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage
              src={iconUrl || undefined}
              alt="Project icon preview"
            />
            <AvatarFallback>{getInitials(title || "", "P")}</AvatarFallback>
          </Avatar>
        </div>

        <SubmitButton />
      </form>
    </Form>
  );
}
