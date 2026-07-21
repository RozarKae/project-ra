import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '@project-ra/firebase';
import { collection, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { Invitation } from '@project-ra/types';

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

  public async saveInvitationsBulk(
    workspaceId: string,
    weddingId: string,
    invitations: Invitation[]
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      for (const invite of invitations) {
        await this.saveInvitation(workspaceId, weddingId, invite);
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let list: Invitation[] = data ? JSON.parse(data) : [];
      
      invitations.forEach((invitation) => {
        const idx = list.findIndex(r => r.id === invitation.id);
        if (idx > -1) {
          list[idx] = invitation;
        } else {
          list.push(invitation);
        }
      });
      
      localStorage.setItem(storageKey, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  public async deleteInvitation(
    workspaceId: string,
    weddingId: string,
    id: string
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'invitations', id);
      if (docRef) {
        await deleteDoc(docRef);
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      if (data) {
        let list: Invitation[] = JSON.parse(data);
        list = list.filter(r => r.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
      }
    }
  }

  public async deleteInvitationsBulk(
    workspaceId: string,
    weddingId: string,
    ids: string[]
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      for (const id of ids) {
        await this.deleteInvitation(workspaceId, weddingId, id);
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      if (data) {
        let list: Invitation[] = JSON.parse(data);
        list = list.filter(r => !ids.includes(r.id));
        localStorage.setItem(storageKey, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
      }
    }
  }
}

export default InvitationRepository;
