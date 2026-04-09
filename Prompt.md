# Role and Context
Act as an Expert Frontend React Developer specializing in TypeScript, Tailwind CSS, TanStack React Query, TanStack Table, and Shadcn UI. 

I need you to build the frontend UI for our "Master Catalogue" feature based on our existing backend endpoints. 

Please review the existing catalogue code and global styles in our repository to match the current patterns, but strictly adhere to the architecture and design rules outlined below.

---

## 1. UI/UX & Styling Guidelines
The UI must be highly professional, neat, responsive, and suited for a B2B ERP dashboard. Do **not** hardcode any mock data; everything must be wired to the API.

**Brand Assets:**
- **Primary Accent Color:** Tailwind `green-700` (Use this for primary buttons, active states, and key highlights).
- **Typography Map:** Ensure these are applied semantically:
  - Titles / Headings: `var(--font-sans)` ("IBM Plex Sans", sans-serif)
  - Regular Text / Body: `var(--font-display)` ("DM Serif Display", serif)
  - Numbers / Prices / Data points: `var(--font-mono)` ("IBM Plex Mono", monospace)

---

## 2. Technical Architecture & Folder Structure
We enforce a strict separation of concerns. Data fetching logic must **never** live directly inside UI components. 

Create the following file structure:
```text
features/
└── catalogue/
    ├── components/
    │   ├── CatalogueTable.tsx     (The main TanStack table)
    │   ├── CatalogueSheet.tsx     (The right-side drawer/sheet for details)
    │   └── columns.tsx            (TanStack table column definitions)
    └── hooks/
        └── useCatalogue.ts        (Custom hooks for queries & mutations)
````

---

## 3. Custom Hooks (React Query)

In `features/catalogue/hooks/useCatalogue.ts`, write the custom hooks using TanStack React Query:

1. **`useGetCatalogues(pageIndex, pageSize)`**:
    
    - Calls `GET /catalogue?index={pageIndex}&size={pageSize}`.
        
    - Used to populate the main table.
        
2. **`useGetCatalogueById(id)`**:
    
    - Calls `GET /catalogue/:id`.
        
    - Used to populate the detail drawer. Ensure this query is only enabled when an `id` is actually provided (e.g., `enabled: !!id`).
        

_(Note: Ensure your API client passes the required `x-tenant-slug` header)._

---

## 4. UI Components Requirements

### A. The Data Table (`CatalogueTable.tsx` & `columns.tsx`)

- Use **TanStack Table** integrated with **Shadcn UI Table** components.
    
- Implement server-side pagination using the `meta` object from the API response (`pageIndex`, `pageSize`, `totalPages`, `total`).
    
- Columns should display: Item Name & Avatar, Category, Current Price (using the mono font), and Stock count.
    
- When a user clicks a row, it should update the local state (e.g., `selectedCatalogueId`) to open the Details Drawer.
    

### B. The Details Drawer (`CatalogueSheet.tsx`)

- Use the **Shadcn UI `Sheet` component** configured to slide in from the `right` (`<SheetContent side="right">`).
    
- It must extend to take up **half the screen** on desktop (e.g., `sm:max-w-[50vw]`).
    
- It should accept a `catalogueId` as a prop. Inside this component, call the `useGetCatalogueById(catalogueId)` custom hook.
    
- **Loading State:** Show a clean Shadcn `Skeleton` layout while the individual data fetches.
    
- **Content:** Display the master item details, map through the `supplierQuotes` (Pricing history), and list the `inventoryItems` (Warehouse breakdown). Use the typography variables strictly here.
    

---

## Instructions for the AI

1. First, analyze the requirements and existing codebase (if context is provided).
    
2. Generate the code step-by-step starting with the Custom Hooks.
    
3. Then generate the Table Columns, followed by the main Table component.
    
4. Finally, generate the Shadcn Sheet/Drawer component.
    
5. Ensure all TypeScript interfaces perfectly match the expected API JSON payloads.
    
