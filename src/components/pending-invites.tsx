"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getInitials } from "@/utils";
import { formatDateShort } from "@/dates";
import { Timezone } from "@/timezones";
import { ProjectInviteWithInviter } from "@/db/project-invites";
import { respondToInviteAction } from "@/actions/project-invites";
import { InviteResponse } from "@/models/project-invites";

interface PendingInvitesProps {
  invites: ProjectInviteWithInviter[];
}

export function PendingInvites({ invites }: PendingInvitesProps) {
  const router = useRouter();
  const [processingInvites, setProcessingInvites] = useState<Set<string>>(
    new Set()
  );

  if (invites.length === 0) {
    return null;
  }

  const handleRespondToInvite = async (
    inviteId: string,
    response: InviteResponse
  ) => {
    if (processingInvites.has(inviteId)) return;

    try {
      setProcessingInvites((prev) => new Set(prev).add(inviteId));

      const result = await respondToInviteAction({
        inviteId,
        response,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to process the invitation");
    } finally {
      setProcessingInvites((prev) => {
        const updated = new Set(prev);
        updated.delete(inviteId);
        return updated;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {invites.map((invite) => (
            <div
              key={invite.id}
              className="py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={invite.inviter.image || undefined}
                    alt={invite.inviter.name || "Inviter"}
                  />
                  <AvatarFallback>
                    {getInitials(invite.inviter.name || "", "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    Invitation from{" "}
                    {invite.inviter.name || invite.inviter.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Role:{" "}
                      <Badge variant="outline">
                        {invite.role.charAt(0).toUpperCase() +
                          invite.role.slice(1)}
                      </Badge>
                    </span>
                    <span>•</span>
                    <span>
                      Expires:{" "}
                      {formatDateShort(
                        invite.expiresAt,
                        Timezone.AMERICA_NEW_YORK
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() =>
                    handleRespondToInvite(invite.id, InviteResponse.Accept)
                  }
                  disabled={processingInvites.has(invite.id)}
                  size="sm"
                >
                  Accept
                </Button>
                <Button
                  onClick={() =>
                    handleRespondToInvite(invite.id, InviteResponse.Decline)
                  }
                  disabled={processingInvites.has(invite.id)}
                  variant="outline"
                  size="sm"
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
