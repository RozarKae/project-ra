export interface WorkspacePreferences {
  guestManagement: boolean;
  rsvp: boolean;
  invitations: boolean;
  reports: boolean;
  notifications: boolean;
}

export interface WorkspaceSettings {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string; // read-only after creation
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'archived';
  logoUrl?: string;
  coverImageUrl?: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  preferences: WorkspacePreferences;
  createdAt: string;
  ownerEmail: string;
  updatedAt?: string;
  updatedBy?: string;
}
