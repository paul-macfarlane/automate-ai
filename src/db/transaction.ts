import { db } from ".";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";
import { ResultSet } from "@libsql/client";
import { ExtractTablesWithRelations } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Type alias for the transaction context type
 *
 * This makes it easier to swap the underlying ORM or database later.
 * Just change this type definition instead of updating all transaction usages.
 */
export type TransactionContext = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

/**
 * Type alias for a database context that might be a transaction or the main db instance
 */
export type DbContext = TransactionContext | typeof db;

/**
 * Transaction wrapper for database operations
 *
 * This utility allows running multiple database operations in a transaction,
 * ensuring they either all succeed or all fail together.
 *
 * @param fn The function containing database operations to run in a transaction
 * @returns A promise that resolves with the return value of the function
 *
 * @example
 * ```ts
 * const result = await transaction(async (tx) => {
 *   await tx.insert(projects).values({ ... });
 *   await tx.insert(projectMembers).values({ ... });
 *   return { success: true };
 * });
 * ```
 */
export async function transaction<T>(
  fn: (tx: TransactionContext) => Promise<T>
): Promise<T> {
  let result: T;

  await db.transaction(async (tx) => {
    result = await fn(tx);
  });

  return result!;
}

/**
 * Creates a repository function that can operate with or without a transaction
 *
 * This is a higher-order function that wraps your database logic to make it
 * work with either a transaction or the default database connection. This way,
 * you only need to write your query logic once.
 *
 * @param fn The function implementing your database operation
 * @returns A function that works with or without a transaction context
 *
 * @example
 * ```ts
 * // Define a reusable repository function
 * export const getProject = withDb(
 *   async (db, projectId: string) => {
 *     return db.query.projects.findFirst({
 *       where: eq(projects.id, projectId),
 *     });
 *   }
 * );
 *
 * // For a single query (uses default db)
 * const project = await getProject("project-123");
 *
 * // Inside a transaction (uses transaction context)
 * await transaction(async (tx) => {
 *   const project = await getProject("project-123", tx);
 *   // other operations in the same transaction...
 * });
 * ```
 */
export function withDb<TParams, TResult>(
  fn: (dbContext: DbContext, params: TParams) => Promise<TResult>
): (params: TParams, dbContext?: DbContext) => Promise<TResult> {
  return async (params: TParams, dbContext?: DbContext) => {
    // Use provided dbContext or fall back to the default db instance
    return fn(dbContext || db, params);
  };
}

/**
 * Creates a write operation that always uses a transaction
 *
 * This is similar to withDb, but ensures that write operations always run
 * within a transaction for data integrity, either using an existing transaction
 * or creating a new one if needed.
 *
 * @param fn The function implementing your database write operation
 * @returns A function that always runs within a transaction
 *
 * @example
 * ```ts
 * // Define a repository function for a write operation
 * export const createProject = withTransaction(
 *   async (tx, { title, description, userId }) => {
 *     const projectId = nanoid();
 *
 *     await tx.insert(projects).values({
 *       id: projectId,
 *       title,
 *       description: description || null,
 *       createdById: userId,
 *     });
 *
 *     return { projectId };
 *   }
 * );
 *
 * // Called directly (creates its own transaction)
 * const { projectId } = await createProject({
 *   title: "New Project",
 *   userId: "123"
 * });
 *
 * // Called within an existing transaction
 * await transaction(async (tx) => {
 *   const { projectId } = await createProject({
 *     title: "New Project",
 *     userId: "123"
 *   }, tx);
 *   // other operations in the same transaction...
 * });
 * ```
 */
export function withTransaction<TParams, TResult>(
  fn: (tx: TransactionContext, params: TParams) => Promise<TResult>
): (params: TParams, tx?: TransactionContext) => Promise<TResult> {
  return async (params: TParams, tx?: TransactionContext) => {
    // If a transaction is provided, use it directly
    if (tx) {
      return fn(tx, params);
    }

    // Otherwise, create a new transaction
    return transaction((newTx) => fn(newTx, params));
  };
}
