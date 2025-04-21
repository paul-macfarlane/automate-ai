import { eq, notInArray, sql, and } from "drizzle-orm";
import { users } from "./schema";
import {
  withTransaction,
  TransactionContext,
  DbContext,
  withDb,
} from "./transaction";
import { Timezone } from "@/timezones";
export type User = typeof users.$inferSelect;

export type InsertUserValues = typeof users.$inferInsert;

export type UpdateUserValues = {
  userId: string;
  name?: string | null;
  image?: string | null;
  timezone?: Timezone;
};

export const updateUser = withTransaction(
  async (tx: TransactionContext, params: UpdateUserValues): Promise<User> => {
    const queryResult = await tx
      .update(users)
      .set({
        name: params.name,
        image: params.image === "" ? null : params.image,
        timezone: params.timezone,
      })
      .where(eq(users.id, params.userId))
      .returning();
    return queryResult[0];
  }
);

export const selectUser = withTransaction(
  async (tx: TransactionContext, userId: string): Promise<User | undefined> => {
    const queryResult = await tx.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return queryResult;
  }
);

export type SearchUsersByEmailExcludingParams = {
  query: string;
  excludingUserIds: string[];
  limit?: number;
};

export const searchUsersByEmailExcluding = withDb(
  async (
    dbContext: DbContext,
    { query, excludingUserIds, limit = 5 }: SearchUsersByEmailExcludingParams
  ): Promise<User[]> => {
    if (!query || query.length < 3) {
      return [];
    }

    return dbContext
      .select()
      .from(users)
      .where(
        and(
          sql`${users.email} LIKE ${`%${query}%`}`,
          notInArray(users.id, excludingUserIds)
        )
      )
      .limit(limit);
  }
);
