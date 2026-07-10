# ROADMAP.md — Project RA SaaS Platform

This document maps out the roadmap milestones to extend Project RA into a comprehensive, multi-wedding SaaS system.

---

## 🚀 Completed Milestones

### Sprint A (UI Foundations)
* Audited dead code, standardized responsive layouts, and designed a dashboard overview interface.

### Sprint B (Guest Management & Firestore Upgrade)
* Formulated local database queries with offline tab caches.
* Refactored project directories into independent feature modules (`src/modules/*`).
* Scoped all collection paths dynamically under `workspaces/{workspaceId}/weddings/{weddingId}/`.
* Created abstract repositories and custom hooks (`useGuests`, `useActivityLogs`).
* Established a role-based access control matrix.

---

## 🔮 Upcoming Sprint Milestones

### Sprint C: Public RSVP Integration & Firestore Sync
* **Target**: August 2026
* **Scope**:
  * Build the public-facing Nikah RSVP portal.
  * Dynamically fetch invitation metadata via `/invitation/:guestId` to customize invitations.
  * Connect form inputs directly to the `rsvps` sub-collection inside the active wedding instance.
  * Add automatic check-in QR scanner logger endpoints.

### Sprint D: Seating & Layout Planner
* **Target**: September 2026
* **Scope**:
  * Implement an interactive seating assignment builder (drag-and-drop table layouts).
  * Group guests by table numbers, tracking VIP priority limits.
  * Map guests/families visually to allocated chairs.

### Sprint E: Vendor and Budget Expense Trackers
* **Target**: October 2026
* **Scope**:
  * Build vendor checklists (Caterers, Florists, Venues).
  * Implement ledger cards to record wedding expenses, calculating budgets and deposits.
  * Wire graphs showing expense categories.

### Sprint F: Multi-Tenant Dashboard Generator
* **Target**: November 2026
* **Scope**:
  * Enable tenant accounts registration and self-service workspaces creation.
  * Add subscription billing tiers (Stripe checkout integrations).
  * Build a landing page builder allowing users to style and generate custom public wedding themes.