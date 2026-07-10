# ROLE_PERMISSION_MATRIX.md — Project RA SaaS Platform

This document describes the role-based access control (RBAC) rules and permissions matrix for the Wedding Management Platform.

---

## 1. Role Matrix Details

We define four user roles:
* **Owner**: The creator of the workspace. Absolute permissions.
* **Admin**: Planner with operational management rights (cannot adjust billing tiers).
* **Editor**: Planner or family helper who can add or edit guests, but cannot perform deletions or alter global configurations.
* **Viewer**: Client read-only access (for checking stats, rosters, and tables).

| Operations | Owner | Admin | Editor | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **Read Dashboard Stats** | ✅ | ✅ | ✅ | ✅ |
| **Read Guest Roster** | ✅ | ✅ | ✅ | ✅ |
| **Export/Print Guest Lists**| ✅ | ✅ | ✅ | ✅ |
| **Add Guest Record** | ✅ | ✅ | ✅ | ❌ |
| **Update Guest Record** | ✅ | ✅ | ✅ | ❌ |
| **Soft Delete Guest** | ✅ | ✅ | ❌ | ❌ |
| **Manage Family Groups** | ✅ | ✅ | ✅ | ❌ |
| **Alter Wedding Settings** | ✅ | ✅ | ❌ | ❌ |
| **Billing & Workspaces** | ✅ | ❌ | ❌ | ❌ |

---

## 2. Code Implementation

Roles are validated dynamically via helper functions in [auth.ts](file:///e:/Arifa%20Khan%20Wedding/Invitaatio/Project-RA/src/types/auth.ts):

```typescript
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export const hasPermission = (role: UserRole, action: 'read' | 'write' | 'delete' | 'admin'): boolean => {
  switch (role) {
    case 'owner':
      return true;
    case 'admin':
      return action !== 'admin';
    case 'editor':
      return action === 'read' || action === 'write';
    case 'viewer':
      return action === 'read';
    default:
      return false;
  }
};
```
These permissions check can be implemented inside client action paths to hide deletion buttons or block unauthorized database writes.
