export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type TeamMemberStatus = 'active' | 'disabled';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
  lastActive: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamRole;
  token: string;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  message?: string;
}
