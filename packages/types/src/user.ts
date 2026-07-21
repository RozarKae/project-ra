export interface UserProfileData {
  userId: string;
  email?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  language?: string;
  theme?: 'dark' | 'light' | 'system';
  compactMode?: boolean;
  animationPreference?: 'full' | 'reduced';
  createdAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  role?: string;
  workspaceId?: string;
  updatedAt?: string;
  updatedBy?: string;
}
