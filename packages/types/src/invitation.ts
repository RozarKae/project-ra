export type InvitationStatus = 'draft' | 'generated' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export type DeliveryStatus = 'not-sent' | 'whatsapp' | 'email' | 'printed' | 'delivered' | 'opened';

export type InvitationType = 'digital' | 'printed' | 'vip' | 'family' | 'friends' | 'bride_side' | 'groom_side' | 'custom';

export interface QrCodeInfo {
  code: string;
  scanCount: number;
  lastScan?: string;
  encryptedLink: string;
}

export interface InvitationHistoryItem {
  event: string;
  timestamp: string;
  operator?: string;
}

export interface Invitation {
  id: string; // Unique Invitation ID (e.g. INV-XXXXX)
  guestId: string; // Linked Guest ID
  guestName: string; // Denormalized guest name
  familyName: string; // Linked Family name
  guestCategory: string; // Category, e.g. Close Family, Friend, etc.
  invitationType: InvitationType;
  status: InvitationStatus;
  deliveryStatus: DeliveryStatus;
  qrCode: QrCodeInfo;
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'maybe';
  attendanceCount: number; // Count of attending members
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  respondedAt?: string;
  history: InvitationHistoryItem[];
}
