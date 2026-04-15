# Product Overview

Sitecore is a multi-tenant project management and procurement platform for construction and engineering organizations.

## Core Capabilities

- **Authentication**: Registration, login, email verification, 2FA, Google OAuth, invitation-based onboarding
- **Organizations**: Multi-tenant architecture with org switching, member invitations, and role-based access (ADMIN, ENGINEER, CLIENT, IDLE)
- **Projects**: Project creation, phase management, progress tracking, and project-scoped member management
- **Catalogue**: Supplier quote management — multiple quotes per catalogue item, inventory tracking, categorized by Materials, Labour, Equipment, Subcontractors, Transport, Overhead
- **Requisitions**: Project-level requisition creation, approval workflows, and status tracking
- **Dashboard**: Admin view of pending approvals, requisitions, and payment statuses
- **Notifications**: Real-time notifications for requisitions, payments, and project events
- **User Management**: Engineers and clients managed per organization with invite workflows

## Multi-Tenancy Model

Each organization is identified by a URL slug (`/:orgSlug`). All data is scoped to an `organizationId`. Projects are further scoped by a project slug (`/:orgSlug/:projectSlug`). Tenant context is injected automatically via HTTP headers on every API request.
