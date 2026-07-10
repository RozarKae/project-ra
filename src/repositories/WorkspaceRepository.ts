import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { WorkspaceSettings } from '../types/workspace';

export class WorkspaceRepository extends BaseRepository {
  private getLocalStorageKey(workspaceId: string): string {
    return `ra_workspace_settings_${workspaceId}`;
  }

  public subscribeWorkspace(
    workspaceId: string,
    callback: (settings: WorkspaceSettings | null) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'workspaces', workspaceId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ workspaceId, ...docSnap.data() } as WorkspaceSettings);
        } else {
          callback(this.getDefaultSettings(workspaceId));
        }
      });
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          const defaults = this.getDefaultSettings(workspaceId);
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

  public async saveWorkspace(
    workspaceId: string,
    settings: WorkspaceSettings
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'workspaces', workspaceId);
      await setDoc(docRef, settings, { merge: true });
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId);
      localStorage.setItem(storageKey, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  public getDefaultSettings(workspaceId: string): WorkspaceSettings {
    return {
      workspaceId,
      workspaceName: 'Nikahs & Weddings Workspace',
      workspaceSlug: workspaceId === 'default_workspace' ? 'nikahs-weddings' : workspaceId,
      description: 'Cinematic premium multi-tenant wedding management scope.',
      status: 'active',
      timezone: 'UTC+05:30',
      currency: 'INR',
      language: 'en',
      dateFormat: 'YYYY-MM-DD',
      preferences: {
        guestManagement: true,
        rsvp: true,
        invitations: true,
        reports: true,
        notifications: true
      },
      createdAt: '2026-07-08T10:00:00Z',
      ownerEmail: 'admin@photomagic.com'
    };
  }
}

export default WorkspaceRepository;
