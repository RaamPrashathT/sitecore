# Requirements Document

## Introduction

This feature upgrades the Site Log from a Phase-scoped text/photo update into a **Project-Level** entity. A Site Log now acts as a daily commit that advances financial and physical progress across the entire project by recording `progressUpdates` — each mapped to a granular Schedule of Values (SOV) `PhaseLineItem`. The form replaces the old phase-scoped `CreateLogForm` and lives under `client/src/features/siteLog/`.

Only `ADMIN` and `ENGINEER` roles may create site logs. The Axios interceptor at `@/lib/axios` automatically injects `x-tenant-slug` and `x-project-slug` headers, so no tenant or project IDs are included in request payloads.

---

## Glossary

- **SiteLog**: A project-level daily record capturing general conditions, photos, and SOV progress updates.
- **Phase**: A top-level work breakdown structure node within a project, containing one or more `PhaseLineItem`s.
- **PhaseLineItem**: A granular SOV line item belonging to a Phase, carrying a `percentageComplete` value (0–100).
- **ProgressUpdate**: A payload entry that maps a `lineItemId` to a `percentageChange` (the *delta* to apply, not the new absolute value).
- **Difference Slider**: A UI slider whose minimum is the line item's current `percentageComplete` from the DB and whose value represents the new absolute total; the payload sends only the difference.
- **SiteLog_Form**: The React component responsible for collecting and submitting site log data.
- **SiteLog_Mutation**: The TanStack Query mutation hook that posts to `POST /project/sitelog`.
- **ProjectPhases_Hook**: The TanStack Query hook (`useProjectPhases`) that fetches `GET /project/phases`.
- **Image_Uploader**: The existing Cloudinary upload utility at `@/lib/cloudinary`.
- **Role_Guard**: The access-control mechanism that restricts the form to `ADMIN` and `ENGINEER` roles.

---

## Requirements

### Requirement 1: Project-Level Site Log Submission

**User Story:** As an ADMIN or ENGINEER, I want to submit a site log at the project level, so that daily progress is recorded against the entire project rather than a single phase.

#### Acceptance Criteria

1. THE `SiteLog_Form` SHALL render a form with fields: `title` (text), `workDate` (date picker), `description` (textarea), and `weatherConditions` (text input).
2. WHEN the user submits the form, THE `SiteLog_Mutation` SHALL post to `POST /project/sitelog` with the validated payload.
3. IF `title` is empty or `workDate` is absent at submission time, THEN THE `SiteLog_Form` SHALL display inline validation error messages and SHALL NOT submit the request.
4. WHEN the submission succeeds, THE `SiteLog_Form` SHALL invalidate the `['projectPhases']` and `['siteLogs']` TanStack Query cache keys, display a success toast, and navigate the user back to the previous route.
5. IF the submission request fails, THEN THE `SiteLog_Form` SHALL display an error toast and SHALL leave the form populated with the user's data for retry.
6. THE `SiteLog_Form` SHALL be accessible only to users whose role is `ADMIN` or `ENGINEER`.

---

### Requirement 2: Delay Event Capture

**User Story:** As an ADMIN or ENGINEER, I want to flag a site log as a delay event and record the reason, so that project delays are formally documented.

#### Acceptance Criteria

1. THE `SiteLog_Form` SHALL render an `isDelayEvent` boolean toggle switch, defaulting to `false`.
2. WHEN `isDelayEvent` is toggled to `true`, THE `SiteLog_Form` SHALL reveal a required `delayReason` textarea.
3. WHEN `isDelayEvent` is `true` and `delayReason` is empty at submission time, THE `SiteLog_Form` SHALL display a validation error and SHALL NOT submit the request.
4. WHEN `isDelayEvent` is toggled back to `false`, THE `SiteLog_Form` SHALL hide the `delayReason` textarea and SHALL clear any validation error on that field.

---

### Requirement 3: Photo Upload

**User Story:** As an ADMIN or ENGINEER, I want to attach site photos to a log, so that visual evidence of daily progress is preserved.

#### Acceptance Criteria

1. THE `SiteLog_Form` SHALL render a photo upload section using the existing `Image_Uploader` utility.
2. THE `SiteLog_Form` SHALL allow a maximum of 5 images per submission.
3. IF the user attempts to add a sixth image, THEN THE `SiteLog_Form` SHALL display an error message and SHALL NOT add the file to the selection.
4. WHEN the user removes a selected image, THE `SiteLog_Form` SHALL remove it from the preview list and SHALL clear any upload error.
5. WHEN the form is submitted, THE `SiteLog_Form` SHALL upload all selected files via `Image_Uploader` before posting the site log payload, and SHALL include the resulting URLs in the `images` array.
6. WHILE images are uploading, THE `SiteLog_Form` SHALL disable all interactive controls and display an uploading indicator.

---

### Requirement 4: SOV Progress Sliders — Data Fetching

**User Story:** As an ADMIN or ENGINEER, I want to see all SOV line items grouped by phase, so that I can update physical progress for each item in a single log entry.

#### Acceptance Criteria

1. THE `ProjectPhases_Hook` SHALL fetch `GET /project/phases` and return an array of Phases, each containing `lineItems[]` with `id`, `name`, and `percentageComplete` (0–100).
2. WHILE the phases data is loading, THE `SiteLog_Form` SHALL display a loading skeleton in the SOV section.
3. IF the phases fetch fails, THEN THE `SiteLog_Form` SHALL display an error state with a retry affordance in the SOV section.
4. THE `SiteLog_Form` SHALL group sliders by their parent Phase, rendering a labelled section per Phase.

---

### Requirement 5: SOV Progress Sliders — Difference Slider Invariants

**User Story:** As an ADMIN or ENGINEER, I want each SOV slider to enforce business rules so that progress can only move forward and the payload always reflects the correct delta.

#### Acceptance Criteria

1. THE `SiteLog_Form` SHALL render one Shadcn `<Slider>` per `PhaseLineItem`, with the slider's minimum value set to the line item's `percentageComplete` value fetched from the DB (Floor Invariant).
2. THE `SiteLog_Form` SHALL prevent the slider from being dragged below the DB `percentageComplete` value; any attempt to set a value below the floor SHALL be clamped to the floor value.
3. THE `SiteLog_Form` SHALL render `+10%`, `+25%`, and `Max (100%)` quick-action buttons per slider (Quick Actions Invariant).
4. WHEN a quick-action button is clicked, THE `SiteLog_Form` SHALL set the slider's absolute value to `min(floor + delta, 100)` for `+10%` and `+25%`, and to `100` for `Max (100%)`.
5. WHEN the form payload is assembled, THE `SiteLog_Form` SHALL compute `percentageChange = newAbsoluteValue - dbPercentageComplete` for each line item (Payload Transform Invariant).
6. WHEN the form payload is assembled, THE `SiteLog_Form` SHALL include only line items where `percentageChange > 0` in the `progressUpdates` array (Filtering Invariant).
7. FOR ALL line items, the assembled `percentageChange` value SHALL satisfy `percentageChange >= 0.1` when included in the payload, consistent with the Zod schema minimum.

---

### Requirement 6: Zod Schema Validation

**User Story:** As a developer, I want a single Zod schema to govern the site log form, so that validation is consistent between the UI and any future server-side reuse.

#### Acceptance Criteria

1. THE `SiteLog_Form` SHALL validate all inputs against a `siteLogSchema` defined in `client/src/features/siteLog/siteLog.schema.ts`.
2. THE `siteLogSchema` SHALL enforce: `title` non-empty string, `workDate` non-empty string, `description` optional string, `isDelayEvent` boolean defaulting to `false`, `delayReason` optional string, `weatherConditions` optional string, `images` array of strings defaulting to `[]`, and `progressUpdates` array of objects with `lineItemId` string and `percentageChange` number ≥ 0.1, defaulting to `[]`.
3. WHEN `isDelayEvent` is `true` and `delayReason` is absent or empty, THE `siteLogSchema` SHALL produce a validation error on the `delayReason` field.
4. FOR ALL valid `siteLogSchema` inputs, parsing the schema SHALL produce an output where `images` and `progressUpdates` are always arrays (never `undefined`), satisfying the default invariant.

---

### Requirement 7: Migration from Phase-Scoped Site Log

**User Story:** As a developer, I want the old phase-scoped site log form and its hook to be removed or refactored, so that there is a single authoritative implementation.

#### Acceptance Criteria

1. THE codebase SHALL remove or replace `client/src/features/project/progress/components/CreateLogForm.tsx` with the new project-level `SiteLog_Form`.
2. THE codebase SHALL remove or replace `client/src/features/project/progress/hooks/useAddSiteLog.ts` with the new `SiteLog_Mutation` hook located in `client/src/features/siteLog/hooks/`.
3. THE `App.tsx` route `progress/:phaseSlug/create-log` SHALL be updated to point to the new project-level site log page or replaced with a new route under the project scope.
4. WHEN the new route is navigated to, THE `SiteLog_Form` SHALL NOT require a `phaseSlug` URL parameter.
