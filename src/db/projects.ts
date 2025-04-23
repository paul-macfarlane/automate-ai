import { eq, desc, count } from "drizzle-orm";
import { projects, projectMembers } from "./schema";
import {
  withDb,
  withTransaction,
  DbContext,
  TransactionContext,
} from "./transaction";
import { User } from "./users";
import { ProjectMember } from "./project-members";

export type Project = typeof projects.$inferSelect;
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

export type UpdateProjectValues = {
  title?: string;
  description?: string;
  icon?: string;
};

export type UpdateProjectParams = {
  projectId: string;
  values: UpdateProjectValues;
};

export const updateProject = withTransaction(
  async (
    tx: TransactionContext,
    params: UpdateProjectParams
  ): Promise<Project> => {
    const { projectId, values } = params;
    const queryResult = await tx
      .update(projects)
      .set({
        title: values.title,
        description: values.description === "" ? null : values.description,
        icon: values.icon === "" ? null : values.icon,
      })
      .where(eq(projects.id, projectId))
      .returning();

    return queryResult[0];
  }
);

export type SelectProjectWithMemberParams = {
  projectId: string;
  userId: string;
};

export type ProjectWithMember = Project & {
  member: ProjectMember;
};

export const selectProjectWithMember = withDb(
  async (
    dbContext: DbContext,
    { projectId, userId }: SelectProjectWithMemberParams
  ): Promise<ProjectWithMember | undefined> => {
    const project = await dbContext.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        members: {
          where: eq(projectMembers.userId, userId),
        },
      },
    });
    if (!project) {
      return undefined;
    }

    return { ...project, member: project.members[0] };
  }
);

export const deleteProject = withTransaction(
  async (tx: TransactionContext, projectId: string): Promise<void> => {
    await tx.delete(projects).where(eq(projects.id, projectId));
  }
);
