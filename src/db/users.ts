import { eq } from "drizzle-orm";
import { users } from "./schema";
import { withTransaction, TransactionContext } from "./transaction";

export type User = typeof users.$inferSelect;

export type InsertUserValues = typeof users.$inferInsert;

export type UpdateUserValues = {
  userId: string;
  name?: string | null;
  image?: string | null;
};

export const updateUser = withTransaction(
  async (tx: TransactionContext, params: UpdateUserValues): Promise<User> => {
    const queryResult = await tx
      .update(users)
      .set({
        name: params.name,
        image: params.image,
      })
      .where(eq(users.id, params.userId))
      .returning();
    return queryResult[0];
  }
);
