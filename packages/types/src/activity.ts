export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;       // Operator email/UID
  action: string;     // e.g. "Create", "Update", "Delete", "Merge"
  entity: string;     // e.g. "guest", "family", "settings"
  entityId: string;   // Target ID
  details: string;    // Human-readable summary

  // Extended fields for Sprint C.5: Guest Timeline
  guestId?: string;
  eventType?: string;
  title?: string;
  description?: string;
  previousValue?: string;
  newValue?: string;
  performedBy?: string;
  isPinned?: boolean;
  category?: 'invitation' | 'rsvp' | 'attendance' | 'hospitality' | 'system' | 'note';
}
