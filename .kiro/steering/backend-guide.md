# Backend Steering Guide

Build production-quality Express + TypeScript backend code that is strict, explicit, and easy to maintain.

## Core principles

- Write clear, boring, predictable backend code.
- Prefer readability and correctness over cleverness.
- Keep controllers thin, services focused, and validation explicit.
- Preserve business data integrity; never implement destructive behavior casually.
- Optimize for maintainability by future developers, not short-term shortcuts.

## TypeScript rules

- Use modern TypeScript features and strict typing everywhere.
- Never use `any`.
- Prefer `unknown` over `any` when a value is truly unknown, then narrow it safely.
- Always annotate function parameters, return types for exported functions, and complex variables.
- Prefer `type` and `interface` intentionally; use `type` for unions/compositions and `interface` for object contracts that may be extended.
- Use discriminated unions where they improve clarity.
- Prefer `satisfies` for shape validation when useful.
- Avoid non-null assertions (`!`) unless there is a strong and proven reason.
- Avoid unnecessary type assertions (`as`) unless narrowing is impossible otherwise.
- Use enums only when already established in the codebase or database schema; otherwise prefer string unions where appropriate.

## Validation and input handling

- Validate every request boundary explicitly.
- Use Zod schemas for params, query, and body validation.
- Do not trust `req.body`, `req.params`, or `req.query` directly.
- Parse once at the boundary and pass validated data inward.
- Keep validation schemas aligned with the Prisma model and business rules.
- Return consistent 400 responses for validation failures.
- Coerce values intentionally, not implicitly.

## Express conventions

- Keep controllers thin.
- Controllers should only:
  - read request data,
  - validate input,
  - call service functions,
  - map domain errors to HTTP responses,
  - return JSON responses.
- Do not put business logic in controllers.
- Do not access Prisma directly from controllers.
- Keep route handlers async and consistent.
- Use early returns to reduce nesting.
- Keep response shapes predictable.

## Service layer rules

- Put business logic in services.
- Services should encapsulate Prisma access and domain behavior.
- A service function should do one coherent business task.
- Use transactions when an operation must succeed or fail as a unit.
- For multi-step writes, prefer `prisma.$transaction`.
- Make side effects explicit.
- Avoid giant service functions; break them into focused internal helpers when necessary.

## Error handling

- Use explicit domain errors for expected failure cases.
- Distinguish clearly between:
  - validation errors,
  - authorization errors,
  - not found errors,
  - conflict errors,
  - internal server errors.
- Never swallow errors silently.
- Log unexpected errors.
- Return safe client-facing error messages; do not leak internal details.
- Handle Prisma unique constraint and foreign key errors intentionally.
- Prefer predictable error mapping over generic catch-all behavior.

## Database and Prisma rules

- Use Prisma in a type-safe, explicit way.
- Never use loose, untyped `whereClause: any` style patterns.
- Build typed query objects where possible.
- Keep read queries lean; only include/select what the endpoint actually needs.
- Prefer `select` over broad `include` when only a few fields are needed.
- Preserve referential integrity intentionally.
- Do not hard-delete business-critical records unless explicitly required.
- For soft-deletable entities, filter out deleted records by default unless explicitly requesting archived data.
- For versioned entities, preserve history before mutating current records.
- Never overwrite important historical data without a reason.

## Soft delete rules

- Use soft delete for entities that must retain history.
- Prefer `deletedAt: DateTime?` over a simple boolean when deletion timing matters.
- Treat `deletedAt = null` as active.
- Default all normal queries to active records only.
- Add explicit paths or query flags for archived data when needed.
- Do not mix hard delete and soft delete behavior inconsistently for the same entity.

## Versioning rules

- For versioned records, preserve the previous state before updating the current state.
- History rows should capture the business fields that matter.
- Include audit metadata when available, such as:
  - changedAt,
  - changedBy,
  - changeReason.
- Keep current/live records easy to query.
- Keep history retrieval explicit and separate from current-state retrieval.

## Naming conventions

- Use descriptive names.
- Prefer full words over abbreviations unless the abbreviation is standard and obvious.
- Name booleans positively, e.g. `isActive`, `isRead`, `hasAccess`.
- Use verbs for functions and actions, nouns for models and DTOs.
- Make method names reflect behavior clearly, e.g. `createSupplierQuote`, `archiveSupplier`, `getCatalogueById`.
- Avoid ambiguous names like `handleData`, `updateStuff`, `itemInfo`.

## API design rules

- Keep endpoints resource-oriented and predictable.
- Use HTTP verbs semantically:
  - `GET` for reads,
  - `POST` for creation,
  - `PATCH` for partial updates,
  - `DELETE` for deletion/archive actions where appropriate.
- Prefer shallow nesting.
- Use nested read endpoints only when they improve clarity for related resources.
- Keep mutation logic canonical; avoid duplicating the same write behavior across multiple endpoint shapes.
- Return stable JSON structures.

## Authorization and tenancy

- Enforce role and tenant checks consistently.
- Never trust role or org data coming from client payloads.
- Always derive authorization context from trusted middleware.
- Scope organization-owned data by organization at every read and write boundary.
- Prevent cross-organization access in all queries, not just in controllers.
- Treat tenant scoping as non-optional.

## Response design

- Keep success responses consistent.
- Keep error responses consistent.
- Return only the data needed by the consumer.
- Avoid leaking internal fields unintentionally.
- For list endpoints, support consistent pagination patterns.
- For searchable endpoints, keep filtering explicit and validated.

## Code quality

- Prefer small, composable functions.
- Avoid deeply nested conditionals.
- Use guard clauses.
- Remove dead code and outdated comments.
- Do not leave misleading comments such as “NEW” once implementation is finalized.
- Keep comments for intent, not obvious syntax.
- Write code that explains itself first; use comments only where the business rule is non-obvious.

## Async and concurrency

- Use `await` deliberately.
- Use `Promise.all` only when operations are truly independent.
- Do not parallelize dependent writes.
- Wrap dependent multi-step mutations in transactions.
- Always consider race conditions around uniqueness and concurrent edits.

## Logging

- Log meaningful events and unexpected failures.
- Do not log sensitive data unnecessarily.
- Prefer structured, contextual logs.
- Include identifiers useful for tracing, such as organizationId, resourceId, and actorId where relevant.
- Keep logs concise and actionable.

## Maintainability

- Prefer explicitness over magic.
- Keep validation, business rules, persistence, and HTTP concerns separated.
- Refactor duplicated logic into helpers or services only when it improves clarity.
- Do not over-abstract too early.
- Match the existing codebase style where it is good, but improve weak patterns instead of copying them blindly.

## Testing mindset

- Write code that is easy to test.
- Keep pure business logic isolated where possible.
- Think through edge cases:
  - duplicate records,
  - archived records,
  - missing tenant context,
  - invalid IDs,
  - cross-organization access,
  - historical/versioned updates,
  - referential integrity failures.
- Treat data integrity as more important than convenience.

## Final standard

Every implementation should be:

- type-safe,
- validated,
- tenant-scoped,
- role-safe,
- transaction-aware where needed,
- history-preserving where required,
- free of `any`,
- easy to read and easy to extend.
