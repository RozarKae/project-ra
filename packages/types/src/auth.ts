export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  workspaceId: string;
  weddingId?: string;
}

export interface Permission {
  action: 'read' | 'write' | 'delete' | 'admin';
  entity: 'guest' | 'rsvp' | 'family' | 'settings' | 'billing' | 'users';
}

// Role-based authorization matrix helper
export const hasPermission = (role: UserRole, action: Permission['action']): boolean => {
  switch (role) {
    case 'owner':
      return true; // full absolute rights
    case 'admin':
      return action !== 'admin'; // admin can do read, write, delete
    case 'editor':
      return action === 'read' || action === 'write'; // editor can do read, write
    case 'viewer':
      return action === 'read'; // viewer can do read only
    default:
      return false;
  }
};
