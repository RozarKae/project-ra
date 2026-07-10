# Project RA — Firestore Architecture & Schema Design

This document outlines the Firestore configuration, collection designs, indexing strategies, and security assumptions for Project RA's Wedding Management System.

---

## 1. Firestore Database Schema

We have structured the Firestore database into five core collections to enable collaborative guest tracking and auditing:

```
Firestore Root
├── users (Collection)
│   └── [uid] (Document) -> Admin profile records
├── guests (Collection)
│   └── [guestId] (Document) -> Roster records (with soft delete)
├── families (Collection)
│   └── [familyId] (Document) -> Groups and tables linking
├── activities (Collection)
│   └── [activityId] (Document) -> Audit history
└── settings (Collection)
    └── [settingsId] (Document) -> Telemetry parameters
```

### Collection: `guests`
* **Purpose**: Primary roster of invitees.
* **Fields**:
  ```typescript
  {
    name: string;          // Full guest name
    phone: string;         // E.164 normalized phone string
    side: "bride" | "groom";
    rsvpStatus: "attending" | "declined" | "pending";
    isVip: boolean;
    familyName?: string;   // Optional text linking to the families collection
    notes?: string;        // Optional notes
    createdAt: string;     // ISO timestamp
    updatedAt?: string;    // ISO timestamp
    isDeleted: boolean;    // Soft-delete toggle flag
  }
  ```

### Collection: `activities`
* **Purpose**: Logs CRUD and merge actions for security audit.
* **Fields**:
  ```typescript
  {
    timestamp: string;     // ISO timestamp
    action: string;        // e.g. "Add Guest", "Update", "Delete", "Import"
    details: string;       // Detailed description
    operator: string;      // Admin email address
  }
  ```

### Collection: `families`
* **Purpose**: Tracks defined family circles and group counts.
* **Fields**:
  ```typescript
  {
    name: string;          // Jenkins Family, Khan Family, etc.
    lastUpdated: string;   // ISO timestamp
  }
  ```

### Collection: `users`
* **Purpose**: Authenticated operators mapping.
* **Fields**:
  ```typescript
  {
    email: string;
    role: "administrator" | "planner";
    lastActive: string;
  }
  ```

### Collection: `settings`
* **Purpose**: Centralized application flags (e.g., Nikah Date, countdown coordinates).
* **Fields**:
  ```typescript
  {
    nikahDate: string;     // e.g. "2026-08-30T11:00:00"
    rsvpOpen: boolean;
  }
  ```

---

## 2. Database Indexes

Vite loads index declarations automatically. If composite queries are run in the future, the following indexes are required:

### Single Field Indexes (Built-in)
* Firestore automatically indexes all single fields in asc/desc order. Single field query sorting like `orderBy("timestamp", "desc")` works natively without extra configuration.

### Composite Indexes (For Advanced Filters)
If you combine filtering (where clauses) and ordering (sorting clauses) in Sprint C/D, you must provision these composite indexes:

1. **Collection**: `guests`
   * Fields: `side` (Ascending), `name` (Ascending)
   * Fields: `rsvpStatus` (Ascending), `name` (Ascending)
2. **Collection**: `activities`
   * Fields: `operator` (Ascending), `timestamp` (Descending)

---

## 3. Firebase Security Rules

To ensure that only authorized wedding administrators and event planners can modify records, apply the following **Firestore Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper to check if caller is an authenticated user
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Guests Collection: Authenticated admin reads and writes
    match /guests/{guestId} {
      allow read, write: if isAuthenticated();
    }
    
    // Activities Collection: Read and write for logged-in operators
    match /activities/{activityId} {
      allow read, write: if isAuthenticated();
    }
    
    // Families Collection: Manage groups
    match /families/{familyId} {
      allow read, write: if isAuthenticated();
    }
    
    // Users Profile Collection: Authenticated read
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    // Settings Collection: Read-only for public RSVP queries, write for auth admins
    match /settings/{settingsId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

---

## 4. Offline Persistence & Multi-Tab Sync

Offline caching is enabled on the client side using:
```typescript
initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
```

### Key Advantages
* **Offline CRUD**: Added/edited/deleted guests are cached in browser IndexedDB. Changes are automatically synced with Firestore servers as soon as internet connectivity returns.
* **Shared Tab Caches**: The multiple-tab manager coordinates write handles so that if you have 4 tabs open of the admin dashboard, they do not lock each other out and share a single cache.
* **No Layout Shifts**: Initial data queries read from IndexedDB, loading screens instantly and displaying data without waiting for network responses.
