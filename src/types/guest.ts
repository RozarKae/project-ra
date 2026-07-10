export interface Guest {
  id: string;
  name: string;
  familyName: string;          // Required in Sprint B.2
  side: 'bride' | 'groom';
  membersCount: number;        // Required in Sprint B.2
  rsvpStatus: 'attending' | 'declined' | 'pending' | 'maybe'; // Added 'maybe' for Sprint B.5
  invitationType?: 'digital' | 'printed' | 'both';             // Added for Sprint B.5
  duplicateConfirmed?: boolean;                                // Added for Sprint B.6
  phone?: string;              // Optional contact
  whatsApp?: string;           // Optional WhatsApp contact
  relation?: string;           // Optional Relation
  address?: string;            // Optional Address
  notes?: string;              // Optional Notes
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;          // Added creator audit tracking
  updatedBy?: string;          // Added updater audit tracking
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}
