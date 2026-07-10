# Project RA — Sprint B.7: Family Groups Implementation Report

This report summarizes the design patterns, performance strategies, and code modifications for the **Family Groups** system inside the Guest Management module.

---

## 1. Files Modified

| File Path | Description |
| :--- | :--- |
| **`src/modules/guests/Guests.tsx`** | Transformed the layout from a flat table view into a collapsed, family-centric card list layout. Integrated automatic alphabet sorting, accordion state trackers, summary statistics indicators, soft delete modals, search triggers, and "Family Created"/"Family Updated" audit logging. |

---

## 2. Family Grouping Strategy

* **Implicit Grouping**:
  * Guests are grouped dynamically in memory using the `familyName` string parameter.
  * When a new guest is saved, if their typed `familyName` doesn't exist, the system automatically creates and logs a new Family Group.
  * If a family's guests are all soft-deleted, the family group has zero active records and is hidden naturally from rosters (preserving the data history).
* **Collapsible Family Card Header Details**:
  * Displays:
    * **Family Name** (e.g. *"Jenkins Family"*)
    * **Side Badge** (e.g. *"Bride Side"*)
    * **Guests Count** and **Total members** (the sum of `membersCount` of all guests in the family)
    * **RSVP Progress** (total confirmed, pending, and declined RSVP statuses)
    * **Invitation Type Summary** (total digital, printed, or both invitation count)
    * **Last Activity timestamp**
* **Expandable Summary & Roster Table**:
  * Clicking a card opens it, displaying a detailed summary card grid and a roster table listing family members with actions (Edit & soft-Delete) and duplicate alert badges.

---

## 3. Search & Filter Behaviors

* **Auto-Accordion Expansion**:
  * If a user types into the search bar (e.g., searching *"Ahmed"*), the system automatically expands all matching family accordion cards (e.g., *"Ahmed Family"*) and lists the matches instantly.
* **Filter Context Integration**:
  * Active filters (e.g., *Bride Side* or *Pending RSVP*) continue to filter the guest roster. Guests matching the active criteria are still presented inside their corresponding family group card.

---

## 4. Database & Activity Logging

* **Firestore Collection**: `activities`
  * Logs family lifecycles when guests are added or updated:
    * `action`: `"Family Created"` (if the group name did not exist previously) or `"Family Updated"`
    * `entity`: `"family"`
    * `entityId`: `{familyName}`

---

## 5. Performance Considerations

* **Alpha Sort and Memoization**:
  * Accordion arrays and summary metric counts (such as RSVP sums and invitation type totals) are calculated inside a React `useMemo` block.
  * Sorting runs alphabetically: `Object.keys(familyGroups).sort()`, ensuring standard ordering.

---

## 6. Known Issues

* None. The layout operates cleanly across desktop, tablet, and mobile (collapsing details into vertical accordions).
