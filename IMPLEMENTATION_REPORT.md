# Project RA — Sprint S.2: My Profile Implementation Report

This report summarizes the design patterns, security rules, and code modifications for the **My Profile** settings page.

---

## 1. Files Modified & Created

| File Path | Status | Description |
| :--- | :---: | :--- |
| **`src/types/user.ts`** | [NEW] | Defined types for `UserProfileData`. |
| **`src/repositories/UserRepository.ts`** | [NEW] | Created profile load, real-time subscribe, and setDoc write handlers. |
| **`src/hooks/useUserProfile.ts`** | [NEW] | Formulated settings load hook for profile views. |
| **`src/modules/settings/UserProfile.tsx`** | [NEW] | Developed Personal Information forms, avatar uploads, timezone/country selects, password updates with strength indicators, account metadata cards, and UI preferences (Theme, Compact, Animations). |
| **`src/components/layout/Sidebar.tsx`** | [MODIFY] | Added the "My Profile" sub-navigation link under the "Settings" menu parent. |
| **`src/App.tsx`** | [MODIFY] | Registered `/admin/settings/profile` route in the Protected Route block. |

---

## 2. Firestore Schema

* **Document Path**: `users/{userId}`
* **Document Attributes**:
```json
{
  "userId": "mock-admin-uid-12345",
  "firstName": "Sarah",
  "lastName": "Jenkins",
  "displayName": "Sarah J.",
  "bio": "Lead Wedding Planner and Administrator.",
  "photoURL": "https://firebasestorage.googleapis.com/... or data:image/png;base64,...",
  "phone": "+919876543210",
  "country": "India",
  "timezone": "UTC+05:30",
  "language": "en",
  "theme": "dark",
  "compactMode": false,
  "animationPreference": "full",
  "createdAt": "2026-07-08T10:00:00Z",
  "lastLogin": "2026-07-10T16:22:00Z",
  "emailVerified": true,
  "role": "owner",
  "workspaceId": "default_workspace",
  "updatedAt": "2026-07-10T16:23:00Z",
  "updatedBy": "sarah@projectra.com"
}
```

---

## 3. Storage Paths

* **Storage Directory**: `users/{userId}/profile/`
* **Objects Saved**:
  * `photo_{timestamp}` (User profile photo avatar)
* **Local Fallback**: Like the workspace assets, local avatar photos convert to Base64 DataURIs via a `FileReader` and persist inside LocalStorage when running offline.

---

## 4. Firebase Authentication Integration

* **Email**: Read-only field extracted directly from `auth.currentUser.email` or mock settings.
* **Password Modifications**:
  * Supports real-time password updates via Firebase Auth `updatePassword` on the active user instance.
  * Dynamically checks password complexity and renders a colored strength progress bar (*Weak*, *Medium*, *Strong*).
  * Prompts the administrator for confirmation (`window.confirm`) prior to credentials submission.

---

## 5. UI Preferences & Visual Design

* **Theme Options**: Supports swapping Dark/Light/System theme targets.
* **Compact Mode**: Toggles table padding layouts.
* **Animation Profiles**: Allows swapping Full Animations ( luxury staggers and fades ) vs Reduced Animations ( low motion styles ) to respect accessibility rules.

---

## 6. Known Issues

* None. breakpoint structures adapt cleanly.
