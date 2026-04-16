# Implementation Plan: Catalogue Backend

## Overview

Implement the four sub-domain modules of the catalogue backend: `catalogue`, `suppliers`, `supplier-quotes`, and `quote-history`. Each module follows the schema → service → controller order. The route file (`catalogue.route.ts`) is already complete and is excluded from these tasks.

## Tasks

- [x] 1. Implement the `catalogue` module

  - [x] 1.1 Implement `catalogue.schema.ts`
    - Define `getCatalogueSchema` with `organizationId`, `pageIndex`, `pageSize`, `searchQuery`
    - Define `catalogueIdSchema` with `catalogueId` as a non-empty string
    - Define `createCatalogueSchema` with `name`, `category` (CatalogueCategory enum), `unit`, `defaultLeadTime`
    - Define `editCatalogueSchema` as `createCatalogueSchema.partial()`
    - Export all inferred TypeScript types
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

  - [x] 1.2 Implement `catalogue.service.ts`
    - Implement `getCatalogue(orgId, pageIndex, pageSize, search)` — paginated, case-insensitive name search, scoped to org
    - Implement `getCatalogueById(orgId, catalogueId)` — throws `MissingError` if not found
    - Implement `createCatalogue(orgId, input)` — scopes to org, catches Prisma P2002 and throws `ConflictError`
    - Implement `editCatalogue(orgId, catalogueId, input)` — verifies existence, catches P2002 for name conflict
    - Implement `deleteCatalogue(orgId, catalogueId)` — checks `SupplierQuote` and `RequisitionItem` counts before hard-deleting; throws `ConflictError` if either count > 0
    - Implement `getQuotesByCatalogueId(orgId, catalogueId)` — verifies item exists, returns quotes with supplier name
    - Implement `getSuppliersByCatalogueId(orgId, catalogueId)` — verifies item exists, returns distinct active suppliers via quotes
    - Convert all Prisma `Decimal` fields (`truePrice`, `standardRate`) to `number` using `Number()` before returning
    - _Requirements: 2.3–2.5, 3.2–3.3, 4.3–4.4, 5.2–5.4, 6.2–6.6, 7.2–7.4, 8.2–8.4, 24.1_

  - [x] 1.3 Implement `catalogue.controller.ts`
    - Implement `getCatalogue` — validates query with `getCatalogueSchema`, returns 200 with `data`, `count`, `pageIndex`, `pageSize`
    - Implement `getCatalogueById` — validates params, returns 200 with `data`
    - Implement `createCatalogue` — validates body, returns 201 with `data`
    - Implement `editCatalogue` — validates params + body, returns 200 with `data`
    - Implement `deleteCatalogue` — validates params, returns 200 with `success` and `message`
    - Implement `getQuotesByCatalogueId` — validates params, returns 200 with `data` and `count`
    - Implement `getSuppliersByCatalogueId` — validates params, returns 200 with `data` and `count`
    - Map `ValidationError` → 400, `MissingError` → 404, `ConflictError` → 409, unknown → 500 with Winston logger
    - _Requirements: 2.1–2.2, 2.6, 3.1, 3.4–3.5, 4.1–4.2, 4.5–4.6, 5.1, 5.5, 6.1, 6.7–6.8, 7.1, 7.5, 8.1, 8.5, 25.1–25.4_

  - [x] 1.4 Diagnostics check — `catalogue` module
    - Run TypeScript diagnostics on `catalogue.schema.ts`, `catalogue.service.ts`, `catalogue.controller.ts`
    - Resolve all type errors before proceeding
    - Ensure all tests pass, ask the user if questions arise.

- [x] 2. Implement the `suppliers` module

  - [x] 2.1 Implement `suppliers.schema.ts`
    - Define `getSuppliersSchema` with `organizationId`, `pageIndex`, `pageSize`, `searchQuery`, `includeDeleted`
    - Define `supplierIdSchema` with `supplierId` as a non-empty string
    - Define `createSupplierSchema` with `name` (required) and optional `email`, `phone`, `contactPerson`, `address`
    - Define `editSupplierSchema` as `createSupplierSchema.partial()`
    - Export all inferred TypeScript types
    - _Requirements: 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1, 16.1_

  - [x] 2.2 Implement `suppliers.service.ts`
    - Implement `getSuppliers(orgId, pageIndex, pageSize, search, includeDeleted)` — filters `deletedAt: null` when `includeDeleted` is false
    - Implement `getSupplierById(orgId, supplierId)` — includes soft-deleted; throws `MissingError` if not found
    - Implement `createSupplier(orgId, input)` — scopes to org, catches P2002 for name conflict (including soft-deleted)
    - Implement `editSupplier(orgId, supplierId, input)` — verifies supplier is active (not soft-deleted); throws `MissingError` if deleted or missing; catches P2002 for name conflict
    - Implement `archiveSupplier(orgId, supplierId)` — verifies active; sets `deletedAt` to `new Date()`; throws `ConflictError` if already archived
    - Implement `restoreSupplier(orgId, supplierId)` — verifies soft-deleted; sets `deletedAt` to null; throws `ConflictError` if already active
    - Implement `getQuotesBySupplierId(orgId, supplierId)` — verifies supplier exists, returns quotes with catalogue item name and category
    - Implement `getCatalogueItemsBySupplierId(orgId, supplierId)` — verifies supplier exists, returns distinct catalogue items via quotes
    - _Requirements: 9.2–9.6, 10.2–10.3, 11.3–11.4, 12.2–12.4, 13.2–13.5, 14.2–14.5, 15.2–15.4, 16.2–16.4, 24.2_

  - [x] 2.3 Implement `suppliers.controller.ts`
    - Implement `getSuppliers` — validates query, returns 200 with `data`, `count`, `pageIndex`, `pageSize`
    - Implement `getSupplierById` — validates params, returns 200 with `data`
    - Implement `createSupplier` — validates body, returns 201 with `data`
    - Implement `editSupplier` — validates params + body, returns 200 with `data`
    - Implement `archiveSupplier` — validates params, returns 200 with `success` and `message`
    - Implement `restoreSupplier` — validates params, returns 200 with `data`
    - Implement `getQuotesBySupplierId` — validates params, returns 200 with `data` and `count`
    - Implement `getCatalogueItemsBySupplierId` — validates params, returns 200 with `data` and `count`
    - Apply consistent error mapping: `ValidationError` → 400, `MissingError` → 404, `ConflictError` → 409, unknown → 500
    - _Requirements: 9.1, 9.7, 10.1, 10.4, 11.1–11.2, 11.5–11.6, 12.1, 12.5, 13.1, 13.6, 14.1, 14.6, 15.1, 15.5, 16.1, 16.5, 25.5_

  - [x] 2.4 Diagnostics check — `suppliers` module
    - Run TypeScript diagnostics on `suppliers.schema.ts`, `suppliers.service.ts`, `suppliers.controller.ts`
    - Resolve all type errors before proceeding
    - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Implement the `supplier-quotes` module

  - [x] 3.1 Implement `supplierQuotes.schema.ts`
    - Define `getSupplierQuotesSchema` with `organizationId`, `pageIndex`, `pageSize`, optional `catalogueId`, optional `supplierId`
    - Define `quoteIdSchema` with `quoteId` as a non-empty string
    - Define `createSupplierQuoteSchema` with `catalogueId`, `supplierId`, `truePrice`, `standardRate`, `inventory`, optional `leadTime`
    - Define `editSupplierQuoteSchema` with all fields optional: `truePrice`, `standardRate`, `inventory`, `leadTime`, `changeReason`
    - Export all inferred TypeScript types
    - _Requirements: 17.1, 18.1, 19.1, 20.1, 21.1_

  - [x] 3.2 Implement `supplierQuotes.service.ts`
    - Implement `getSupplierQuotes(orgId, pageIndex, pageSize, catalogueId?, supplierId?)` — scopes via `catalogue.organizationId`; applies optional filters; includes supplier name and catalogue name
    - Implement `getSupplierQuoteById(orgId, quoteId)` — verifies ownership via `catalogue.organizationId`; throws `MissingError` if not found; includes supplier and catalogue details
    - Implement `createSupplierQuote(orgId, input)` — verifies catalogue belongs to org; verifies supplier belongs to org and is active; catches P2002 for duplicate `[catalogueId, supplierId]`; does NOT create history on creation
    - Implement `editSupplierQuote(orgId, quoteId, input, changedByMemberId?)` — verifies quote exists; captures current state into `SupplierQuoteHistory`; updates quote — both in a single `prisma.$transaction`
    - Implement `deleteSupplierQuote(orgId, quoteId)` — verifies quote exists; checks for `RequisitionItem` references via `assignedSupplierId`; hard-deletes if no references
    - Convert all `Decimal` fields to `number` using `Number()` before returning
    - _Requirements: 17.2–17.5, 18.2–18.4, 19.3–19.8, 20.2–20.5, 21.2–21.5, 24.3_

  - [x] 3.3 Implement `supplierQuotes.controller.ts`
    - Implement `getSupplierQuotes` — validates query, returns 200 with `data`, `count`, `pageIndex`, `pageSize`
    - Implement `getSupplierQuoteById` — validates params, returns 200 with `data`
    - Implement `createSupplierQuote` — validates body, returns 201 with `data`
    - Implement `editSupplierQuote` — validates params + body, returns 200 with `data`; returns 500 on transaction failure
    - Implement `deleteSupplierQuote` — validates params, returns 200 with `success` and `message`
    - Apply consistent error mapping: `ValidationError` → 400, `MissingError` → 404, `ConflictError` → 409, unknown → 500
    - _Requirements: 17.1, 17.6, 18.1, 18.4, 19.1–19.2, 19.9, 20.1, 20.6–20.7, 21.1, 21.6–21.7, 25.5_

  - [x] 3.4 Diagnostics check — `supplier-quotes` module
    - Run TypeScript diagnostics on `supplierQuotes.schema.ts`, `supplierQuotes.service.ts`, `supplierQuotes.controller.ts`
    - Resolve all type errors before proceeding
    - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the `quote-history` module

  - [x] 4.1 Implement `quoteHistory.schema.ts`
    - Define `getQuoteHistorySchema` with `quoteId` and `organizationId` as non-empty strings
    - Define `getQuoteHistoryByIdSchema` with `quoteId`, `historyId`, and `organizationId` as non-empty strings
    - Export all inferred TypeScript types
    - _Requirements: 22.1, 23.1_

  - [x] 4.2 Implement `quoteHistory.service.ts`
    - Implement `getQuoteHistory(orgId, quoteId)` — verifies parent quote exists via `catalogue.organizationId`; returns all history records ordered by `changedAt` descending; throws `MissingError` if quote not found
    - Implement `getQuoteHistoryById(orgId, quoteId, historyId)` — verifies parent quote exists; queries history record scoped to `quoteId`; throws `MissingError` if either quote or history entry not found
    - Convert `Decimal` fields to `number` using `Number()` before returning
    - _Requirements: 22.2–22.4, 23.2–23.5, 24.4_

  - [x] 4.3 Implement `quoteHistory.controller.ts`
    - Implement `getQuoteHistory` — validates params with `getQuoteHistorySchema`, returns 200 with `data` and `count`
    - Implement `getQuoteHistoryById` — validates params with `getQuoteHistoryByIdSchema`, returns 200 with `data`
    - Apply consistent error mapping: `ValidationError` → 400, `MissingError` → 404, `ConflictError` → 409, unknown → 500
    - _Requirements: 22.1, 22.5, 23.1, 23.6, 25.5_

  - [x] 4.4 Diagnostics check — `quote-history` module
    - Run TypeScript diagnostics on `quoteHistory.schema.ts`, `quoteHistory.service.ts`, `quoteHistory.controller.ts`
    - Resolve all type errors before proceeding
    - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Final integration checkpoint
  - Run TypeScript diagnostics across the entire `server/src/modules/catalogue/` directory
  - Verify all modules compile cleanly together with `catalogue.route.ts`
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The design document has a Correctness Properties section, but per the implementation brief no tests are required — property test sub-tasks are omitted
- `catalogue.route.ts` is already implemented and must not be modified
- All service methods must scope queries to `organizationId`; never trust org data from client payloads
- Prisma `Decimal` fields (`truePrice`, `standardRate`) must be converted with `Number()` before returning from any service
- Tenant scoping for `SupplierQuote` and `SupplierQuoteHistory` is done by joining through `catalogue.organizationId`, not a direct field
