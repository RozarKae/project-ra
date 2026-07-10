# Project RA — Technical Logbook & Audit Report

## Document Context
* **Sprint Focus**: Platform Architecture Refactor (Multi-Wedding SaaS Ready)
* **Project Version**: v2.0.0 (SaaS Edition)
* **Last Updated**: July 10, 2026
* **Objective**: Refactor the codebase from a single wedding invite into an isolated multi-tenant architecture scoped under dynamic workspace/wedding references.

---

## 1. Directory Structure Log

The folder taxonomy represents the new modular layout:

| Path | Status | Target / Purpose |
| :--- | :---: | :--- |
| **`src/types/auth.ts`** | [NEW] | Scope definitions for roles (`owner`, `admin`, `editor`, `viewer`) and permission maps. |
| **`src/types/activity.ts`** | [NEW] | Audit logs typings. |
| **`src/contexts/WorkspaceContext.tsx`** | [NEW] | Tenant routing context tracking `currentWorkspaceId` and `currentWeddingId`. |
| **`src/types/guest.ts`** | [MODIFY] | Upgraded fields to add soft-delete trackers and search village/status. |
| **`src/repositories/`** | [NEW] | Centralized queries layer abstracting Firestore/mock storage under `BaseRepository`. Contains `GuestRepository`, `ActivityRepository`, `FamilyRepository`, `RsvpRepository`, `InvitationRepository`, `SettingRepository`. |
| **`src/hooks/`** | [NEW] | React hook observers: `useGuests` and `useActivityLogs` wrapping repositories. |
| **`src/modules/`** | [NEW] | Sub-module view folders (`src/modules/dashboard/` and `src/modules/guests/`). |
| **`src/App.tsx`** | [MODIFY] | Remapped imports to new modules directories and wrapped router with `WorkspaceProvider`. |
| **`src/services/guestService.ts`** | [MODIFY] | Wraps the new repositories under legacy functions to ensure backward compatibility. |
| **`src/pages/admin/`** | [MODIFY] | Clean re-exports of modules to prevent route breaks in parallel development. |

---

## 2. Technical Decision Log (SaaS Refactor Edition)

### Decision R-1: Workspace Context Scoping
* **Status**: Approved
* **Context**: Current wedding instance needs to seamlessly map into a SaaS path structure without writing extensive config loaders.
* **Decision**: Configured a `WorkspaceProvider` that defaults the workspace ID to `default_workspace` and the wedding ID to `arifa_rozar_wedding`.
* **Impact**: Moves data queries to the dynamic nesting paths while preserving instant local functionality.

### Decision R-2: Data Repositories Abstraction
* **Status**: Approved
* **Context**: Direct Firestore query references in page files clutter markup and prevent testing.
* **Decision**: Abstracted database connections into classes extending `BaseRepository`. All data fetching checks configured environments and falls back to storage keys segmented by workspace and wedding.
* **Impact**: Dynamic data isolation. Swapping tenant IDs immediately loads separate rosters.

### Decision R-3: Custom Action Hooks
* **Status**: Approved
* **Context**: Prevent duplicate subscription listeners and coordinate mount triggers cleanly.
* **Decision**: Created `useGuests()` and `useActivityLogs()` hooks to manage state streams and mutations.
* **Impact**: React components consume simple state APIs: `const { guests, save, remove } = useGuests();`.

### Decision R-4: Page re-exports for Backward Compatibility
* **Status**: Approved
* **Context**: Other developer branches or documentation might reference paths inside `src/pages/admin/`.
* **Decision**: Refactored the legacy page files to re-export the modular versions.
* **Impact**: Prevents compilation breaks, ensuring seamless merges.

---

## 3. Documentation Deliverables Generated

The following blueprints were generated in the project root:
* **`SYSTEM_ARCHITECTURE.md`**: Outlines decoupled database scopes, layers, and offline syncing.
* **`DATABASE_SCHEMA.md`**: Formulates collection paths and field properties.
* **`ROLE_PERMISSION_MATRIX.md`**: Charts actions allowed for each RBAC tier.
* **`FOLDER_STRUCTURE.md`**: Explains modular folder taxomomies.
* **`ROADMAP.md`**: Maps milestones for upcoming sprints.

---

## 4. Verification & Compiles

* Proactively executed `npm run build` using the cmd executor wrapper.
* Result: **Vite build compiled successfully in 2.18s** with zero errors. All type parameters and import routes pass verification.
