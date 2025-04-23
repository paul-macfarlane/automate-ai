import { ProjectRole } from "@/models/project-members";
import { and, eq } from "drizzle-orm";
import { projectMembers, users } from "./schema";
import {
  withTransaction,
  TransactionContext,
  withDb,
  DbContext,
} from "./transaction";

export type ProjectMember = typeof projectMembers.$inferSelect;

export type UpdateProjectMemberRoleParams = {
  memberId: string;
  role: ProjectRole;
};

export const updateProjectMemberRole = withTransaction(
  async (
    tx: TransactionContext,
    { memberId, role }: UpdateProjectMemberRoleParams
  ): Promise<ProjectMember | undefined> => {
    const queryResult = await tx
      .update(projectMembers)
      .set({ role })
      .where(eq(projectMembers.id, memberId))
      .returning();

    return queryResult[0];
  }
);

export const deleteProjectMember = withTransaction(
  async (tx: TransactionContext, memberId: string): Promise<void> => {
    await tx.delete(projectMembers).where(eq(projectMembers.id, memberId));
  }
);

export const selectProjectMember = withDb(
  async (
    dbContext: DbContext,
    memberId: string
  ): Promise<ProjectMember | undefined> => {
    return dbContext.query.projectMembers.findFirst({
      where: eq(projectMembers.id, memberId),
    });
  }
);
export type SelectProjectMemberByEmailParams = {
  email: string;
  projectId: string;
};

export const selectProjectMemberByEmail = withDb(
  async (
    dbContext: DbContext,
    { email, projectId }: SelectProjectMemberByEmailParams
  ): Promise<ProjectMember | undefined> => {
    const queryResult = await dbContext
      .select({
        projectMember: projectMembers,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(
        and(eq(projectMembers.projectId, projectId), eq(users.email, email))
      );

    return queryResult[0]?.projectMember;
  }
);
