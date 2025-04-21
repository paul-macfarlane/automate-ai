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
import { useMemo } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProjectMembersUIProps = {
  project: ProjectWithMembers;
  currentUserId: string;
};

export function ProjectMembersUI({
  project,
  currentUserId,
}: ProjectMembersUIProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<ProjectRole>(ProjectRole.Viewer);
  const [linkRole, setLinkRole] = useState<ProjectRole>(ProjectRole.Viewer);
  const [inviteLink, setInviteLink] = useState(
    `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/projects/invite/${project.id}?role=viewer`
  );

  const currentUserRole = useMemo(() => {
    const member = project.members.find(
      (member) => member.user.id === currentUserId
    );
    return member?.role;
  }, [project.members, currentUserId]);

  const isAdmin = currentUserRole === ProjectRole.Admin;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // This would be replaced with actual API call
    toast.success(`Invitation sent to ${inviteEmail} with ${inviteRole} role`);
    setInviteEmail("");
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    // This would be replaced with actual API call
    toast.success(`Role updated to ${newRole}`);
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    // This would be replaced with actual API call
    toast.success(`Removed ${name} from project`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  const updateLinkRole = (role: ProjectRole) => {
    setLinkRole(role);
    setInviteLink(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/projects/invite/${project.id}?role=${role}`
    );
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
                      {isAdmin && member.user.id !== currentUserId ? (
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
                    <Input
                      type="email"
                      placeholder="team@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      className="w-full"
                    />
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
                    <Button type="submit">Send Invitation</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invite Link</CardTitle>
                <CardDescription>
                  Share this link with others to invite them to the project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="flex-1" />
                  <Button variant="outline" onClick={handleCopyLink}>
                    Copy
                  </Button>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium block mb-2">
                    Default Role for Link Invites
                  </label>
                  <Select
                    value={linkRole}
                    onValueChange={(value) =>
                      updateLinkRole(value as ProjectRole)
                    }
                  >
                    <SelectTrigger className="w-full max-w-xs">
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
