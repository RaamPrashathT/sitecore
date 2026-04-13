# Implementation Plan: SOV Builder

## Overview

Build the SOV Builder feature as a purely frontend module at `client/src/features/sovBuilder/`. The implementation wires together Zod v4 schemas, a TanStack Query v5 mutation hook, five React components, and a route update — replacing the existing `PhaseCreationPage` with the richer Schedule of Values form.

## Tasks

- [~] 1. Create Zod schemas (`sovBuilder.schema.ts`)
  - Create `client/src/features/sovBuilder/sovBuilder.schema.ts`
  - Define `CatalogueCategoryEnum` using `z.enum` with the six values: `MATERIALS`, `LABOUR`, `EQUIPMENT`, `SUBCONTRACTORS`, `TRANSPORT`, `OVERHEAD`
  - Define `lineItemSchema` with fields: `name` (string, min 1), `category` (CatalogueCategoryEnum), `estimatedCost` (z.coerce.number positive), `billedValue` (z.coerce.number positive) — use `{ error: '...' }` param (Zod v4, not `invalid_type_error`)
  - Define `phaseSchema` with fields: `name` (string, min 1), `description` (string optional), `startDate` (string, min 1), `paymentDeadline` (string, min 1), `lineItems` (z.array(lineItemSchema).min(1))
  - Export inferred types: `PhaseFormValues`, `LineItemFormValues`
  - Export `defaultLineItem` constant with empty/zero values and `category: undefined`
  - _Requirements: 2.1–2.4, 3.2–3.3, 3.5–3.9, 5.1_

- [ ] 2. Implement `useCreatePhase` mutation hook (`hooks/usePhase.ts`)
  - Create `client/src/features/sovBuilder/hooks/usePhase.ts`
  - Import `api` from `@/lib/axios`, `useMutation` and `useQueryClient` from `@tanstack/react-query`, `useNavigate` and `useParams` from `react-router-dom`
  - Read `orgSlug` and `projectSlug` from `useParams` inside the hook
  - `mutationFn`: POST to `/project/phase` with the payload — do NOT add tenant/project fields to the body (interceptor handles headers)
  - `onSuccess`: call `queryClient.invalidateQueries({ queryKey: ['projectTimeline', orgSlug, projectSlug] })` then `navigate('../progress', { replace: true })`
  - `onError`: call `toast.error(...)` with a user-friendly message; leave form populated (no form reset here)
  - Export as `useCreatePhase`
  - _Requirements: 5.1, 5.2, 5.3, 5.5, 6.1_

- [ ] 3. Implement `SOVBuilderMain` component (RBAC guard + layout)
  - Create `client/src/features/sovBuilder/components/SOVBuilderMain.tsx`
  - Call `useMembership()` to get `{ data: membership, isLoading }`
  - While `isLoading` is true: render a skeleton placeholder (a simple `<div>` with animate-pulse divs is sufficient — no separate skeleton file needed)
  - If `membership` is null or `membership.role === 'CLIENT'`: call `navigate('../progress', { replace: true })` and return null
  - If role is `ADMIN` or `ENGINEER`: render `<SOVBuilderForm />`
  - No form logic in this component — it is purely a guard and layout shell
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Implement `SOVBuilderForm` component (RHF form, header fields, submit logic)
  - Create `client/src/features/sovBuilder/components/SOVBuilderForm.tsx`
  - Initialise `useForm<PhaseFormValues>` with `zodResolver(phaseSchema)` and `defaultValues` that include one `defaultLineItem` in the `lineItems` array
  - Render four header fields using shadcn `<Input>` and `<Textarea>`: `name` (required text), `description` (optional textarea), `startDate` (required date input), `paymentDeadline` (required date input) — wire each to RHF with `register` and display `errors` inline
  - Render `<LineItemsTable control={control} register={register} errors={errors} />`
  - Render `<BudgetSummary lineItems={watchedLineItems} />` where `watchedLineItems` comes from `useWatch({ control, name: 'lineItems' })`
  - In `handleSubmit` callback: convert `startDate` and `paymentDeadline` to ISO 8601 via `new Date(value).toISOString()` before calling `createPhase.mutate(payload)`
  - Submit button: `disabled={createPhase.isPending}`, show spinner text while pending
  - Cancel button: calls `navigate('../progress')` without submitting — no API call
  - _Requirements: 2.1–2.7, 5.1, 5.4, 5.6, 6.1, 6.2_

- [ ] 5. Implement `LineItemsTable` component (`useFieldArray`, add button, minimum-one invariant)
  - Create `client/src/features/sovBuilder/components/LineItemsTable.tsx`
  - Accept props: `control`, `register`, `errors` (typed to `PhaseFormValues`)
  - Call `useFieldArray({ control, name: 'lineItems' })` to get `fields`, `append`, `remove`
  - Render a table header row with columns: Name, Category, Est. Cost, Billed Value, (remove action)
  - Map `fields` to `<LineItemRow>` components, passing `index`, `control`, `register`, `errors`, `onRemove={remove}`, and `isOnly={fields.length === 1}`
  - Render an "Add Line Item" `<Button>` below the table that calls `append(defaultLineItem)`
  - _Requirements: 3.1, 3.2, 3.4, 3.9_

- [ ] 6. Implement `LineItemRow` component (4 inputs + remove button)
  - Create `client/src/features/sovBuilder/components/LineItemRow.tsx`
  - Accept props: `index`, `control`, `register`, `errors`, `onRemove`, `isOnly`
  - Render four inputs in a table row (`<TableRow>` / `<TableCell>`):
    - `name`: `<Input type="text">` via `register(\`lineItems.\${index}.name\`)`, show `errors.lineItems?.[index]?.name?.message` inline
    - `category`: shadcn `<Select>` via `<Controller>`, options are the six `CatalogueCategoryEnum` values, show category error inline
    - `estimatedCost`: `<Input type="number">` via `register(\`lineItems.\${index}.estimatedCost\`, { valueAsNumber: true })`, show error inline
    - `billedValue`: `<Input type="number">` via `register(\`lineItems.\${index}.billedValue\`, { valueAsNumber: true })`, show error inline
  - Render a remove `<Button variant="ghost">` with a trash icon; set `disabled={isOnly}` when it is the only row
  - _Requirements: 3.2, 3.3, 3.4, 3.5–3.8, 3.9_

- [ ] 7. Implement `BudgetSummary` component (real-time total)
  - Create `client/src/features/sovBuilder/components/BudgetSummary.tsx`
  - Accept props: `lineItems: { billedValue: number | string }[]`
  - Compute total using `Array.reduce`, coercing each `billedValue` to a number with `Number(v) || 0`
  - Format with `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)`
  - Display the formatted total in a summary row/card below the line items table
  - _Requirements: 4.1–4.5_

- [ ] 8. Register route and update `PhaseCreationPage`
  - Update `client/src/pages/project/PhaseCreationPage.tsx` to import and render `<SOVBuilderMain />` instead of `<PhaseCreationForm />`
  - No changes to `App.tsx` are needed — the route `progress/create-phase` already exists and points to `PhaseCreationPage`
  - Verify the route path `/:orgSlug/:projectSlug/progress/create-phase` resolves correctly inside the `<ProjectMain>` outlet
  - _Requirements: 1.1, 5.3, 6.1_

- [ ] 9. Final checkpoint — wire and verify
  - Ensure all components are imported correctly within their parent components (SOVBuilderMain → SOVBuilderForm → LineItemsTable → LineItemRow, BudgetSummary)
  - Confirm `useCreatePhase` is called in `SOVBuilderForm` and not in `SOVBuilderMain`
  - Confirm no `tenantSlug`, `projectSlug`, or `organizationId` fields appear in the POST body
  - Confirm the cancel button in `SOVBuilderForm` navigates to `../progress` without triggering a mutation
  - Ask the user if any questions arise before considering the feature complete.

## Notes

- Tasks marked with `*` are optional and can be skipped — none are present here per the no-tests constraint
- Each task references specific requirements for traceability
- The existing `/:orgSlug/:projectSlug/progress/create-phase` route in `App.tsx` requires no changes — only `PhaseCreationPage.tsx` needs updating
- The Axios interceptor at `@/lib/axios` injects `x-tenant-slug` and `x-project-slug` automatically — never pass these in the request body
- `useWatch` (not `watch`) is used for `lineItems` in `SOVBuilderForm` to avoid full re-renders on every keystroke
- The `projectTimeline` query key matches the existing pattern in `features/project/progress/hooks/usePhase.ts`
