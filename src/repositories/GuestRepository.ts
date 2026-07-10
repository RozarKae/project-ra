import { BaseRepository } from './BaseRepository';
import { Guest } from '../types/guest';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { ActivityRepository } from './ActivityRepository';
import { FamilyRepository } from './FamilyRepository';

export class GuestRepository extends BaseRepository {
  private activityRepo = new ActivityRepository();
  private familyRepo = new FamilyRepository();

  private getLocalStorageKey(workspaceId: string, weddingId: string): string {
    return `ra_guests_${workspaceId}_${weddingId}`;
  }

  // Subscribe to real-time Guest changes (Firestore or multi-tenant LocalStorage fallback)
  public subscribeGuests(
    workspaceId: string,
    weddingId: string,
    callback: (guests: Guest[]) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, this.getPath(workspaceId, weddingId, 'guests')),
        where('isDeleted', '==', false)
      );
      return onSnapshot(q, (snapshot) => {
        const guestsList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Guest));
        callback(guestsList);
      });
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          // Initial seed data for the first workspace/wedding
          const defaultSeed = this.getDefaultSeedData();
          localStorage.setItem(storageKey, JSON.stringify(defaultSeed));
          callback(defaultSeed);
        } else {
          callback(JSON.parse(data).filter((g: Guest) => !g.isDeleted));
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

  // Save or update a guest record
  public async saveGuest(
    workspaceId: string,
    weddingId: string,
    guest: Guest,
    operator: string
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'guests', guest.id);
      if (docRef) {
        const payload = {
          ...guest,
          updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, payload, { merge: true });
        
        // Write to families collection if defined
        if (guest.familyName) {
          await this.familyRepo.saveFamily(workspaceId, weddingId, guest.familyName);
        }

        // Record activity log
        await this.activityRepo.addLog(
          workspaceId,
          weddingId,
          operator,
          guest.createdAt === guest.updatedAt ? 'Create' : 'Update',
          'guest',
          guest.id,
          `Saved Guest record: "${guest.name}" (${guest.side.toUpperCase()} side)`
        );
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let guests: Guest[] = data ? JSON.parse(data) : this.getDefaultSeedData();
      
      const index = guests.findIndex(g => g.id === guest.id);
      const now = new Date().toISOString();

      if (index > -1) {
        guests[index] = { ...guest, updatedAt: now };
        await this.activityRepo.addLog(workspaceId, weddingId, operator, 'Update', 'guest', guest.id, `Updated Guest: "${guest.name}"`);
      } else {
        const newGuest = { ...guest, createdAt: now, isDeleted: false };
        guests.push(newGuest);
        await this.activityRepo.addLog(workspaceId, weddingId, operator, 'Create', 'guest', guest.id, `Created Guest: "${guest.name}"`);
      }

      localStorage.setItem(storageKey, JSON.stringify(guests));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  // Soft delete a guest record
  public async deleteGuest(
    workspaceId: string,
    weddingId: string,
    id: string,
    name: string,
    operator: string
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = this.getDocRef(workspaceId, weddingId, 'guests', id);
      if (docRef) {
        await updateDoc(docRef, {
          isDeleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: operator
        });
        await this.activityRepo.addLog(workspaceId, weddingId, operator, 'Delete', 'guest', id, `Soft deleted Guest: "${name}"`);
      }
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      if (data) {
        let guests: Guest[] = JSON.parse(data);
        const index = guests.findIndex(g => g.id === id);
        if (index > -1) {
          guests[index].isDeleted = true;
          guests[index].deletedAt = new Date().toISOString();
          guests[index].deletedBy = operator;
          localStorage.setItem(storageKey, JSON.stringify(guests));
          await this.activityRepo.addLog(workspaceId, weddingId, operator, 'Delete', 'guest', id, `Soft deleted Guest: "${name}"`);
          window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
        }
      }
    }
  }

  // Default seed guests for sandbox emulations
  private getDefaultSeedData(): Guest[] {
    return [
      { id: 'g1', name: 'Sarah Jenkins', phone: '+15550199', side: 'bride', rsvpStatus: 'attending', isVip: true, familyName: 'Jenkins Family', notes: 'Groom\'s college friend', createdAt: '2026-07-08T10:00:00Z', isDeleted: false },
      { id: 'g2', name: 'Robert Jenkins', phone: '+15550199', side: 'bride', rsvpStatus: 'attending', isVip: true, familyName: 'Jenkins Family', notes: 'Sarah\'s husband', createdAt: '2026-07-08T10:05:00Z', isDeleted: false },
      { id: 'g3', name: 'Uncle Hassan', phone: '+92300123456', side: 'groom', rsvpStatus: 'attending', isVip: true, familyName: 'Khan Family', notes: 'Groom\'s paternal uncle', createdAt: '2026-07-08T11:20:00Z', isDeleted: false },
      { id: 'g4', name: 'Aunt Fatima', phone: '+92300123456', side: 'groom', rsvpStatus: 'attending', isVip: true, familyName: 'Khan Family', notes: 'Uncle Hassan\'s wife', createdAt: '2026-07-08T11:22:00Z', isDeleted: false },
      { id: 'g5', name: 'Tariq Khan', phone: '+92300987654', side: 'groom', rsvpStatus: 'pending', isVip: false, familyName: 'Khan Family', notes: 'Cousin', createdAt: '2026-07-08T11:25:00Z', isDeleted: false },
      { id: 'g6', name: 'Emily Watson', phone: '+442079460018', side: 'bride', rsvpStatus: 'declined', isVip: false, familyName: 'Watson Family', notes: 'Classmate', createdAt: '2026-07-09T09:30:00Z', isDeleted: false },
      { id: 'g7', name: 'Michael Watson', phone: '+442079460018', side: 'bride', rsvpStatus: 'declined', isVip: false, familyName: 'Watson Family', notes: 'Emily\'s husband', createdAt: '2026-07-09T09:32:00Z', isDeleted: false },
      { id: 'g8', name: 'Bilal Ahmed', phone: '+92333112233', side: 'groom', rsvpStatus: 'attending', isVip: false, familyName: 'Ahmed Family', notes: 'Neighbor', createdAt: '2026-07-09T14:10:00Z', isDeleted: false },
      { id: 'g9', name: 'Maryam Ahmed', phone: '+92333112233', side: 'groom', rsvpStatus: 'attending', isVip: false, familyName: 'Ahmed Family', notes: 'Bilal\'s sister', createdAt: '2026-07-09T14:12:00Z', isDeleted: false },
      { id: 'g10', name: 'David Miller', phone: '+12025550143', side: 'bride', rsvpStatus: 'pending', isVip: false, notes: 'Colleague', createdAt: '2026-07-09T16:00:00Z', isDeleted: false },
      { id: 'g11', name: 'Sarah Miller', phone: '+12025550143', side: 'bride', rsvpStatus: 'pending', isVip: false, notes: 'David\'s sister', createdAt: '2026-07-09T16:02:00Z', isDeleted: false },
      { id: 'g12', name: 'Yusuf Omar', phone: '+92315887766', side: 'groom', rsvpStatus: 'pending', isVip: true, familyName: 'Omar Family', notes: 'Honored Family Friend', createdAt: '2026-07-09T18:40:00Z', isDeleted: false },
      { id: 'g13', name: 'Aminah Omar', phone: '+92315887766', side: 'groom', rsvpStatus: 'pending', isVip: true, familyName: 'Omar Family', notes: 'Yusuf\'s mother', createdAt: '2026-07-09T18:42:00Z', isDeleted: false },
      { id: 'g14', name: 'Zayn Malik', phone: '+447911123456', side: 'groom', rsvpStatus: 'attending', isVip: false, notes: 'Work acquaintance', createdAt: '2026-07-10T05:00:00Z', isDeleted: false },
      { id: 'g15', name: 'Chloe Bennett', phone: '+13125550187', side: 'bride', rsvpStatus: 'pending', isVip: false, notes: 'Cousin on Bride side', createdAt: '2026-07-10T08:15:00Z', isDeleted: false }
    ];
  }
}
