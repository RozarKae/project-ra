# SYSTEM_ARCHITECTURE.md — Project RA SaaS Platform

This document describes the layered, multi-tenant system architecture built for Project RA to scale as a Multi-Wedding SaaS Platform.

---

## 1. Architectural Layers

Project RA follows a clean, decoupled layout architecture:

```
┌────────────────────────────────────────────────────────┐
│                      Presentation                      │
│     React Views (src/modules/*, src/components/*)       │
└──────────────────────────┬─────────────────────────────┘
                           │ Consumes hooks
┌──────────────────────────▼─────────────────────────────┐
│                   State & Context Hooks                │
│     SaaS Context (src/contexts/WorkspaceContext.tsx)    │
│     SaaS React Hooks (src/hooks/useGuests.ts, etc.)    │
└──────────────────────────┬─────────────────────────────┘
                           │ Calls repository API
┌──────────────────────────▼─────────────────────────────┐
│                    Repository Pattern                  │
│       Data Repositories (src/repositories/*)           │
└──────────────────────────┬─────────────────────────────┘
                           │ Normalizes connections
┌──────────────────────────▼─────────────────────────────┐
│                    Data Source Selector                │
│   (Firestore SDK / Multi-Tenant LocalStorage fallback)  │
└────────────────────────────────────────────────────────┘
```

1. **Presentation Layer**: Consists of modular pages (`src/modules/`) and reusable stateless controls (`src/components/common/`). Page components do not write direct Firestore queries.
2. **Context & Hooks Layer**: Coordinates user state, current workspace context, and exports telemetry.
3. **Repository Layer**: The absolute data accessor. Coordinates reads and writes. Encapsulates query logic, soft-deletion, and logging.
4. **Data Sources**: Evaluates `isFirebaseConfigured`. Integrates real-time streams via the Firestore SDK, or falls back to standard sandbox keys locally.

---

## 2. Multi-Tenancy Scoping (Dynamic Pathing)

To avoid global namespace collisions, all tenant data paths are mapped under parent workspaces and sub-weddings:

```
workspaces/{workspaceId}/weddings/{weddingId}/{collection}
```

* **First Instance Configuration**: The current wedding instance is scoped under:
  - Workspace: `default_workspace`
  - Wedding: `arifa_rozar_wedding`
* **Dynamic Resolution**: If dynamic pathing routes are added later (e.g. `/workspace/:wId/wedding/:wedId`), the `WorkspaceContext` receives parameters from the URL router and updates all hooks and repositories instantly.

---

## 3. Offline Caching & Sync

* Enabled client-side multi-tab persistence using Firebase `persistentLocalCache` and `persistentMultipleTabManager` from IndexedDB.
* Writes are queued locally and automatically pushed to the cloud once network connectivity is verified.
