"use client";

import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { CardDescription } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectInvite } from "@/db/project-invites";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { revokeInviteAction } from "@/actions/project-invites";
import { toast } from "sonner";

export type PendingMembersTabProps = {
  pendingInvites: ProjectInvite[];
};

export default function PendingMembersTab({
  pendingInvites,
}: PendingMembersTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRevokeInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      const result = await revokeInviteAction({
        inviteId,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to revoke invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Manage invitations that have not been accepted yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingInvites.length === 0 ? (
          <p className="text-muted-foreground">No pending invitations</p>
        ) : (
          <div className="divide-y">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="py-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{invite.email}</div>
                  <div className="text-sm text-muted-foreground">
                    Role:{" "}
                    {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeInvite(invite.id)}
                  disabled={isLoading}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
