# FOLDER_STRUCTURE.md — Project RA SaaS Platform

This document describes the refactored directory guidelines for Project RA.

---

## 1. Directory Tree Taxonomies

To build a modular frontend, we reorganized files into independent modules:

```
src/
├── app/                  # Core App routing, toaster, and providers configurations
├── components/           # Stateless shared user interface nodes
│   ├── common/           # Reusable controls (Button, Card, Input, Table, Modal)
│   └── layout/           # Shared wrappers (Header, Sidebar, Loader)
├── contexts/             # Global states providers (AuthContext, WorkspaceContext)
├── hooks/                # Custom React query hooks (useGuests, useActivityLogs)
├── lib/                  # Initialization configurations (firebase.ts, auth.tsx)
├── modules/              # Sub-feature module views and components
│   ├── dashboard/        # KPI panels and activities feed views
│   ├── guests/           # Grid listings, family groups, and CRUD modals
│   ├── rsvp/             # Public RSVP components
│   └── seating/          # Future Seating charts and tables
├── repositories/         # OOP Database Layer (BaseRepository, GuestRepository)
├── services/             # Legacy wrappers and general systems helper utilities
├── types/                # Unified TypeScript models and types (auth, guest, activity)
└── utils/                # Standalone functions (duplicateDetector, dates helpers)
```

---

## 2. Guidelines for Adding Modules

When building new SaaS features (e.g. Seating, Vendors, Expenses):

1. **Define Typings**: Create the type definitions inside `src/types/`.
2. **Write Repository**: Create a dedicated repository extending `BaseRepository` in `src/repositories/` to manage database fetches and writes.
3. **Write React Hook**: Wrap the repository subscriptions inside a custom React hook in `src/hooks/` to scope data under `useWorkspace()`.
4. **Build Component Module**: Build viewpages and forms under a new directory in `src/modules/<feature_name>/`.
5. **Register Route**: Add the routing paths in `src/App.tsx` and list them in the sidebar navigation array.
