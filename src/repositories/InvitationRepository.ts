import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

export interface Invitation {
  id: string;
  guestId: string;
  sentChannel: 'whatsapp' | 'email' | 'sms' | 'physical';
  status: 'sent' | 'opened' | 'failed';
  sentAt: string;
}

export class InvitationRepository extends BaseRepository {
  
  private getLocalStorageKey(workspaceId: string, weddingId: string): string {
    return `ra_invitations_${workspaceId}_${weddingId}`;
  }

  public subscribeInvitations(
    workspaceId: string,
    weddingId: string,
    callback: (invitations: Invitation[]) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const q = collection(db, this.getPath(workspaceId, weddingId, 'invitations'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Invitation));
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

  public async saveInvitation(
    workspaceId: string,
    weddingId: string,
    invitation: Invitation
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'invitations', invitation.id);
      if (docRef) {
        await setDoc(docRef, invitation, { merge: true });
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let list: Invitation[] = data ? JSON.parse(data) : [];
      const idx = list.findIndex(r => r.id === invitation.id);
      if (idx > -1) {
        list[idx] = invitation;
      } else {
        list.push(invitation);
      }
      localStorage.setItem(storageKey, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }
}

export default InvitationRepository;
