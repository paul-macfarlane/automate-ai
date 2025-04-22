"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils";
import { ProjectRole } from "@/models/projects";
import { PROJECT_ROLES } from "@/models/projects";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "@/db/users";
import { toast } from "sonner";
import {
  inviteUserAction,
  searchProjectInviteCandidatesAction,
} from "@/actions/project-invites";

export type InviteMembersTabProps = {
  projectId: string;
};

export default function InviteMembersTab({ projectId }: InviteMembersTabProps) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.Viewer);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await inviteUserAction({
        projectId: projectId,
        email: inviteEmail,
        role: inviteRole,
      });

      if (result.success) {
        toast.success(result.message);
        setInviteEmail("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to send invitation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await searchProjectInviteCandidatesAction({
        query,
        projectId: projectId,
      });

      if (result.success) {
        setSearchResults(result.users);
      } else {
        toast.error(result.message);
        setSearchResults([]);
      }
    } catch {
      toast.error("Failed to search for users");
      setSearchResults([]);
    }
  };

  const handleSelectUser = (email: string) => {
    setInviteEmail(email);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Invite new members to collaborate on this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSendInvite}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="team@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full"
                />
                <Input
                  type="text"
                  placeholder="Search users by email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchUsers(e.target.value);
                  }}
                  className="w-full mt-2"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-md max-h-60 overflow-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectUser(user.email!)}
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {getInitials(user.name || "", "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as ProjectRole)}
              >
                <SelectTrigger className="w-full">
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
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Admin:</span> Full access to
                manage project and members
                <br />
                <span className="font-medium">Editor:</span> Can edit project
                but not manage members
                <br />
                <span className="font-medium">Viewer:</span> Can only view
                project
              </p>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
