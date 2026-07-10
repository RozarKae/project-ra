export interface Guest {
  id: string;
  name: string;
  phone: string;
  side: 'bride' | 'groom';
  rsvpStatus: 'attending' | 'declined' | 'pending';
  isVip: boolean;
  familyName?: string;
  notes?: string;
  village?: string;           // Added for search filters
  invitationStatus?: string;  // Added for search filters (e.g. Sent, Opened)
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;        // Soft delete indicator
  deletedAt?: string;        // Soft delete metadata
  deletedBy?: string;        // Soft delete metadata
}
