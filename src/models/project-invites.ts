import { z } from "zod";
import { ProjectRole } from "./project-members";

export enum ProjectInviteStatus {
  Pending = "pending",
  Accepted = "accepted",
  Rejected = "rejected",
  Revoked = "revoked",
}

export const PROJECT_INVITE_STATUSES = Object.values(ProjectInviteStatus);

export const inviteUserSchema = z.object({
  projectId: z.string().uuid(),
  email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(ProjectRole),
});

export const INVITE_EXPIRATION_TIME_MS = 1000 * 60 * 60 * 24 * 30; // 7 days

export enum InviteResponse {
  Accept = "accept",
  Decline = "decline",
}
