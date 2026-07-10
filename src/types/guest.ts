export interface Guest {
  id: string;
  name: string;
  phone: string;
  side: 'bride' | 'groom';
  rsvpStatus: 'attending' | 'declined' | 'pending';
  isVip: boolean;
  familyName?: string;
  notes?: string;
  createdAt: string;
  isDeleted: boolean; // Soft delete
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  operator: string;
}
