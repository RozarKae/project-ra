import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc
} from 'firebase/firestore';
import { TeamMember, TeamInvitation } from '../types/team';

export class TeamRepository extends BaseRepository {
  private getMembersStorageKey(workspaceId: string): string {
    return `ra_team_members_${workspaceId}`;
  }

  private getInvitationsStorageKey(workspaceId: string): string {
    return `ra_team_invitations_${workspaceId}`;
  }

  public subscribeMembers(
    workspaceId: string,
    callback: (members: TeamMember[]) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const colRef = collection(db, 'workspaces', workspaceId, 'members');
      return onSnapshot(colRef, (snap) => {
        const members: TeamMember[] = [];
        snap.forEach((d) => {
          members.push({ userId: d.id, ...d.data() } as TeamMember);
        });
        if (members.length === 0) {
          const defaults = this.getDefaultMembers();
          defaults.forEach((m) => {
            setDoc(doc(db, 'workspaces', workspaceId, 'members', m.userId), m);
          });
          callback(defaults);
        } else {
          callback(members);
        }
      });
    } else {
      const storageKey = this.getMembersStorageKey(workspaceId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          const defaults = this.getDefaultMembers();
          localStorage.setItem(storageKey, JSON.stringify(defaults));
          callback(defaults);
        } else {
          callback(JSON.parse(data));
        }
      };
      fetchLocal();
      const handler = (e: Event) => {
        if ((e as CustomEvent).detail?.key === storageKey || e.type === 'storage') {
          fetchLocal();
        }
      };
      window.addEventListener('storage', handler);
      window.addEventListener('ra_storage_update', handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('ra_storage_update', handler);
      };
    }
  }

  public async saveMember(workspaceId: string, member: TeamMember): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'workspaces', workspaceId, 'members', member.userId);
      await setDoc(docRef, member, { merge: true });
    } else {
      const storageKey = this.getMembersStorageKey(workspaceId);
      const data = localStorage.getItem(storageKey);
      let members: TeamMember[] = data ? JSON.parse(data) : this.getDefaultMembers();
      const idx = members.findIndex(m => m.userId === member.userId);
      if (idx > -1) {
        members[idx] = { ...members[idx], ...member };
      } else {
        members.push(member);
      }
      localStorage.setItem(storageKey, JSON.stringify(members));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  public async removeMember(workspaceId: string, userId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'workspaces', workspaceId, 'members', userId);
      await deleteDoc(docRef);
    } else {
      const storageKey = this.getMembersStorageKey(workspaceId);
      const data = localStorage.getItem(storageKey);
      if (data) {
        let members: TeamMember[] = JSON.parse(data);
        members = members.filter(m => m.userId !== userId);
        localStorage.setItem(storageKey, JSON.stringify(members));
        window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
      }
    }
  }

  public subscribeInvitations(
    workspaceId: string,
    callback: (invitations: TeamInvitation[]) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const colRef = collection(db, 'workspaces', workspaceId, 'invitations');
      return onSnapshot(colRef, (snap) => {
        const list: TeamInvitation[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as TeamInvitation);
        });
        if (list.length === 0) {
          const defaults = this.getDefaultInvitations();
          defaults.forEach((inv) => {
            setDoc(doc(db, 'workspaces', workspaceId, 'invitations', inv.id), inv);
          });
          callback(defaults);
        } else {
          callback(list);
        }
      });
    } else {
      const storageKey = this.getInvitationsStorageKey(workspaceId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          const defaults = this.getDefaultInvitations();
          localStorage.setItem(storageKey, JSON.stringify(defaults));
          callback(defaults);
        } else {
          callback(JSON.parse(data));
        }
      };
      fetchLocal();
      const handler = (e: Event) => {
        if ((e as CustomEvent).detail?.key === storageKey || e.type === 'storage') {
          fetchLocal();
        }
      };
      window.addEventListener('storage', handler);
      window.addEventListener('ra_storage_update', handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener('ra_storage_update', handler);
      };
    }
  }

  public async saveInvitation(workspaceId: string, invitation: TeamInvitation): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'workspaces', workspaceId, 'invitations', invitation.id);
      await setDoc(docRef, invitation, { merge: true });
    } else {
      const storageKey = this.getInvitationsStorageKey(workspaceId);
      const data = localStorage.getItem(storageKey);
      let list: TeamInvitation[] = data ? JSON.parse(data) : this.getDefaultInvitations();
      const idx = list.findIndex(i => i.id === invitation.id);
      if (idx > -1) {
        list[idx] = { ...list[idx], ...invitation };
      } else {
        list.push(invitation);
      }
      localStorage.setItem(storageKey, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  public async removeInvitation(workspaceId: string, id: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'workspaces', workspaceId, 'invitations', id);
      await deleteDoc(docRef);
    } else {
      const storageKey = this.getInvitationsStorageKey(workspaceId);
      const data = localStorage.getItem(storageKey);
      if (data) {
        let list: TeamInvitation[] = JSON.parse(data);
        list = list.filter(i => i.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
      }
    }
  }

  public getDefaultMembers(): TeamMember[] {
    return [
      {
        userId: 'owner-rozar',
        email: 'rozar@nikahsandweddings.com',
        displayName: 'Rozar Khan',
        role: 'owner',
        status: 'active',
        joinedAt: '2026-07-08T10:00:00Z',
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        userId: 'admin-dad',
        email: 'dad@photomagic.com',
        displayName: 'Dad',
        role: 'admin',
        status: 'active',
        joinedAt: '2026-07-09T08:30:00Z',
        lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        userId: 'editor-mom',
        email: 'mom@photomagic.com',
        displayName: 'Mom',
        role: 'editor',
        status: 'active',
        joinedAt: '2026-07-09T14:15:00Z',
        lastActive: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        userId: 'viewer-ibrahim',
        email: 'ibrahim@photomagic.com',
        displayName: 'Ibrahim',
        role: 'viewer',
        status: 'active',
        joinedAt: '2026-07-10T09:00:00Z',
        lastActive: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        userId: 'mock-admin-uid-12345',
        email: 'admin@photomagic.com',
        displayName: 'ADMIN',
        role: 'owner',
        status: 'active',
        joinedAt: '2026-07-08T10:00:00Z',
        lastActive: new Date().toISOString()
      }
    ];
  }

  public getDefaultInvitations(): TeamInvitation[] {
    return [
      {
        id: 'inv-sister',
        email: 'sister@photomagic.com',
        role: 'editor',
        token: 'token_sister_4321',
        status: 'pending',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
        createdBy: 'owner-rozar',
        message: 'Join us to organize the guest list sections!'
      },
      {
        id: 'inv-brother',
        email: 'brother@photomagic.com',
        role: 'viewer',
        token: 'token_brother_9876',
        status: 'expired',
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        createdBy: 'owner-rozar',
        message: 'Check out the reports overview.'
      }
    ];
  }
}

export default TeamRepository;
