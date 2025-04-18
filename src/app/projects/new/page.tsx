import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/project-form";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create New Project
          </h1>
          <p className="text-muted-foreground mt-2">
            Create a new project and invite team members to collaborate.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border p-6 bg-card">
            <ProjectForm />
          </div>
        </div>
      </div>
    </div>
  );
}
