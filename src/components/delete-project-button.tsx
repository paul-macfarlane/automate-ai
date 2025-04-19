"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProjectAction } from "@/actions/projects";
import { useRouter } from "next/navigation";

export type DeleteProjectButtonProps = {
  projectId: string;
  projectTitle: string;
};

export default function DeleteProjectButton({
  projectId,
  projectTitle,
}: DeleteProjectButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  // TODO: Use AlertDialog
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteProjectAction(projectId);

      if (result.success) {
        toast.success(result.message);
        router.push("/projects");
      } else {
        toast.error(result.message);
        setShowConfirmation(false);
      }
    } catch (error) {
      toast.error("Failed to delete project. Please try again.");
      console.error("Delete project error:", error);
      setShowConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="border border-destructive p-4 rounded-md bg-destructive/5">
        <p className="font-medium mb-4">
          Are you sure you want to delete &quot;{projectTitle}&quot;?
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          This action cannot be undone. This will permanently delete the project
          and all associated data.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmation(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, delete project"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="destructive" onClick={() => setShowConfirmation(true)}>
      Delete Project
    </Button>
  );
}
