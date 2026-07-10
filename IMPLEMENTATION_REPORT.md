# Project RA — Sprint S.3: Team Management Implementation Report

This report summarizes the design patterns, role-based access control (RBAC), database structures, and components created for the **Team Management** module.

---

## 1. Files Modified & Created

| File Path | Status | Description |
| :--- | :---: | :--- |
| **`src/App.tsx`** | [MODIFY] | Registered `/admin/settings/team` route under the protected admin layout routing block. |
| **`src/modules/settings/UserProfile.tsx`** | [MODIFY] | Resolved a syntax error where an unused JSX block was left outside the component boundary. |
| **`src/modules/settings/TeamManagement.tsx`** | [NEW] | Developed the full Team Management dashboard: overview stats, responsive members list, invite workflows, permission grid, and activity summary. |

---

## 2. Firestore Schema & Collections

We created and integrated two new sub-collections within the Workspace scope:

### A. Team Members Roster
* **Collection Path**: `workspaces/{workspaceId}/members`
* **Document Attributes**:
```json
{
  "userId": "admin-dad",
  "email": "dad@photomagic.com",
  "displayName": "Dad",
  "photoURL": "https://lh3.googleusercontent.com/a/...",
  "role": "admin",
  "status": "active",
  "joinedAt": "2026-07-09T08:30:00Z",
  "lastActive": "2026-07-10T16:20:00Z"
}
```

### B. Collaborator Invitations
* **Collection Path**: `workspaces/{workspaceId}/invitations`
* **Document Attributes**:
```json
{
  "id": "inv-1783682242357",
  "email": "collab@example.com",
  "role": "editor",
  "token": "token_z8f9h3k2j",
  "status": "pending",
  "createdAt": "2026-07-10T16:45:00Z",
  "expiresAt": "2026-07-17T16:45:00Z",
  "createdBy": "rozar@nikahsandweddings.com",
  "message": "Join us to organize the guest list sections!"
}
```

---

## 3. Role-Based Access Control (RBAC)

The module enforces strict authorization logic:

* **Workspace Owner (`owner`)**: Full read and write authority. Only Owners can trigger:
  - Inviting new members (`+ Invite Member`).
  - Revoking pending invitations.
  - Modifying other collaborator roles (`Change Role`).
  - Activating/disabling members (`Disable User`).
  - Offboarding collaborators (`Remove User`).
* **Collaborator Roles (`admin`, `editor`, `viewer`)**: Read-only permission. Accessing `/admin/settings/team` displays a banner alerting them to their read-only state. Action buttons and context menus are hidden or disabled.
* **Self-Modification Guard**: The platform prevents owners from removing or disabling their own accounts.
* **Privilege Escalation Block**: Dropdown lists and API endpoints dynamically filter role assignments so no user can assign a role higher than their own (Hierarchy: `owner` > `admin` > `editor` > `viewer`).

---

## 4. Components Created

### `TeamManagement` (`src/modules/settings/TeamManagement.tsx`)
A unified settings layout adhering to the premium design language of Project RA:
* **Section 1 (Team Overview)**: Displays 7 KPI count-up metrics.
* **Section 2 (Team Members)**: A fully responsive grid that renders a detailed data table on larger viewports and adapts into compact cards on mobile screens to prevent horizontal scroll layout shifts.
* **Section 3 (Invite Modal)**: High-fidelity dialog to capture invitation details, set tokens, and submit records.
* **Section 4 (Role Matrix)**: Styled read-only grid outlining operations permissions for all roles.
* **Section 5 (Activity Log)**: Fetches and sorts log entries using `useActivityLogs`, displaying the latest 20 actions.

---

## 5. Known Issues

* **Email Dispatch Bypass**: Email server hooks are stubbed out. The invitation document successfully saves to Firestore with validation tokens, but SMTP/SendGrid delivery is bypassed in Sprint S.3.
