# Requirements Document

## Introduction

The SOV Builder (Schedule of Values Builder) is the Admin Planning View for the construction ERP frontend. It replaces the existing basic phase creation form with a richer, multi-step form that allows ADMIN and ENGINEER users to define a phase's financial breakdown by adding one or more line items (the Schedule of Values) before submitting. Each line item captures a cost category, an internal estimated cost, and a client-facing billed value. A real-time total budget summary is displayed as rows are added or modified.

## Glossary

- **SOV_Builder**: The frontend form component that allows an Admin or Engineer to create a Phase along with its Schedule of Values line items in a single submission.
- **Phase**: A named milestone within a project that has a start date, payment deadline, and a set of financial line items.
- **PhaseLineItem**: A single row in the Schedule of Values representing one cost element of a phase, containing a name, category, estimated cost, and billed value.
- **CatalogueCategory**: An enumeration of cost categories: `MATERIALS`, `LABOUR`, `EQUIPMENT`, `SUBCONTRACTORS`, `TRANSPORT`, `OVERHEAD`.
- **Total_Phase_Budget**: The real-time sum of all `billedValue` fields across all PhaseLineItems currently in the form.
- **Admin**: A user with the `ADMIN` role within a tenant organisation.
- **Engineer**: A user with the `ENGINEER` role within a tenant organisation.
- **Client**: A user with the `CLIENT` role — view-only access, cannot create phases.
- **Axios_Interceptor**: The existing request interceptor in `@/lib/axios` that automatically injects `x-tenant-slug` and `x-project-slug` headers from the URL path.

---

## Requirements

### Requirement 1: Role-Based Access Control for Phase Creation

**User Story:** As an Admin or Engineer, I want the SOV Builder form to be accessible only to authorised roles, so that Clients cannot create or modify phases.

#### Acceptance Criteria

1. WHEN a user with the `ADMIN` or `ENGINEER` role navigates to the phase creation route, THE SOV_Builder SHALL render the full phase creation form.
2. WHEN a user with the `CLIENT` role navigates to the phase creation route, THE SOV_Builder SHALL redirect the user away from the form and SHALL NOT render any form inputs.
3. WHILE the user's session and membership data are loading, THE SOV_Builder SHALL render a loading skeleton in place of the form.

---

### Requirement 2: Phase Header Fields

**User Story:** As an Admin or Engineer, I want to fill in the core phase details (name, description, dates), so that the phase is properly identified and scheduled within the project.

#### Acceptance Criteria

1. THE SOV_Builder SHALL provide a text input for the phase `name` field, and the field SHALL be required.
2. THE SOV_Builder SHALL provide a textarea input for the phase `description` field, and the field SHALL be optional.
3. THE SOV_Builder SHALL provide a date input for the phase `startDate` field, and the field SHALL be required.
4. THE SOV_Builder SHALL provide a date input for the phase `paymentDeadline` field, and the field SHALL be required.
5. IF the user submits the form with the `name` field empty, THEN THE SOV_Builder SHALL display an inline validation error message on the `name` field and SHALL NOT submit the form.
6. IF the user submits the form with the `startDate` field empty, THEN THE SOV_Builder SHALL display an inline validation error message on the `startDate` field and SHALL NOT submit the form.
7. IF the user submits the form with the `paymentDeadline` field empty, THEN THE SOV_Builder SHALL display an inline validation error message on the `paymentDeadline` field and SHALL NOT submit the form.

---

### Requirement 3: Dynamic Line Item Management

**User Story:** As an Admin or Engineer, I want to add, edit, and remove Schedule of Values rows dynamically before submitting, so that I can accurately define the financial breakdown of a phase.

#### Acceptance Criteria

1. THE SOV_Builder SHALL render an "Add Line Item" control that, when activated, appends a new empty PhaseLineItem row to the line items list.
2. WHEN a new PhaseLineItem row is appended, THE SOV_Builder SHALL render four inputs within that row: `name` (text), `category` (dropdown), `estimatedCost` (number), and `billedValue` (number).
3. THE SOV_Builder SHALL populate the `category` dropdown with exactly the six values of the `CatalogueCategory` enum: `MATERIALS`, `LABOUR`, `EQUIPMENT`, `SUBCONTRACTORS`, `TRANSPORT`, `OVERHEAD`.
4. WHEN the user activates the remove control on a PhaseLineItem row, THE SOV_Builder SHALL remove that row from the list immediately without requiring a confirmation step.
5. IF the user submits the form with one or more PhaseLineItem rows where the `name` field is empty, THEN THE SOV_Builder SHALL display an inline validation error on the affected row's `name` field and SHALL NOT submit the form.
6. IF the user submits the form with one or more PhaseLineItem rows where the `category` field is unselected, THEN THE SOV_Builder SHALL display an inline validation error on the affected row's `category` field and SHALL NOT submit the form.
7. IF the user submits the form with one or more PhaseLineItem rows where `estimatedCost` is not a positive number, THEN THE SOV_Builder SHALL display an inline validation error on the affected row's `estimatedCost` field and SHALL NOT submit the form.
8. IF the user submits the form with one or more PhaseLineItem rows where `billedValue` is not a positive number, THEN THE SOV_Builder SHALL display an inline validation error on the affected row's `billedValue` field and SHALL NOT submit the form.
9. THE SOV_Builder SHALL NOT allow the form to be submitted with zero PhaseLineItem rows. There must always be at least one row. If the user attempts to remove the final row, the UI should either prevent the removal or instantly replace it with a blank row, ensuring the lineItems array payload always has .length >= 1.

---

### Requirement 4: Real-Time Total Phase Budget

**User Story:** As an Admin or Engineer, I want to see a live-updating total of all billed values as I build the Schedule of Values, so that I can immediately understand the total client-facing cost of the phase.

#### Acceptance Criteria

1. THE SOV_Builder SHALL display a "Total Phase Budget" summary value that is computed as the sum of all `billedValue` fields across all current PhaseLineItem rows.
2. WHEN the user changes the `billedValue` of any PhaseLineItem row, THE SOV_Builder SHALL update the Total_Phase_Budget display immediately without requiring any additional user action.
3. WHEN the user adds a new PhaseLineItem row, THE SOV_Builder SHALL include that row's `billedValue` (defaulting to zero) in the Total_Phase_Budget calculation immediately.
4. WHEN the user removes a PhaseLineItem row, THE SOV_Builder SHALL subtract that row's `billedValue` from the Total_Phase_Budget immediately.
5. THE SOV_Builder SHALL format the Total_Phase_Budget value as a currency figure using the locale-appropriate number format.

---

### Requirement 5: Phase Submission via API

**User Story:** As an Admin or Engineer, I want the completed form to be submitted to the backend in a single API call, so that the phase and all its line items are created atomically.

#### Acceptance Criteria

1. WHEN the user submits a valid form, THE SOV_Builder SHALL send a single `POST` request to the `/project/phase` endpoint with the phase header fields and the `lineItems` array in the request body.
2. THE SOV_Builder SHALL rely on the Axios_Interceptor to inject the `x-tenant-slug` and `x-project-slug` headers and SHALL NOT include tenant or project identifiers in the request body.
3. WHEN the `POST /project/phase` request succeeds, THE SOV_Builder SHALL invalidate the project timeline query cache and SHALL navigate the user to the project's progress view.
4. WHILE the `POST /project/phase` request is in-flight, THE SOV_Builder SHALL disable the submit button and SHALL display a loading indicator on the submit button.
5. IF the `POST /project/phase` request fails, THEN THE SOV_Builder SHALL display an error notification to the user and SHALL leave the form populated with the user's input so the user can retry.
6. THE SOV_Builder SHALL convert the `startDate` and `paymentDeadline` values to ISO 8601 datetime strings before including them in the request payload.

---

### Requirement 6: Navigation and Cancellation

**User Story:** As an Admin or Engineer, I want a clear way to exit the SOV Builder without saving, so that I can abandon phase creation if needed.

#### Acceptance Criteria

1. THE SOV_Builder SHALL provide a "Cancel" or "Back" control that, when activated, navigates the user back to the project's progress view without submitting the form.
2. WHEN the user activates the back navigation control, THE SOV_Builder SHALL NOT send any API request.
