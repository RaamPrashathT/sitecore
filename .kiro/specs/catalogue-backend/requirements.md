# Requirements Document

## Introduction

This document defines the requirements for the Catalogue backend module of Sitecore — a multi-tenant construction and engineering project management platform. The module exposes a REST API under `server/src/modules/catalogue/` and covers four sub-domains: catalogue items, suppliers, supplier quotes, and quote history. All data is scoped to the requesting organization and all routes require an authenticated ADMIN member.

## Glossary

- **Catalogue_Controller**: The Express controller layer for catalogue item endpoints.
- **Catalogue_Service**: The service layer that encapsulates Prisma access and business logic for catalogue items.
- **Catalogue_Schema**: The Zod validation schemas for catalogue item request data.
- **Supplier_Controller**: The Express controller layer for supplier endpoints.
- **Supplier_Service**: The service layer for supplier business logic and Prisma access.
- **Supplier_Schema**: The Zod validation schemas for supplier request data.
- **SupplierQuote_Controller**: The Express controller layer for supplier quote endpoints.
- **SupplierQuote_Service**: The service layer for supplier quote business logic and Prisma access.
- **SupplierQuote_Schema**: The Zod validation schemas for supplier quote request data.
- **QuoteHistory_Controller**: The Express controller layer for quote history endpoints.
- **QuoteHistory_Service**: The service layer for quote history retrieval.
- **QuoteHistory_Schema**: The Zod validation schemas for quote history request data.
- **Catalogue_Router**: The Express router that registers all catalogue module routes with the mandatory middleware chain.
- **CatalogueCategory**: An enum with values: `MATERIALS`, `LABOUR`, `EQUIPMENT`, `SUBCONTRACTORS`, `TRANSPORT`, `OVERHEAD`.
- **Organization**: A tenant in the multi-tenant system, identified by `organizationId` derived from `request.tenant.orgId`.
- **Soft_Delete**: A deletion strategy that sets `deletedAt` to the current timestamp rather than removing the database row.
- **Quote_Versioning**: The process of inserting the current state of a `SupplierQuote` into `SupplierQuoteHistory` before applying an update.
- **Middleware_Chain**: The ordered sequence `authorize → orgAuthorize → requiredRole("ADMIN")` applied to every route.
- **Pagination**: Query-parameter-driven result slicing using `index` (page index, default 0) and `size` (page size, default 10).

---

## Requirements

### Requirement 1: Route Registration and Middleware Enforcement

**User Story:** As a platform engineer, I want all catalogue routes to enforce authentication, tenant authorization, and ADMIN role checks, so that only authorized members can access or modify catalogue data.

#### Acceptance Criteria

1. THE Catalogue_Router SHALL apply the `authorize` middleware before `orgAuthorize` on every registered route.
2. THE Catalogue_Router SHALL apply `orgAuthorize` before `requiredRole("ADMIN")` on every registered route.
3. THE Catalogue_Router SHALL apply `requiredRole("ADMIN")` before the controller handler on every registered route.
4. THE Catalogue_Router SHALL register `/suppliers` and `/supplier-quotes` prefixed routes before `/:catalogueId` prefixed routes to prevent Express path collision.
5. WHEN a request arrives without a valid session, THE Catalogue_Router SHALL reject the request with HTTP 401 before reaching any controller.
6. WHEN a request arrives from a member whose role is not `ADMIN`, THE Catalogue_Router SHALL reject the request with HTTP 403 before reaching any controller.

---

### Requirement 2: Catalogue Item — List

**User Story:** As an ADMIN, I want to list catalogue items for my organization with pagination and search, so that I can browse and find items efficiently.

#### Acceptance Criteria

1. WHEN a `GET /` request is received, THE Catalogue_Controller SHALL extract `index`, `size`, and `search` from the query string and validate them using Catalogue_Schema.
2. WHEN query parameters are invalid, THE Catalogue_Controller SHALL return HTTP 400 with a descriptive error message.
3. WHEN query parameters are valid, THE Catalogue_Service SHALL query only catalogue items belonging to `request.tenant.orgId`.
4. THE Catalogue_Service SHALL apply case-insensitive name search when a non-empty `search` value is provided.
5. THE Catalogue_Service SHALL return a paginated result set respecting the `index` and `size` parameters.
6. THE Catalogue_Controller SHALL return HTTP 200 with `success`, `message`, `data`, `count`, `pageIndex`, and `pageSize` fields.

---

### Requirement 3: Catalogue Item — Get by ID

**User Story:** As an ADMIN, I want to retrieve a single catalogue item by its ID, so that I can inspect its details.

#### Acceptance Criteria

1. WHEN a `GET /:catalogueId` request is received, THE Catalogue_Controller SHALL validate `catalogueId` as a non-empty string using Catalogue_Schema.
2. THE Catalogue_Service SHALL query the catalogue item by `catalogueId` scoped to `request.tenant.orgId`.
3. IF the catalogue item does not exist within the organization, THEN THE Catalogue_Service SHALL throw a `MissingError`.
4. WHEN a `MissingError` is thrown, THE Catalogue_Controller SHALL return HTTP 404 with a descriptive error message.
5. WHEN the item is found, THE Catalogue_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields.

---

### Requirement 4: Catalogue Item — Create

**User Story:** As an ADMIN, I want to create a new catalogue item, so that it can be referenced in supplier quotes and requisitions.

#### Acceptance Criteria

1. WHEN a `POST /` request is received, THE Catalogue_Controller SHALL validate the request body against Catalogue_Schema requiring `name`, `category`, `unit`, and optional `defaultLeadTime`.
2. WHEN the request body is invalid, THE Catalogue_Controller SHALL return HTTP 400 with a descriptive error message.
3. THE Catalogue_Service SHALL scope the new catalogue item to `request.tenant.orgId`.
4. IF a catalogue item with the same `name` already exists within the organization, THEN THE Catalogue_Service SHALL throw a `ConflictError`.
5. WHEN a `ConflictError` is thrown, THE Catalogue_Controller SHALL return HTTP 409 with a descriptive error message.
6. WHEN creation succeeds, THE Catalogue_Controller SHALL return HTTP 201 with `success`, `message`, and `data` fields.

---

### Requirement 5: Catalogue Item — Edit

**User Story:** As an ADMIN, I want to update an existing catalogue item's fields, so that I can correct or refine its details.

#### Acceptance Criteria

1. WHEN a `PATCH /:catalogueId` request is received, THE Catalogue_Controller SHALL validate `catalogueId` and the partial body fields using Catalogue_Schema.
2. THE Catalogue_Service SHALL verify the catalogue item exists within `request.tenant.orgId` before updating.
3. IF the catalogue item does not exist, THEN THE Catalogue_Service SHALL throw a `MissingError`.
4. IF the updated `name` conflicts with an existing catalogue item name within the organization, THEN THE Catalogue_Service SHALL throw a `ConflictError`.
5. WHEN the update succeeds, THE Catalogue_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields.

---

### Requirement 6: Catalogue Item — Delete

**User Story:** As an ADMIN, I want to delete a catalogue item, so that obsolete items can be removed from the system.

#### Acceptance Criteria

1. WHEN a `DELETE /:catalogueId` request is received, THE Catalogue_Controller SHALL validate `catalogueId` using Catalogue_Schema.
2. THE Catalogue_Service SHALL verify the catalogue item exists within `request.tenant.orgId`.
3. IF the catalogue item does not exist, THEN THE Catalogue_Service SHALL throw a `MissingError`.
4. IF the catalogue item has one or more associated `SupplierQuote` records, THEN THE Catalogue_Service SHALL throw a `ConflictError` with a message indicating the item is in use.
5. IF the catalogue item has one or more associated `RequisitionItem` records, THEN THE Catalogue_Service SHALL throw a `ConflictError` with a message indicating the item is in use.
6. WHEN neither supplier quotes nor requisition items are associated, THE Catalogue_Service SHALL hard-delete the catalogue item.
7. WHEN deletion succeeds, THE Catalogue_Controller SHALL return HTTP 200 with `success` and `message` fields.
8. WHEN a `ConflictError` is thrown, THE Catalogue_Controller SHALL return HTTP 409 with a descriptive error message.

---

### Requirement 7: Catalogue Item — Get Supplier Quotes

**User Story:** As an ADMIN, I want to retrieve all supplier quotes for a specific catalogue item, so that I can compare pricing and availability.

#### Acceptance Criteria

1. WHEN a `GET /:catalogueId/quotes` request is received, THE Catalogue_Controller SHALL validate `catalogueId` using Catalogue_Schema.
2. THE Catalogue_Service SHALL verify the catalogue item exists within `request.tenant.orgId`.
3. IF the catalogue item does not exist, THEN THE Catalogue_Service SHALL throw a `MissingError`.
4. THE Catalogue_Service SHALL return all `SupplierQuote` records associated with the catalogue item, including supplier name.
5. THE Catalogue_Controller SHALL return HTTP 200 with `success`, `message`, `data`, and `count` fields.

---

### Requirement 8: Catalogue Item — Get Suppliers

**User Story:** As an ADMIN, I want to retrieve all suppliers linked to a specific catalogue item via quotes, so that I can see which suppliers offer that item.

#### Acceptance Criteria

1. WHEN a `GET /:catalogueId/suppliers` request is received, THE Catalogue_Controller SHALL validate `catalogueId` using Catalogue_Schema.
2. THE Catalogue_Service SHALL verify the catalogue item exists within `request.tenant.orgId`.
3. IF the catalogue item does not exist, THEN THE Catalogue_Service SHALL throw a `MissingError`.
4. THE Catalogue_Service SHALL return the distinct set of active (non-deleted) `Supplier` records linked to the catalogue item through `SupplierQuote` records.
5. THE Catalogue_Controller SHALL return HTTP 200 with `success`, `message`, `data`, and `count` fields.

---

### Requirement 9: Supplier — List

**User Story:** As an ADMIN, I want to list suppliers for my organization with pagination and optional inclusion of soft-deleted suppliers, so that I can manage the supplier directory.

#### Acceptance Criteria

1. WHEN a `GET /suppliers` request is received, THE Supplier_Controller SHALL validate `index`, `size`, `search`, and `includeDeleted` query parameters using Supplier_Schema.
2. THE Supplier_Service SHALL query only suppliers belonging to `request.tenant.orgId`.
3. WHILE `includeDeleted` is false or absent, THE Supplier_Service SHALL exclude suppliers where `deletedAt` is not null.
4. WHERE `includeDeleted` is true, THE Supplier_Service SHALL include suppliers regardless of `deletedAt` value.
5. THE Supplier_Service SHALL apply case-insensitive name search when a non-empty `search` value is provided.
6. THE Supplier_Service SHALL return a paginated result set respecting `index` and `size`.
7. THE Supplier_Controller SHALL return HTTP 200 with `success`, `message`, `data`, `count`, `pageIndex`, and `pageSize` fields.

---

### Requirement 10: Supplier — Get by ID

**User Story:** As an ADMIN, I want to retrieve a single supplier by ID including soft-deleted ones, so that I can inspect or restore archived suppliers.

#### Acceptance Criteria

1. WHEN a `GET /suppliers/:supplierId` request is received, THE Supplier_Controller SHALL validate `supplierId` using Supplier_Schema.
2. THE Supplier_Service SHALL query the supplier by `supplierId` scoped to `request.tenant.orgId`, including soft-deleted records.
3. IF the supplier does not exist within the organization, THEN THE Supplier_Service SHALL throw a `MissingError`.
4. WHEN the supplier is found, THE Supplier_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields.

---

### Requirement 11: Supplier — Create

**User Story:** As an ADMIN, I want to create a new supplier, so that supplier quotes can be associated with them.

#### Acceptance Criteria

1. WHEN a `POST /suppliers` request is received, THE Supplier_Controller SHALL validate the request body against Supplier_Schema requiring `name` and allowing optional `email`, `phone`, `contactPerson`, and `address`.
2. WHEN the request body is invalid, THE Supplier_Controller SHALL return HTTP 400 with a descriptive error message.
3. THE Supplier_Service SHALL scope the new supplier to `request.tenant.orgId`.
4. IF a supplier with the same `name` already exists within the organization (including soft-deleted), THEN THE Supplier_Service SHALL throw a `ConflictError`.
5. WHEN a `ConflictError` is thrown, THE Supplier_Controller SHALL return HTTP 409 with a descriptive error message.
6. WHEN creation succeeds, THE Supplier_Controller SHALL return HTTP 201 with `success`, `message`, and `data` fields.

---

### Requirement 12: Supplier — Edit

**User Story:** As an ADMIN, I want to update a supplier's details, so that contact information stays accurate.

#### Acceptance Criteria

1. WHEN a `PATCH /suppliers/:supplierId` request is received, THE Supplier_Controller SHALL validate `supplierId` and the partial body fields using Supplier_Schema.
2. THE Supplier_Service SHALL verify the supplier exists within `request.tenant.orgId` and is not soft-deleted.
3. IF the supplier does not exist or is soft-deleted, THEN THE Supplier_Service SHALL throw a `MissingError`.
4. IF the updated `name` conflicts with an existing active supplier name within the organization, THEN THE Supplier_Service SHALL throw a `ConflictError`.
5. WHEN the update succeeds, THE Supplier_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields.

---

### Requirement 13: Supplier — Soft Delete

**User Story:** As an ADMIN, I want to soft-delete a supplier, so that historical quote data is preserved while the supplier is removed from active use.

#### Acceptance Criteria

1. WHEN a `DELETE /suppliers/:supplierId` request is received, THE Supplier_Controller SHALL validate `supplierId` using Supplier_Schema.
2. THE Supplier_Service SHALL verify the supplier exists within `request.tenant.orgId` and is not already soft-deleted.
3. IF the supplier does not exist, THEN THE Supplier_Service SHALL throw a `MissingError`.
4. IF the supplier is already soft-deleted, THEN THE Supplier_Service SHALL throw a `ConflictError`.
5. THE Supplier_Service SHALL set `deletedAt` to the current timestamp and SHALL NOT remove the database row.
6. WHEN soft-deletion succeeds, THE Supplier_Controller SHALL return HTTP 200 with `success` and `message` fields.

---

### Requirement 14: Supplier — Restore

**User Story:** As an ADMIN, I want to restore a soft-deleted supplier, so that the supplier can be made active again without losing historical data.

#### Acceptance Criteria

1. WHEN a `POST /suppliers/:supplierId/restore` request is received, THE Supplier_Controller SHALL validate `supplierId` using Supplier_Schema.
2. THE Supplier_Service SHALL verify the supplier exists within `request.tenant.orgId` and is currently soft-deleted.
3. IF the supplier does not exist, THEN THE Supplier_Service SHALL throw a `MissingError`.
4. IF the supplier is not soft-deleted, THEN THE Supplier_Service SHALL throw a `ConflictError` indicating the supplier is already active.
5. THE Supplier_Service SHALL set `deletedAt` to null.
6. WHEN restoration succeeds, THE Supplier_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields.

---

### Requirement 15: Supplier — Get Quotes

**User Story:** As an ADMIN, I want to retrieve all supplier quotes for a specific supplier, so that I can review what items and prices are associated with them.

#### Acceptance Criteria

1. WHEN a `GET /suppliers/:supplierId/quotes` request is received, THE Supplier_Controller SHALL validate `supplierId` using Supplier_Schema.
2. THE Supplier_Service SHALL verify the supplier exists within `request.tenant.orgId`.
3. IF the supplier does not exist, THEN THE Supplier_Service SHALL throw a `MissingError`.
4. THE Supplier_Service SHALL return all `SupplierQuote` records for the supplier, including catalogue item name and category.
5. THE Supplier_Controller SHALL return HTTP 200 with `success`, `message`, `data`, and `count` fields.

---

### Requirement 16: Supplier — Get Catalogue Items

**User Story:** As an ADMIN, I want to retrieve all catalogue items associated with a supplier via quotes, so that I can see what the supplier offers.

#### Acceptance Criteria

1. WHEN a `GET /suppliers/:supplierId/catalogue-items` request is received, THE Supplier_Controller SHALL validate `supplierId` using Supplier_Schema.
2. THE Supplier_Service SHALL verify the supplier exists within `request.tenant.orgId`.
3. IF the supplier does not exist, THEN THE Supplier_Service SHALL throw a `MissingError`.
4. THE Supplier_Service SHALL return the distinct set of `Catalogue` records linked to the supplier through `SupplierQuote` records.
5. THE Supplier_Controller SHALL return HTTP 200 with `success`, `message`, `data`, and `count` fields.

---

### Requirement 17: Supplier Quote — List

**User Story:** As an ADMIN, I want to list supplier quotes with pagination and optional filtering by catalogue item or supplier, so that I can review pricing across the organization.

#### Acceptance Criteria

1. WHEN a `GET /supplier-quotes` request is received, THE SupplierQuote_Controller SHALL validate `index`, `size`, `catalogueId`, and `supplierId` query parameters using SupplierQuote_Schema.
2. THE SupplierQuote_Service SHALL query only supplier quotes whose associated `Catalogue` belongs to `request.tenant.orgId`.
3. WHEN `catalogueId` is provided, THE SupplierQuote_Service SHALL filter results to quotes for that catalogue item.
4. WHEN `supplierId` is provided, THE SupplierQuote_Service SHALL filter results to quotes from that supplier.
5. THE SupplierQuote_Service SHALL return a paginated result set including supplier name and catalogue item name.
6. THE SupplierQuote_Controller SHALL return HTTP 200 with `success`, `message`, `data`, `count`, `pageIndex`, and `pageSize` fields.

---

### Requirement 18: Supplier Quote — Get by ID

**User Story:** As an ADMIN, I want to retrieve a single supplier quote by ID, so that I can inspect its pricing and inventory details.

#### Acceptance Criteria

1. WHEN a `GET /supplier-quotes/:quoteId` request is received, THE SupplierQuote_Controller SHALL validate `quoteId` using SupplierQuote_Schema.
2. THE SupplierQuote_Service SHALL query the supplier quote by `quoteId` and verify it belongs to the organization via its associated catalogue item.
3. IF the supplier quote does not exist within the organization, THEN THE SupplierQuote_Service SHALL throw a `MissingError`.
4. WHEN the quote is found, THE SupplierQuote_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields including supplier and catalogue details.

---

### Requirement 19: Supplier Quote — Create

**User Story:** As an ADMIN, I want to create a new supplier quote linking a supplier to a catalogue item, so that pricing and inventory data can be tracked.

#### Acceptance Criteria

1. WHEN a `POST /supplier-quotes` request is received, THE SupplierQuote_Controller SHALL validate the request body against SupplierQuote_Schema requiring `catalogueId`, `supplierId`, `truePrice`, `standardRate`, and `inventory`, with optional `leadTime`.
2. WHEN the request body is invalid, THE SupplierQuote_Controller SHALL return HTTP 400 with a descriptive error message.
3. THE SupplierQuote_Service SHALL verify the referenced `Catalogue` belongs to `request.tenant.orgId`.
4. THE SupplierQuote_Service SHALL verify the referenced `Supplier` belongs to `request.tenant.orgId` and is not soft-deleted.
5. IF the catalogue item does not exist within the organization, THEN THE SupplierQuote_Service SHALL throw a `MissingError`.
6. IF the supplier does not exist or is soft-deleted, THEN THE SupplierQuote_Service SHALL throw a `MissingError`.
7. IF a supplier quote for the same `catalogueId` and `supplierId` combination already exists, THEN THE SupplierQuote_Service SHALL throw a `ConflictError`.
8. THE SupplierQuote_Service SHALL NOT create a `SupplierQuoteHistory` record on initial creation.
9. WHEN creation succeeds, THE SupplierQuote_Controller SHALL return HTTP 201 with `success`, `message`, and `data` fields.

---

### Requirement 20: Supplier Quote — Edit with History

**User Story:** As an ADMIN, I want to update a supplier quote's pricing or inventory, so that current data stays accurate while the previous state is preserved for audit purposes.

#### Acceptance Criteria

1. WHEN a `PATCH /supplier-quotes/:quoteId` request is received, THE SupplierQuote_Controller SHALL validate `quoteId` and the partial body fields using SupplierQuote_Schema.
2. THE SupplierQuote_Service SHALL verify the supplier quote exists and belongs to the organization via its catalogue item.
3. IF the supplier quote does not exist, THEN THE SupplierQuote_Service SHALL throw a `MissingError`.
4. THE SupplierQuote_Service SHALL capture the current `truePrice`, `standardRate`, `leadTime`, `inventory`, optional `changeReason`, and optional `changedByMemberId` into a new `SupplierQuoteHistory` record BEFORE applying the update.
5. THE SupplierQuote_Service SHALL execute the history insert and the quote update within a single `prisma.$transaction` so both operations succeed or fail atomically.
6. WHEN the transaction succeeds, THE SupplierQuote_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields reflecting the updated quote.
7. WHEN the transaction fails, THE SupplierQuote_Controller SHALL return HTTP 500 with a safe error message.

---

### Requirement 21: Supplier Quote — Delete

**User Story:** As an ADMIN, I want to delete a supplier quote, so that outdated or incorrect quotes can be removed.

#### Acceptance Criteria

1. WHEN a `DELETE /supplier-quotes/:quoteId` request is received, THE SupplierQuote_Controller SHALL validate `quoteId` using SupplierQuote_Schema.
2. THE SupplierQuote_Service SHALL verify the supplier quote exists and belongs to the organization.
3. IF the supplier quote does not exist, THEN THE SupplierQuote_Service SHALL throw a `MissingError`.
4. IF the supplier quote is referenced by one or more `RequisitionItem` records via `assignedSupplierId`, THEN THE SupplierQuote_Service SHALL throw a `ConflictError`.
5. WHEN no requisition items reference the quote, THE SupplierQuote_Service SHALL hard-delete the supplier quote record.
6. WHEN deletion succeeds, THE SupplierQuote_Controller SHALL return HTTP 200 with `success` and `message` fields.
7. WHEN a `ConflictError` is thrown, THE SupplierQuote_Controller SHALL return HTTP 409 with a descriptive error message.

---

### Requirement 22: Quote History — List

**User Story:** As an ADMIN, I want to retrieve the change history for a supplier quote ordered by most recent first, so that I can audit pricing changes over time.

#### Acceptance Criteria

1. WHEN a `GET /supplier-quotes/:quoteId/history` request is received, THE QuoteHistory_Controller SHALL validate `quoteId` using QuoteHistory_Schema.
2. THE QuoteHistory_Service SHALL verify the supplier quote exists and belongs to the organization.
3. IF the supplier quote does not exist, THEN THE QuoteHistory_Service SHALL throw a `MissingError`.
4. THE QuoteHistory_Service SHALL return all `SupplierQuoteHistory` records for the quote ordered by `changedAt` descending.
5. THE QuoteHistory_Controller SHALL return HTTP 200 with `success`, `message`, `data`, and `count` fields.

---

### Requirement 23: Quote History — Get by ID

**User Story:** As an ADMIN, I want to retrieve a single history entry for a supplier quote, so that I can inspect the exact state at a specific point in time.

#### Acceptance Criteria

1. WHEN a `GET /supplier-quotes/:quoteId/history/:historyId` request is received, THE QuoteHistory_Controller SHALL validate both `quoteId` and `historyId` using QuoteHistory_Schema.
2. THE QuoteHistory_Service SHALL verify the parent supplier quote exists and belongs to the organization.
3. IF the supplier quote does not exist, THEN THE QuoteHistory_Service SHALL throw a `MissingError`.
4. THE QuoteHistory_Service SHALL query the `SupplierQuoteHistory` record by `historyId` scoped to the verified `quoteId`.
5. IF the history entry does not exist, THEN THE QuoteHistory_Service SHALL throw a `MissingError`.
6. WHEN the history entry is found, THE QuoteHistory_Controller SHALL return HTTP 200 with `success`, `message`, and `data` fields.

---

### Requirement 24: Tenant Scoping and Data Isolation

**User Story:** As a platform operator, I want all catalogue module queries to be scoped to the requesting organization, so that no cross-tenant data leakage is possible.

#### Acceptance Criteria

1. THE Catalogue_Service SHALL include `organizationId: request.tenant.orgId` in every Prisma query that reads or writes `Catalogue` records.
2. THE Supplier_Service SHALL include `organizationId: request.tenant.orgId` in every Prisma query that reads or writes `Supplier` records.
3. THE SupplierQuote_Service SHALL verify tenant ownership by joining through the `Catalogue` model's `organizationId` on every `SupplierQuote` read or write.
4. THE QuoteHistory_Service SHALL verify tenant ownership by joining through the parent `SupplierQuote` and its `Catalogue` on every `SupplierQuoteHistory` read.
5. IF a request attempts to access a resource belonging to a different organization, THEN THE relevant Service SHALL throw a `MissingError` rather than exposing the existence of the resource.

---

### Requirement 25: Consistent Error Handling and Response Shape

**User Story:** As a frontend developer, I want all catalogue module endpoints to return consistent response shapes and HTTP status codes, so that error handling on the client is predictable.

#### Acceptance Criteria

1. THE Catalogue_Controller SHALL return HTTP 400 for all `ValidationError` instances.
2. THE Catalogue_Controller SHALL return HTTP 404 for all `MissingError` instances.
3. THE Catalogue_Controller SHALL return HTTP 409 for all `ConflictError` instances.
4. THE Catalogue_Controller SHALL return HTTP 500 with a safe message for all unexpected errors, and SHALL log the error using the Winston logger.
5. THE Supplier_Controller, SupplierQuote_Controller, and QuoteHistory_Controller SHALL apply the same HTTP status code mapping as defined in acceptance criteria 1–4 of this requirement.
6. WHEN an unexpected error is caught, THE relevant Controller SHALL log the error with sufficient context including `organizationId` and the relevant resource ID before returning HTTP 500.
7. THE Catalogue_Router SHALL not expose internal error details or stack traces in any HTTP response.
