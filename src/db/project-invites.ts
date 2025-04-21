import { eq, and, gt } from "drizzle-orm";
import { projectInvites } from "./schema";
import { users } from "./schema";
import {
  withDb,
  withTransaction,
  DbContext,
  TransactionContext,
} from "./transaction";
import { User } from "./users";
import { ProjectInviteStatus } from "@/models/project-invites";

export type ProjectInvite = typeof projectInvites.$inferSelect;

export type ProjectInviteWithInviter = ProjectInvite & {
  inviter: User;
};

export type InsertProjectInviteValues = typeof projectInvites.$inferInsert;

export const insertProjectInvite = withTransaction(
  async (
    tx: TransactionContext,
    values: InsertProjectInviteValues
  ): Promise<ProjectInvite> => {
    const result = await tx.insert(projectInvites).values(values).returning();

    return result[0];
  }
);

export type SelectProjectInvitesByStatusParams = {
  projectId: string;
  status: ProjectInviteStatus;
};

export const selectProjectInvitesByStatus = withDb(
  async (
    dbContext: DbContext,
    { projectId, status }: SelectProjectInvitesByStatusParams
  ): Promise<ProjectInviteWithInviter[]> => {
    return dbContext
      .select({
        invite: projectInvites,
        inviter: users,
      })
      .from(projectInvites)
      .innerJoin(users, eq(projectInvites.inviterId, users.id))
      .where(
        and(
          eq(projectInvites.projectId, projectId),
          eq(projectInvites.status, status)
        )
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row.invite,
          inviter: row.inviter, // todo might not need this, TBD
        }))
      );
  }
);

export type SelectUserInvitesByEmailAndStatusParams = {
  email: string;
  status: ProjectInviteStatus;
  expiresAfter: Date;
};

export const selectUserInvitesByEmailAndStatus = withDb(
  async (
    dbContext: DbContext,
    { email, status, expiresAfter }: SelectUserInvitesByEmailAndStatusParams
  ): Promise<ProjectInviteWithInviter[]> => {
    return dbContext
      .select({
        invite: projectInvites,
        inviter: users,
      })
      .from(projectInvites)
      .innerJoin(users, eq(projectInvites.inviterId, users.id))
      .where(
        and(
          eq(projectInvites.email, email),
          eq(projectInvites.status, status),
          gt(projectInvites.expiresAt, expiresAfter)
        )
      )
      .then((rows) =>
        rows.map((row) => ({
          ...row.invite,
          inviter: row.inviter, // todo might not need this, TBD
        }))
      );
  }
);

export type SelectProjectInviteByEmailAndStatusParams = {
  email: string;
  status: ProjectInviteStatus;
  expiresAfter: Date;
  projectId: string;
};

export const selectProjectInviteByEmailAndStatus = withDb(
  async (
    dbContext: DbContext,
    {
      email,
      status,
      projectId,
      expiresAfter,
    }: SelectProjectInviteByEmailAndStatusParams
  ): Promise<ProjectInvite[]> => {
    const result = await dbContext.query.projectInvites.findMany({
      where: and(
        eq(projectInvites.email, email),
        eq(projectInvites.status, status),
        eq(projectInvites.projectId, projectId),
        gt(projectInvites.expiresAt, expiresAfter)
      ),
    });

    return result;
  }
);

export type UpdateProjectInviteParams = {
  inviteId: string;
  inviteeId?: string;
  status?: ProjectInviteStatus;
};

export const updateProjectInvite = withTransaction(
  async (
    tx: TransactionContext,
    { inviteId, inviteeId, status }: UpdateProjectInviteParams
  ): Promise<ProjectInvite> => {
    const result = await tx
      .update(projectInvites)
      .set({
        inviteeId,
        status,
        updatedAt: new Date(),
      })
      .where(eq(projectInvites.id, inviteId))
      .returning();

    return result[0];
  }
);

export const selectProjectInvite = withDb(
  async (
    dbContext: DbContext,
    inviteId: string
  ): Promise<ProjectInvite | undefined> => {
    const result = await dbContext.query.projectInvites.findFirst({
      where: eq(projectInvites.id, inviteId),
    });

    return result;
  }
);
