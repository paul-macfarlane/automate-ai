import { eq, desc, count } from "drizzle-orm";
import { projects, projectMembers } from "./schema";
import {
  withDb,
  withTransaction,
  DbContext,
  TransactionContext,
} from "./transaction";
import { User } from "./users";

export type Project = typeof projects.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;

export type UserProject = {
  project: Project;
  role: ProjectMember["role"];
  memberCount: number;
};

export type ProjectWithMembers = Project & {
  members: (ProjectMember & {
    user: User;
  })[];
};

export const selectUserProjects = withDb(
  async (dbContext: DbContext, userId: string): Promise<UserProject[]> => {
    return dbContext
      .select({
        project: projects,
        role: projectMembers.role,
        memberCount: count(projectMembers.id).as("memberCount"),
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId))
      .groupBy(projects.id, projectMembers.role)
      .orderBy(desc(projects.updatedAt));
  }
);

export const selectProjectWithMembers = withDb(
  async (
    dbContext: DbContext,
    projectId: string
  ): Promise<ProjectWithMembers | undefined> => {
    return dbContext.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });
  }
);

export type InsertProjectValues = typeof projects.$inferInsert;

export const insertProject = withTransaction(
  async (
    tx: TransactionContext,
    values: InsertProjectValues
  ): Promise<Project> => {
    const queryResult = await tx
      .insert(projects)
      .values({
        title: values.title,
        description: values.description || null,
        icon: values.icon || null,
        createdById: values.createdById,
      })
      .returning();

    return queryResult[0];
  }
);

export type InsertProjectMemberValues = typeof projectMembers.$inferInsert;

export const insertProjectMember = withTransaction(
  async (
    tx: TransactionContext,
    values: InsertProjectMemberValues
  ): Promise<ProjectMember> => {
    const queryResult = await tx
      .insert(projectMembers)
      .values({
        userId: values.userId,
        role: values.role,
        projectId: values.projectId,
      })
      .returning();

    return queryResult[0];
  }
);
