"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ProjectWithMembers } from "@/db/projects";
import { getInitials } from "@/utils";
import { PROJECT_ROLES } from "@/models/projects";

export type ManageMembersTabProps = {
  project: ProjectWithMembers;
  currentUserId: string;
};

export default function ManageMembersTab({
  project,
  currentUserId,
}: ManageMembersTabProps) {
  const handleRoleChange = (memberId: string, newRole: string) => {
    // This would be replaced with actual API call
    toast.success(`Role updated to ${newRole}`);
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    // This would be replaced with actual API call
    toast.success(`Removed ${name} from project`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Members</CardTitle>
        <CardDescription>
          Manage existing team members and their roles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {project.members.map((member) => (
            <div
              key={member.id}
              className="py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.user.image || undefined}
                    alt={member.user.name || "User"}
                  />
                  <AvatarFallback>
                    {getInitials(member.user.name || "", "U")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {member.user.name}
                    {member.user.id === currentUserId && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {member.user.id !== currentUserId ? (
                  <>
                    <Select
                      defaultValue={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleRemoveMember(
                          member.id,
                          member.user.name || "User"
                        )
                      }
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <Badge
                    variant={
                      member.role === "admin"
                        ? "default"
                        : member.role === "editor"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
