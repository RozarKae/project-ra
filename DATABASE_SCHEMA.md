# DATABASE_SCHEMA.md — Project RA SaaS Platform

This document describes the Firestore database design, sub-collection paths, object schemas, and properties.

---

## 1. Multi-Tenant Collection Structure

All collections are relative to a parent workspace and wedding path:
`workspaces/{workspaceId}/weddings/{weddingId}/{collection}`

### Guests Collection (`guests`)
* **Path**: `workspaces/{workspaceId}/weddings/{weddingId}/guests/{guestId}`
* **Document Schema**:
  | Field | Type | Description |
  | :--- | :---: | :--- |
  | `id` | string | Unique document ID |
  | `name` | string | Full name of invitee |
  | `phone` | string | Normalized contact string |
  | `side` | string | `"bride"` or `"groom"` |
  | `rsvpStatus` | string | `"attending"`, `"declined"`, or `"pending"` |
  | `isVip` | boolean | VIP status indicator |
  | `familyName` | string (optional) | Family name grouping |
  | `village` | string (optional) | Village/City |
  | `invitationStatus`| string (optional) | `"sent"`, `"opened"`, `"failed"` |
  | `notes` | string (optional) | Special comments |
  | `createdAt` | string | ISO timestamp |
  | `updatedAt` | string (optional) | ISO timestamp |
  | `isDeleted` | boolean | Soft delete toggle flag |
  | `deletedAt` | string (optional) | ISO timestamp |
  | `deletedBy` | string (optional) | Email of deleting operator |

### Activities Collection (`activities`)
* **Path**: `workspaces/{workspaceId}/weddings/{weddingId}/activities/{activityId}`
* **Document Schema**:
  | Field | Type | Description |
  | :--- | :---: | :--- |
  | `id` | string | Unique log ID |
  | `timestamp` | string | ISO timestamp |
  | `user` | string | Email/UID of operator |
  | `action` | string | `"Create"`, `"Update"`, `"Delete"`, `"Merge"` |
  | `entity` | string | Affected entity type (`"guest"`, `"family"`) |
  | `entityId` | string | Target ID of modified document |
  | `details` | string | Human-readable log details |

### Families Collection (`families`)
* **Path**: `workspaces/{workspaceId}/weddings/{weddingId}/families/{familyId}`
* **Document Schema**:
  | Field | Type | Description |
  | :--- | :---: | :--- |
  | `name` | string | e.g. "Jenkins Family" |
  | `lastUpdated` | string | ISO timestamp |

### Settings Collection (`settings`)
* **Path**: `workspaces/{workspaceId}/weddings/{weddingId}/settings/general`
* **Document Schema**:
  | Field | Type | Description |
  | :--- | :---: | :--- |
  | `nikahDate` | string | Nikah ISO date |
  | `rsvpOpen` | boolean | Block/Allow public RSVPs |
  | `theme` | string | UI Theme setting |

---

## 2. Root Collections (Global Tenant Management)

### Workspaces Directory (`workspaces`)
* **Path**: `workspaces/{workspaceId}`
* **Document Schema** (under `profile` subdocument):
  | Field | Type | Description |
  | :--- | :---: | :--- |
  | `ownerId` | string | UID of workspace creator |
  | `companyName`| string | Dynamic corporate label |
  | `billingTier`| string | `"free"`, `"pro"`, `"premium"` |
