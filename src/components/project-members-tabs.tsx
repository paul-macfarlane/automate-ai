"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProjectWithMembers } from "@/db/projects";
import { PROJECT_ROLES, ProjectRole } from "@/models/projects";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inviteUserAction,
  revokeInviteAction,
  searchProjectInviteCandidatesAction,
} from "@/actions/project-invites";
import { User } from "@/db/users";
import { ProjectInvite } from "@/db/project-invites";
import { useRouter } from "next/navigation";

type ProjectMembersTabsProps = {
  project: ProjectWithMembers;
  currentUserId: string;
  pendingInvites?: ProjectInvite[];
};

export function ProjectMembersTabs({
  project,
  currentUserId,
  pendingInvites = [],
}: ProjectMembersTabsProps) {
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
        projectId: project.id,
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

  const handleRoleChange = (memberId: string, newRole: string) => {
    // This would be replaced with actual API call
    toast.success(`Role updated to ${newRole}`);
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    // This would be replaced with actual API call
    toast.success(`Removed ${name} from project`);
  };

  const handleSearchUsers = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await searchProjectInviteCandidatesAction({
        query,
        projectId: project.id,
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Project Members
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage team members for {project.title}
        </p>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invite">Invite</TabsTrigger>
          <TabsTrigger value="pending">Pending Invites</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
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
                          {member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite">
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
                                <div className="text-sm font-medium">
                                  {user.name}
                                </div>
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
                      onValueChange={(value) =>
                        setInviteRole(value as ProjectRole)
                      }
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
                      <span className="font-medium">Editor:</span> Can edit
                      project but not manage members
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
        </TabsContent>

        <TabsContent value="pending">
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
                          {invite.role.charAt(0).toUpperCase() +
                            invite.role.slice(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expires:{" "}
                          {new Date(invite.expiresAt).toLocaleDateString()}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
