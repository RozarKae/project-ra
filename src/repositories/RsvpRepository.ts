import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, doc, setDoc } from 'firebase/firestore';

export interface RsvpEntry {
  id: string;
  guestId: string;
  attending: boolean;
  notes?: string;
  submittedAt: string;
}

export class RsvpRepository extends BaseRepository {
  
  private getLocalStorageKey(workspaceId: string, weddingId: string): string {
    return `ra_rsvps_${workspaceId}_${weddingId}`;
  }

  public subscribeRsvps(
    workspaceId: string,
    weddingId: string,
    callback: (rsvps: RsvpEntry[]) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const q = collection(db, this.getPath(workspaceId, weddingId, 'rsvps'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as RsvpEntry));
        callback(list);
      });
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        callback(data ? JSON.parse(data) : []);
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

  public async saveRsvp(
    workspaceId: string,
    weddingId: string,
    rsvp: RsvpEntry
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'rsvps', rsvp.id);
      if (docRef) {
        await setDoc(docRef, rsvp, { merge: true });
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let rsvps: RsvpEntry[] = data ? JSON.parse(data) : [];
      const idx = rsvps.findIndex(r => r.id === rsvp.id);
      if (idx > -1) {
        rsvps[idx] = rsvp;
      } else {
        rsvps.push(rsvp);
      }
      localStorage.setItem(storageKey, JSON.stringify(rsvps));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }
}

export default RsvpRepository;
