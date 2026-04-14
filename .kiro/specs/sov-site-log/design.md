# Design Document — sov-site-log

## Overview

This feature replaces the old phase-scoped `CreateLogForm` with a new project-level `SiteLog_Form`. A site log is now a daily commit that advances financial and physical progress across the entire project by recording `progressUpdates` — each mapped to a granular Schedule of Values (SOV) `PhaseLineItem`.

The form lives at `client/src/features/siteLog/`, posts to `POST /project/sitelog`, and fetches all phases (with their line items) from `GET /project/phases` via a new `useProjectPhases` hook. The Axios interceptor at `@/lib/axios` automatically injects `x-tenant-slug` and `x-project-slug` headers from the URL, so no tenant or project IDs appear in request payloads.

Access is restricted to `ADMIN` and `ENGINEER` roles via the existing `useMembership` hook.

---

## Architecture

This is a **frontend-only** change. No backend modifications are required.

```
┌─────────────────────────────────────────────────────────────┐
│  CreateLogPage (pages/project/CreateLogPage.tsx)            │
│  Route: /:orgSlug/:projectSlug/progress/create-log          │
│  Role guard: ADMIN | ENGINEER only                          │
└────────────────────────┬────────────────────────────────────┘
                         │ renders
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  SiteLogForm (features/siteLog/components/SiteLogForm.tsx)  │
│                                                             │
│  ┌──────────────────┐   ┌──────────────────────────────┐   │
│  │ React Hook Form  │   │  Local useState              │   │
│  │ + zodResolver    │   │  sliderValues: Record<id,num>│   │
│  │ (title, workDate,│   │  selectedFiles: File[]       │   │
│  │  description,    │   │  isUploading: boolean        │   │
│  │  isDelayEvent,   │   └──────────────────────────────┘   │
│  │  delayReason,    │                                       │
│  │  weatherConds)   │                                       │
│  └──────────────────┘                                       │
└────────────────────────┬────────────────────────────────────┘
                         │ uses
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐         ┌──────────────────────┐
│ useProjectPhases │         │ useCreateSiteLog      │
│ GET /project/    │         │ POST /project/sitelog │
│ phases           │         │ invalidates:          │
│ queryKey:        │         │ ['projectPhases']     │
│ ['projectPhases',│         │ ['siteLogs']          │
│  orgSlug,        │         └──────────────────────┘
│  projectSlug]    │
└──────────────────┘
          │ data feeds
          ▼
┌──────────────────────────────────────────────────────────┐
│  SOV Difference Sliders (one per PhaseLineItem)          │
│  min = item.percentageComplete (floor from DB)           │
│  value = sliderValues[item.id]                           │
│  Quick actions: +10%, +25%, Max                          │
└──────────────────────────────────────────────────────────┘
```

### Data Flow on Submit

1. React Hook Form validates the base fields (title, workDate, isDelayEvent, delayReason).
2. `selectedFiles` are uploaded to Cloudinary in parallel via `uploadToCloudinary`.
3. `sliderValues` are transformed into `progressUpdates` (delta = new − floor, filter delta > 0).
4. The assembled payload is posted via `useCreateSiteLog`.
5. On success: invalidate `['projectPhases']` and `['siteLogs']`, toast success, `navigate(-1)`.
6. On error: toast error, leave form populated.

---

## Components and Interfaces

### File Structure

```
client/src/features/siteLog/
├── siteLog.schema.ts
├── hooks/
│   └── useSiteLog.ts          ← useProjectPhases + useCreateSiteLog
└── components/
    └── SiteLogForm.tsx

client/src/pages/project/
└── CreateLogPage.tsx           ← updated (replaces old one)
```

### Files to Delete / Replace

| File | Action |
|---|---|
| `client/src/features/project/progress/components/CreateLogForm.tsx` | Delete |
| `client/src/features/project/progress/hooks/useAddSiteLog.ts` | Delete |
| `client/src/pages/project/CreateLogPage.tsx` | Replace with new version |

### Files to Update

| File | Change |
|---|---|
| `client/src/App.tsx` | Replace route `progress/:phaseSlug/create-log` → `progress/create-log` |
| `client/src/features/project/progress/components/PhaseCard.tsx` | Change navigate target from `${phase.slug}/create-log` → `create-log` |

### `useSiteLog.ts` — Hook Interface

```typescript
// Query key factory
export const siteLogKeys = {
  phases: (orgSlug: string, projectSlug: string) =>
    ['projectPhases', orgSlug, projectSlug] as const,
  logs: () => ['siteLogs'] as const,
}

// useProjectPhases — fetches GET /project/phases
export function useProjectPhases(): UseQueryResult<ProjectPhasesResponse>

// useCreateSiteLog — posts POST /project/sitelog
export function useCreateSiteLog(): UseMutationResult<void, Error, SiteLogPayload>
```

### `SiteLogForm.tsx` — Component Interface

```typescript
// No props — reads orgSlug/projectSlug from URL params via useMembership/useParams
export default function SiteLogForm(): JSX.Element
```

### `CreateLogPage.tsx` — Page Interface

```typescript
// Wraps SiteLogForm, enforces role guard
export default function CreateLogPage(): JSX.Element
```

---

## Data Models

### API Response — `GET /project/phases`

The existing `/project/phases` endpoint already returns phases with line items. The new `useProjectPhases` hook extends the existing `useProjectProgress` query shape with `lineItems`:

```typescript
export interface PhaseLineItem {
  id: string
  name: string
  percentageComplete: number  // 0–100, the "floor" for the slider
}

export interface PhaseWithLineItems {
  id: string
  name: string
  slug: string
  status: 'PLANNING' | 'PAYMENT_PENDING' | 'ACTIVE' | 'COMPLETED'
  lineItems: PhaseLineItem[]
}

export interface ProjectPhasesResponse {
  project: ProjectStats
  phases: PhaseWithLineItems[]
}
```

### Zod Schema — `siteLog.schema.ts`

```typescript
import * as z from 'zod'

export const siteLogSchema = z.object({
  title: z.string({ error: 'Title is required' }).min(1, 'Title is required'),
  description: z.string().optional(),
  workDate: z.string({ error: 'Date is required' }).min(1, 'Date is required'),
  isDelayEvent: z.boolean().default(false),
  delayReason: z.string().optional(),
  weatherConditions: z.string().optional(),
  images: z.array(z.string()).default([]),
  progressUpdates: z.array(z.object({
    lineItemId: z.string(),
    percentageChange: z.number().min(0.1),
  })).default([]),
}).refine(
  (data) => !data.isDelayEvent || (data.delayReason && data.delayReason.trim().length > 0),
  { message: 'Delay reason is required when flagging a delay event', path: ['delayReason'] }
)

export type SiteLogFormValues = z.infer<typeof siteLogSchema>

export interface SiteLogPayload {
  title: string
  description?: string
  workDate: string
  isDelayEvent: boolean
  delayReason?: string
  weatherConditions?: string
  images: string[]
  progressUpdates: Array<{ lineItemId: string; percentageChange: number }>
}
```

### Slider State (local `useState`, outside RHF)

```typescript
// Maps lineItemId → current absolute slider value
const [sliderValues, setSliderValues] = useState<Record<string, number>>({})

// Initialized from fetched phases:
// sliderValues[item.id] = item.percentageComplete  (the floor)

// On submit — payload transform:
const progressUpdates = Object.entries(sliderValues)
  .map(([lineItemId, newValue]) => {
    const floor = getFloor(lineItemId, phases)  // item.percentageComplete
    return { lineItemId, percentageChange: newValue - floor }
  })
  .filter(u => u.percentageChange > 0)
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Schema rejects blank titles

*For any* string composed entirely of whitespace characters (or the empty string), parsing it as the `title` field via `siteLogSchema` SHALL produce a validation error on the `title` field and SHALL NOT return a parsed value.

**Validates: Requirements 1.3**

---

### Property 2: Role guard excludes non-privileged roles

*For any* role value that is not `ADMIN` or `ENGINEER` (i.e., `CLIENT` or `IDLE`), the `CreateLogPage` SHALL NOT render the `SiteLogForm` — it should render an access-denied state or redirect instead.

**Validates: Requirements 1.6**

---

### Property 3: Delay reason required when delay event is true

*For any* string that is empty or composed entirely of whitespace, parsing `siteLogSchema` with `isDelayEvent: true` and that string as `delayReason` SHALL produce a validation error on the `delayReason` field.

**Validates: Requirements 2.3, 6.3**

---

### Property 4: Image list capped at 5

*For any* initial image list of length ≤ 5 and any batch of new files, after attempting to add the batch the resulting image list length SHALL NOT exceed 5.

**Validates: Requirements 3.2, 3.3**

---

### Property 5: Image removal reduces list by exactly one

*For any* non-empty image list and any valid index within that list, removing the element at that index SHALL produce a list of length exactly one less than the original.

**Validates: Requirements 3.4**

---

### Property 6: Upload count matches payload image count

*For any* list of 0–5 selected files, after a successful form submission the `images` array in the posted payload SHALL have the same length as the selected files list, and each entry SHALL be the URL returned by `uploadToCloudinary` for the corresponding file.

**Validates: Requirements 3.5**

---

### Property 7: Slider floor invariant

*For any* `PhaseLineItem` with `percentageComplete` value F, the initial slider value for that item SHALL equal F, and attempting to set the slider to any value V < F SHALL result in the stored value being clamped to F.

**Validates: Requirements 5.1, 5.2**

---

### Property 8: Quick action formula invariant

*For any* line item with floor value F (where 0 ≤ F ≤ 100):
- Clicking `+10%` SHALL set the slider to `min(F + 10, 100)`
- Clicking `+25%` SHALL set the slider to `min(F + 25, 100)`
- Clicking `Max` SHALL set the slider to `100`

**Validates: Requirements 5.3, 5.4**

---

### Property 9: Payload delta transform invariant

*For any* set of (floor F, new absolute value N) pairs where N ≥ F, the assembled `percentageChange` for each line item SHALL equal `N − F`.

**Validates: Requirements 5.5**

---

### Property 10: Payload filtering invariant

*For any* slider state, the assembled `progressUpdates` array SHALL contain only entries where `percentageChange > 0`. Line items whose slider value equals their floor (delta = 0) SHALL be absent from the payload.

**Validates: Requirements 5.6, 5.7**

---

### Property 11: Schema default invariant

*For any* valid input to `siteLogSchema` that omits the `images` and/or `progressUpdates` keys, the parsed output SHALL always contain `images` as an array and `progressUpdates` as an array (never `undefined`).

**Validates: Requirements 6.4**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `title` empty on submit | RHF + Zod inline error, no request sent |
| `workDate` absent on submit | RHF + Zod inline error, no request sent |
| `isDelayEvent: true` + empty `delayReason` | Zod `.refine()` inline error on `delayReason`, no request sent |
| User attempts to add 6th image | `uploadError` state set, file not added to `selectedFiles` |
| Cloudinary upload fails | `uploadError` state set, `isUploading` cleared, form re-enabled |
| `POST /project/sitelog` fails | `onError` in `useCreateSiteLog` → `toast.error(...)`, form stays populated |
| `GET /project/phases` fails | Error state rendered in SOV section with retry button |
| `GET /project/phases` loading | Skeleton rendered in SOV section |
| Non-ADMIN/ENGINEER role | Role guard in `CreateLogPage` renders access-denied UI |

---

## Testing Strategy

### Unit / Example Tests

- Render `SiteLogForm` and assert all base fields are present (title, workDate, description, weatherConditions, isDelayEvent toggle, photo upload section).
- Submit with empty title → assert inline error shown, `api.post` not called.
- Toggle `isDelayEvent` on → assert `delayReason` textarea appears; toggle off → assert it disappears.
- Mock `useProjectPhases` returning `isPending: true` → assert skeleton rendered in SOV section.
- Mock `useProjectPhases` returning `isError: true` → assert error state and retry button rendered.
- Mock `useProjectPhases` returning data → assert `+10%`, `+25%`, `Max` buttons rendered per line item.
- Mock `uploadToCloudinary` to hang → assert all controls disabled and uploading indicator visible.
- Mock mutation `onSuccess` → assert `invalidateQueries` called with `['projectPhases']` and `['siteLogs']`, `toast.success` called, `navigate(-1)` called.
- Mock mutation `onError` → assert `toast.error` called and form values unchanged.

### Property-Based Tests

Using [fast-check](https://github.com/dubzzz/fast-check) (already available in the JS ecosystem, no new install needed if present; otherwise use vitest's built-in arbitrary support).

Each property test runs a minimum of **100 iterations**.

Tag format: `// Feature: sov-site-log, Property N: <property_text>`

| Property | Test Description |
|---|---|
| P1: Schema rejects blank titles | `fc.string()` filtered to whitespace-only → `siteLogSchema.safeParse` must return error on `title` |
| P2: Role guard | For each of `['CLIENT', 'IDLE']` → render `CreateLogPage` → assert form not rendered |
| P3: Delay reason required | `fc.string()` filtered to whitespace-only → parse with `isDelayEvent: true` → error on `delayReason` |
| P4: Image cap | `fc.array(fc.anything(), { minLength: 6, maxLength: 20 })` → add all → length ≤ 5 |
| P5: Image removal | `fc.array + fc.nat` → remove at index → length decreases by 1 |
| P6: Upload count | `fc.array(fc.anything(), { maxLength: 5 })` → submit → payload images length matches |
| P7: Slider floor | `fc.integer({ min: 0, max: 100 })` as floor, `fc.integer({ min: 0, max: 99 })` as attempt → clamped to floor |
| P8: Quick action formula | `fc.integer({ min: 0, max: 100 })` as floor → verify all three button results |
| P9: Delta transform | `fc.integer({ min: 0, max: 100 })` as floor, `fc.integer` ≥ floor as new value → delta = new − floor |
| P10: Filtering | Arbitrary slider state with some at-floor items → progressUpdates contains no zero-delta entries |
| P11: Schema defaults | `fc.record(...)` omitting images/progressUpdates → parsed output always has arrays |
