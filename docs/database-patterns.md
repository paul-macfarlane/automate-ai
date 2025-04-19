# Database Pattern Guide

This guide documents the database abstraction patterns used throughout the Automanager application. Our database layer is designed to balance performance, type safety, and maintainability.

## Core Concepts

Our database layer follows these core principles:

1. **Transactional integrity** for write operations
2. **Optimized performance** for read operations
3. **Reusable components** to avoid code duplication
4. **Type safety** throughout the data layer

## Key Components

### Transaction Context

We use two main types of database contexts:

```typescript
// The transaction context for operations that must run in a transaction
export type TransactionContext = SQLiteTransaction<...>;

// A flexible database context that can be either a transaction or the main db
export type DbContext = TransactionContext | typeof db;
```

### Higher-Order Functions

The database layer is built around two primary higher-order functions:

#### `withDb`

For operations that can work with or without a transaction:

```typescript
export const selectUserProjects = withDb(
  async (dbContext: DbContext, userId: string): Promise<UserProject[]> => {
    // Query implementation here
  }
);
```

- **When to use**: For read operations or operations that don't require transaction guarantees
- **Benefits**: Can run standalone or as part of an existing transaction
- **Usage**: `const projects = await selectUserProjects(userId);`

#### `withTransaction`

For operations that always need transaction guarantees:

```typescript
export const insertProject = withTransaction(
  async (
    tx: TransactionContext,
    values: InsertProjectValues
  ): Promise<Project> => {
    // Transaction-protected implementation here
  }
);
```

- **When to use**: For write operations (insert/update/delete) or multi-step operations
- **Benefits**: Automatic transaction management, guaranteed consistency
- **Usage**: `const project = await insertProject(values);`

### Explicit Transactions

For explicitly defined transactions spanning multiple operations:

```typescript
const result = await transaction(async (tx) => {
  const project = await insertProject(values, tx);
  await insertProjectMember({ projectId: project.id, ... }, tx);
  return project;
});
```

## Naming Conventions

Our functions follow this naming pattern:

- **Read operations**: `select*` prefix (e.g., `selectUserProjects`, `selectProjectWithMembers`)
- **Write operations**: `insert*`, `update*`, or `delete*` prefix (e.g., `insertProject`, `updateUser`)

## Type Definitions

We use these types to maintain consistency:

1. **Model Types**: Direct database entity representations

   ```typescript
   export type Project = typeof projects.$inferSelect;
   export type User = typeof users.$inferSelect;
   ```

2. **Input Types**: For create/update operations

   ```typescript
   export type InsertProjectValues = typeof projects.$inferInsert;
   export type UpdateUserValues = {
     userId: string;
     name?: string | null /* ... */;
   };
   ```

3. **Composite Types**: For joined data
   ```typescript
   export type ProjectWithMembers = Project & {
     members: (ProjectMember & { user: User })[];
   };
   ```

## Best Practices

### When to Use Transactions

- **Always use transactions** for:

  - Any operation that modifies data (insert/update/delete)
  - Operations that require consistency across multiple tables
  - Any critical business logic that can't tolerate partial updates

- **Consider skipping transactions** for:
  - Simple read operations (for performance)
  - Reporting/analytics queries
  - Non-critical data retrieval

### Composing Database Operations

You can compose operations by passing the transaction context:

```typescript
// A complex operation composed of smaller ones
export async function createProjectWithOwner(params) {
  return transaction(async (tx) => {
    // Use existing functions with the transaction context
    const project = await insertProject(params.project, tx);
    await insertProjectMember(
      {
        projectId: project.id,
        userId: params.userId,
        role: "admin",
      },
      tx
    );
    return project;
  });
}
```

### Error Handling

Transactions automatically roll back on error:

```typescript
try {
  await insertProject(values);
} catch (error) {
  // The transaction has already been rolled back at this point
  console.error("Failed to create project:", error);
}
```

## Example Implementations

### Read Operation Example

```typescript
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
```

### Write Operation Example

```typescript
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
```

## Migration Guide

When migrating existing code to use this pattern:

1. **For existing read functions**:

   - Wrap with `withDb`
   - Add `DbContext` as the first parameter
   - Update function name to follow naming conventions

2. **For existing write functions**:

   - Wrap with `withTransaction`
   - Add `TransactionContext` as the first parameter
   - Update function name to follow naming conventions

3. **For transaction wrappers**:
   - Replace with our `transaction` utility function
   - Pass the transaction context to each operation

## Performance Considerations

- The `withDb` pattern adds minimal overhead for reads
- For write operations, the transaction guarantees are worth the slight performance cost
- You can optimize read-heavy applications by keeping transactions focused only on write operations
