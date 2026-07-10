# Project RA — Implementation Report: Sprint C.5 & Refinements

This report summarizes the design patterns, database paths, event categories, automatic hooks, and layouts developed for the **Guest Timeline & Activity History (Sprint C.5)** module and the **Unified Activity Feed Refinement**.

---

## 1. Files Created & Modified

| Category | File Path | Status | Description |
| :--- | :--- | :---: | :--- |
| **Model Type** | `src/types/activity.ts` | [MODIFY] | Extended `ActivityLog` interface with fields for `guestId`, `eventType`, `previousValue`, `newValue`, `performedBy`, `isPinned`, and `category`. |
| **Database** | `src/repositories/ActivityRepository.ts` | [MODIFY] | Added the `addGuestTimelineLog` handler to save logs to the central `activities` subcollection. |
| **Database** | `src/repositories/GuestRepository.ts` | [MODIFY] | Integrated automatic log hooks when a guest is created, edited, or soft-deleted. |
| **Hook** | `src/hooks/useRsvps.ts` | [MODIFY] | Refactored hook to log timeline events on RSVP changes, attendance updates, hospitality adjustments, and invitation sent/viewed transitions. |
| **Hook** | `src/hooks/useActivityLogs.ts` | [MODIFY] | Exported `addGuestTimelineLog` to support writing manual timeline notes. |
| **Component** | `src/modules/guests/GuestProfileView.tsx` | [NEW] | Created the Guest Profile tabbed layout view featuring Overview, RSVP, Attendance, Hospitality, and Timeline controls. |
| **UI Integration** | `src/modules/guests/Guests.tsx` | [MODIFY] | Wired up GuestProfileView to display inside the read-only guest details modal. |
| **Header Dropdown** | `src/components/layout/Header.tsx` | [MODIFY] | Replaced mock notifications dropdown with the dynamic logs feed from `useActivityLogs` showing live alerts and relative timestamps. |

---

## 2. Timeline Architecture & Firestore Collections

All timeline entries are saved under the shared multi-tenant `activities` collection path:
`workspaces/{workspaceId}/weddings/{weddingId}/activities/{activityId}`

### Schema Model
```json
{
  "activityId": "log_a23b9d8",
  "guestId": "g1",
  "eventType": "Meal Preference Updated",
  "title": "Meal Selection Updated",
  "description": "Guest Sarah Jenkins meal selection was changed to VEGAN",
  "previousValue": "non-vegetarian",
  "newValue": "vegan",
  "performedBy": "admin@projectra.com",
  "timestamp": "2026-07-10T12:16:30Z",
  "isPinned": false,
  "category": "hospitality"
}
```

---

## 3. Timeline Event Categories

Timeline events are categorized under one of the following category fields:
1. **`system`**: Guest Created, Guest Updated, Guest Soft Deleted.
2. **`invitation`**: Invitation Dispatched (Sent), Invitation Delivered, Invitation Link Opened (Viewed).
3. **`rsvp`**: RSVP Submitted, RSVP Status Changed.
4. **`attendance`**: Attendance Status Changed, Guest Count Changed, Event Selection Changed.
5. **`hospitality`**: Hospitality Preferences Initialized, Meal Selection Updated, Hospitality Details Saved.
6. **`note`**: Manual comments or pins created by organizers.

---

## 4. Unified Activity Feed Integration

A single activities stream feeds four distinct components across the platform:
1. **Guest Profile Timeline:** Shows activities filtered specifically by `log.guestId === selectedGuest.id`.
2. **Dashboard Recent Activity:** Displays the top 4 workspace operations.
3. **Workspace Operations Audits (Team settings):** Renders audit histories and actions.
4. **Notification Center dropdown:** Queries the latest 5 timeline events and renders alert notices with relative timestamps.

---

## 5. Components & Layouts Created

### `GuestProfileView` (`src/modules/guests/GuestProfileView.tsx`)
A unified profile dashboard displaying all sub-modules for a guest:
* **Interactive Navigation Tabs:** Click to switch between Overview (contact info), RSVP (delivery states), Attendance (headcount splits and checked ceremonies), Hospitality (meal preferences, lodging booking, transport pickup), and Timeline History.
* **Granular Search & Category Filters:** Real-time search box filtering events by keyword, and drop-down menu sorting events by category.
* **Manual Note Form:** Allows admins to record custom remarks and check "Pin note to top" to display vital alerts (e.g. VIP seating, allergies, wheelchair requests) in a highlight card at the top.
* **Chronological Timeline Cards:** Render newest items on top, with category-specific icons, action titles, description, operator, and timestamp. Clicking a card expands to show the `Previous Value` and `New Value` side-by-side.

---

## 6. Known Issues
* **Diff comparisons for large payloads:** Comparative details (Previous Value vs New Value) print as raw JSON strings when guest objects or nested hospitality settings are logged.
* **Deletion event constraints:** Soft-deleted guests are hidden from the Guest List. To view the timeline of a deleted guest, organizers must access the raw logs panel.
* **IP and Device logging:** Fields for operator IP addresses and device details are marked as placeholder targets for future implementations.
