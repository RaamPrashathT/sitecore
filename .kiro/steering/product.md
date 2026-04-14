# Product Overview

This is a construction project management platform for organizations. It enables teams to manage projects, phases, requisitions, site logs, and procurement through a multi-tenant, role-based system.

## Core Concepts

- **Organizations** are the top-level tenant. Users belong to organizations via a `Membership` with a role (ADMIN, ENGINEER, CLIENT, IDLE).
- **Projects** live within an organization. Users are assigned to projects via `Assignment` records.
- **Phases** break a project into stages with budgets, deadlines, and payment tracking.
- **Requisitions** are material/resource requests tied to a phase, going through a DRAFT → PENDING_APPROVAL → APPROVED/REJECTED lifecycle.
- **Catalogue** is an org-level library of materials/labour/equipment with supplier quotes.
- **Site Logs** are daily progress entries on a phase, with images and comments.
- **Notifications** are in-app alerts scoped to org members for key events (approvals, status changes, invitations).

## User Roles

- `ADMIN` — full org management, approvals, catalogue, invitations
- `ENGINEER` — project work, site logs, requisitions
- `CLIENT` — read-only project visibility
- `IDLE` — newly registered, not yet assigned to an org
