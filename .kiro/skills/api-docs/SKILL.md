---
name: api-docs
description: Read a server routes file and generate a complete Postman collection JSON with success and error examples. Use when asked to document an API, generate Postman docs, or create API documentation for a feature.
user-invocable: true
argument-hint: "[path to routes file] e.g. server/src/modules/product/product.routes.ts"
---

## What This Skill Does
Reads the routes file + its sibling controller, service, and schema files,
then generates a complete Postman collection JSON at:
`docs/postman/[module-name].postman_collection.json`

## MANDATORY PREPARATION
Before generating anything:
1. Read the routes file provided
2. Read the sibling files in the same module folder:
   - `[module].controller.ts`
   - `[module].service.ts`
   - `[module].schema.ts`
   - `[module].types.ts` (if exists)
3. Only then generate — never guess field names or route behavior

---

## Auth Model — Read This Carefully

This project uses **cookie-based stateful sessions via Redis**. There is NO Bearer token or Authorization header.

### How auth works:
- `authorize` middleware — checks `session` cookie against Redis
- `orgAuthorize` middleware — reads `x-tenant-slug` header, resolves org membership from session
- `projectAuthorize` middleware — reads `x-tenant-slug` + `x-project-slug` headers, resolves project access

### What this means for every request:

**Headers always required (when org-scoped):**
```
x-tenant-slug: {{tenantSlug}}
```

**Headers required for project-scoped routes:**
```
x-tenant-slug: {{tenantSlug}}
x-project-slug: {{projectSlug}}
```

**Auth is via cookie — set this in Postman collection settings:**
```json
{
  "cookie": {
    "key": "session",
    "value": "{{sessionCookie}}"
  }
}
```

There is NO `Authorization: Bearer` header anywhere. Never generate one.

### Middleware chain per route — read the routes file to determine which apply:
- `authorize` only → just needs session cookie
- `authorize` + `orgAuthorize` → needs cookie + `x-tenant-slug`
- `authorize` + `orgAuthorize` + `projectAuthorize` → needs cookie + both slug headers

---

## Base URL

```
{{baseUrl}}
```
Default value: `http://localhost:5000`

**There is no `/api` prefix.** Routes are mounted directly.

Example from actual codebase:
```
POST http://localhost:5000/project/phase
```
NOT `http://localhost:5000/api/project/phase`

---

## Collection Variables

Every collection MUST define these variables:
```json
[
  { "key": "baseUrl", "value": "http://localhost:5000", "type": "string" },
  { "key": "tenantSlug", "value": "globalspan-infrastructure", "type": "string" },
  { "key": "projectSlug", "value": "skyline-apartments", "type": "string" },
  { "key": "sessionCookie", "value": "", "type": "string" },
  { "key": "recordId", "value": "", "type": "string" }
]
```

Use realistic construction company slug values — not "my-org" or "test-tenant".

---

## Setup — 2-Step Auth Chain (Always First Two Requests)

### Request 1: Login
```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "raamthiruna@gmail.com",
  "password": "asdfghjkl"
}
```

Tests script:
```js
pm.test('Login successful', () => pm.response.to.have.status(200));

// Extract session cookie from Set-Cookie header and save it
const cookieHeader = pm.response.headers.get('Set-Cookie');
if (cookieHeader) {
    const match = cookieHeader.match(/session=([^;]+)/);
    if (match) {
        pm.collectionVariables.set('sessionCookie', match[1]);
        pm.test('Session cookie saved', () => pm.expect(match[1]).to.be.a('string'));
    }
}
```

---

### Request 2: Load Org Identity
```
POST {{baseUrl}}/org/identity
Content-Type: application/json
Cookie: session={{sessionCookie}}

{
  "slug": "{{tenantSlug}}"
}
```

Tests script:
```js
pm.test('Org identity loaded', () => pm.response.to.have.status(200));

const res = pm.response.json();
pm.test('Has org data', () => {
    pm.expect(res).to.have.property('id');
    pm.expect(res).to.have.property('slug');
    pm.expect(res).to.have.property('role');
});

// Save for use in all subsequent requests
pm.collectionVariables.set('orgId', res.id);
pm.collectionVariables.set('resolvedRole', res.role);

pm.test('Org ID saved', () => pm.expect(res.id).to.be.a('string'));
```

---

### Collection-Level Pre-Request Script
Set this at the **collection level** (not per-request) so every request automatically
gets the cookie attached without repeating it:

```js
// Attach session cookie to every request automatically
const session = pm.collectionVariables.get('sessionCookie');
if (session) {
    pm.request.headers.upsert({
        key: 'Cookie',
        value: `session=${session}`
    });
}
```

This means:
- You run Request 1 (login) once → cookie saved
- You run Request 2 (org/identity) once → orgId + role saved  
- Every request after that automatically has the cookie attached
- Every request that needs `x-tenant-slug` uses `{{tenantSlug}}` which was set in collection variables

---

## Collection Variables (Updated)

```json
[
  { "key": "baseUrl",       "value": "http://localhost:5000", "type": "string" },
  { "key": "tenantSlug",    "value": "globalspan-infrastructure", "type": "string" },
  { "key": "projectSlug",   "value": "skyline-apartments", "type": "string" },
  { "key": "sessionCookie", "value": "", "type": "string" },
  { "key": "orgId",         "value": "", "type": "string" },
  { "key": "resolvedRole",  "value": "", "type": "string" },
  { "key": "recordId",      "value": "", "type": "string" }
]
```

`sessionCookie`, `orgId`, and `resolvedRole` start empty — they get filled automatically
when you run the two setup requests.

---

## Folder Structure (Updated)

```
[Module Name] API
├── 🔧 Setup (run these first, in order)
│   ├── 1. Login — saves session cookie
│   └── 2. Org Identity — saves orgId + role
├── ✅ Success Cases
│   └── [one per route]
└── ❌ Error Cases
    └── [all failure scenarios]
```

---

## How Every Real Request Uses the Chain

After setup, a project-scoped request looks like:

```
POST {{baseUrl}}/project/phase
Content-Type: application/json
x-tenant-slug: {{tenantSlug}}
x-project-slug: {{projectSlug}}
Cookie: session={{sessionCookie}}    ← injected automatically by collection pre-request script

{
  "name": "Foundation & Footings",
  "description": "Initial excavation and concrete pouring.",
  "budget": 25000,
  "startDate": "2024-05-01T08:00:00Z",
  "paymentDeadline": "2024-05-15T17:00:00Z"
}
```

The user never manually sets the cookie — it flows automatically from the login step.

---

## Error Cases That Test the Auth Chain Specifically

Always generate these in the Error Cases folder for every module:

| Request name | What to break | Expected status |
|---|---|---|
| `[Route] — No session cookie` | Remove Cookie header | 401 |
| `[Route] — Expired session` | Set cookie to `invalid-session-xyz` | 401 |
| `[Route] — Missing x-tenant-slug` | Remove that header | 400 |
| `[Route] — Wrong org slug` | Set `x-tenant-slug: nonexistent-org-xyz` | 401 |
| `[Route] — Wrong project slug` | Set `x-project-slug: nonexistent-project-xyz` | 401 |

## Folder Structure Inside Collection

```
[Module Name] API
├── 🔧 Setup
│   └── Login & Save Session
├── ✅ Success Cases
│   └── [one request per route, happy path]
└── ❌ Error Cases
    └── [all failure scenarios per route]
```

---

## For Every Route, Generate

### Success Cases
One request per route showing happy path:
- Correct headers based on middleware chain
- Realistic construction domain body values (see Body Rules below)
- Tests that validate status + response shape
- If response contains an `id`, save it: `pm.collectionVariables.set('recordId', res.data.id)`

Example success tests for a POST:
```js
pm.test('Status 201', () => pm.response.to.have.status(201));
pm.test('Returns created record', () => {
    const res = pm.response.json();
    pm.expect(res.data).to.have.property('id');
    pm.collectionVariables.set('recordId', res.data.id);
});
```

### Error Cases
Generate ALL of these that apply per route:

| Scenario | Status | Trigger | When |
|---|---|---|---|
| No session cookie | 401 | Remove Cookie header | Every protected route |
| Invalid/expired session | 401 | Set cookie to `invalid-session-id` | Every protected route |
| Missing x-tenant-slug | 400 | Remove header | orgAuthorize routes |
| Wrong org (no access) | 401 | Set slug to `nonexistent-org` | orgAuthorize routes |
| Missing x-project-slug | 401 | Remove header | projectAuthorize routes |
| Wrong project | 401 | Set slug to `nonexistent-project` | projectAuthorize routes |
| Validation error | 400 | Send body missing required fields | Routes with body + schema |
| Invalid field type | 400 | Send wrong types (string for number) | Routes with body + schema |
| Resource not found | 404 | Use `{{recordId}}` as `nonexistent-id` | Routes with :id param |
| Wrong role | 403 | Use engineer session on admin-only route | Role-restricted routes |

Each error request name format: `[Route Name] — [Error Scenario]`

Example error test:
```js
pm.test('Status 401', () => pm.response.to.have.status(401));
pm.test('Has error message', () => {
    const res = pm.response.json();
    pm.expect(res.success).to.equal(false);
    pm.expect(res).to.have.property('message');
});
```

---

## Body Rules — Realistic Construction Values

Read the Zod schema for actual field names and types. Then use values from this domain:

| Field type | Example values |
|---|---|
| Phase/item names | "Foundation & Footings", "Structural Steel Frame", "MEP Rough-In", "Concrete Slab Pour" |
| Descriptions | "Initial excavation and concrete pouring for load-bearing columns" |
| Budget amounts | 25000, 180000, 450000, 12500.50 |
| Quantities | 50, 200, 1000, 2500 |
| Unit prices | 450.00, 1200.50, 85.00 |
| Material names | "Steel Rebar 12mm", "Portland Cement 50kg", "Safety Helmets", "M20 Bolts" |
| Dates | "2024-05-01T08:00:00Z", "2024-06-15T17:00:00Z" |
| Slugs | "skyline-apartments", "globalspan-infrastructure", "phase-1" |
| Emails | "engineer@constructco.com", "admin@globalspan.com" |

NEVER use: "string", "test", "foo", "bar", "example", "123", "value"

For validation error cases — strategically break the body:
- Remove a required field entirely
- Send a string where a number is expected
- Send an empty string for a required min-length field
- Send a negative number for a positive field

---

## Route Header Matrix

Read the middleware stack on each route from the routes file and apply:

| Middleware present | Cookie | x-tenant-slug | x-project-slug |
|---|---|---|---|
| `authorize` | ✅ | ❌ | ❌ |
| `authorize` + `orgAuthorize` | ✅ | ✅ | ❌ |
| `authorize` + `orgAuthorize` + `projectAuthorize` | ✅ | ✅ | ✅ |

---

## Output

Single valid Postman Collection v2.1 JSON.
File: `docs/postman/[module-name].postman_collection.json`

Collection info:
```json
{
  "info": {
    "name": "[Module Name] API",
    "description": "Auth: Cookie-based session (Redis). Headers: x-tenant-slug + x-project-slug where applicable. No /api prefix. Generated from [routes file path].",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  }
}
```

The file must be valid and importable into Postman with zero edits.

## NEVER
- Generate `Authorization: Bearer` headers — this project uses cookies
- Add `/api` prefix to any URL
- Hardcode any URL, slug, or session value — always use `{{variable}}`
- Use placeholder body values like "string", "test", "foo"
- Skip error cases — every route needs at minimum: no session, wrong slug, and one domain error
- Generate partial JSON — the output must be complete and valid