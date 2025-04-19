import { eq } from "drizzle-orm";
import { users } from "./schema";
import { withTransaction, TransactionContext } from "./transaction";

export type User = typeof users.$inferSelect;

export type InsertUserValues = typeof users.$inferInsert;

export type UpdateUserValues = {
  userId: string;
  name?: string | null;
  image?: string | null;
  timezone?: string;
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
