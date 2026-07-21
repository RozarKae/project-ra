import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '@project-ra/firebase';
import { setDoc } from 'firebase/firestore';

export class FamilyRepository extends BaseRepository {
  
  private getLocalStorageKey(workspaceId: string, weddingId: string): string {
    return `ra_families_${workspaceId}_${weddingId}`;
  }

  // Save or merge a family group record
  public async saveFamily(
    workspaceId: string,
    weddingId: string,
    familyName: string
  ): Promise<void> {
    const trimmed = familyName.trim();
    if (!trimmed) return;

    if (isFirebaseConfigured && db) {
      const familyId = trimmed.toLowerCase().replace(/\s+/g, '_');
      const docRef = this.getDocRef(workspaceId, weddingId, 'families', familyId);
      if (docRef) {
        await setDoc(docRef, {
          name: trimmed,
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let families: string[] = data ? JSON.parse(data) : [];

      if (!families.includes(trimmed)) {
        families.push(trimmed);
        localStorage.setItem(storageKey, JSON.stringify(families));
        window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
      }
    }
  }
}

export default FamilyRepository;
