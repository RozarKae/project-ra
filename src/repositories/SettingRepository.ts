import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface WeddingSettings {
  id: string;
  nikahDate: string;
  rsvpOpen: boolean;
  theme: string;
}

export class SettingRepository extends BaseRepository {
  
  private getLocalStorageKey(workspaceId: string, weddingId: string): string {
    return `ra_settings_${workspaceId}_${weddingId}`;
  }

  public subscribeSettings(
    workspaceId: string,
    weddingId: string,
    callback: (settings: WeddingSettings | null) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'settings', 'general');
      if (docRef) {
        return onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() } as WeddingSettings);
          } else {
            callback(null);
          }
        });
      }
      return () => {};
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        callback(data ? JSON.parse(data) : { id: 'general', nikahDate: '2026-08-30T11:00:00', rsvpOpen: true, theme: 'dark' });
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

  public async saveSettings(
    workspaceId: string,
    weddingId: string,
    settings: WeddingSettings
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'settings', 'general');
      if (docRef) {
        await setDoc(docRef, settings, { merge: true });
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      localStorage.setItem(storageKey, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }
}

export default SettingRepository;
