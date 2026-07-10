export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;       // Operator email/UID
  action: string;     // e.g. "Create", "Update", "Delete", "Merge"
  entity: string;     // e.g. "guest", "family", "settings"
  entityId: string;   // Target ID
  details: string;    // Human-readable summary
}
