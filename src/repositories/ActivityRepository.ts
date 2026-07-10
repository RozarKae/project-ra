import { BaseRepository } from './BaseRepository';
import { ActivityLog } from '../types/activity';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';

export class ActivityRepository extends BaseRepository {
  
  private getLocalStorageKey(workspaceId: string, weddingId: string): string {
    return `ra_logs_${workspaceId}_${weddingId}`;
  }

  // Subscribe to real-time Activity Log changes (Firestore or LocalStorage)
  public subscribeLogs(
    workspaceId: string,
    weddingId: string,
    callback: (logs: ActivityLog[]) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, this.getPath(workspaceId, weddingId, 'activities')),
        orderBy('timestamp', 'desc')
      );
      
      return onSnapshot(q, (snapshot) => {
        const logsList = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ActivityLog));
        callback(logsList);
      }, (error) => {
        console.warn("Index not ready for activities query, falling back to client-sorted listener:", error);
        return onSnapshot(collection(db, this.getPath(workspaceId, weddingId, 'activities')), (snap) => {
          const logsList = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ActivityLog));
          logsList.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          callback(logsList);
        });
      });
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          const defaultSeed = this.getDefaultSeedData();
          localStorage.setItem(storageKey, JSON.stringify(defaultSeed));
          callback(defaultSeed);
        } else {
          const parsed = JSON.parse(data).sort((a: ActivityLog, b: ActivityLog) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          callback(parsed);
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

  // Add write operation log
  public async addLog(
    workspaceId: string,
    weddingId: string,
    user: string,
    action: string,
    entity: string,
    entityId: string,
    details: string
  ): Promise<void> {
    const newLog: Omit<ActivityLog, 'id'> = {
      timestamp: new Date().toISOString(),
      user,
      action,
      entity,
      entityId,
      details
    };

    if (isFirebaseConfigured && db) {
      const colRef = collection(db, this.getPath(workspaceId, weddingId, 'activities'));
      await addDoc(colRef, newLog);
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let logs: ActivityLog[] = data ? JSON.parse(data) : this.getDefaultSeedData();
      
      const logWithId: ActivityLog = {
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        ...newLog
      };
      
      logs.unshift(logWithId);
      localStorage.setItem(storageKey, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  // Sprint C.5: Add specific timeline trace log
  public async addGuestTimelineLog(
    workspaceId: string,
    weddingId: string,
    guestId: string,
    eventType: string,
    title: string,
    description: string,
    previousValue: string,
    newValue: string,
    performedBy: string,
    category: 'invitation' | 'rsvp' | 'attendance' | 'hospitality' | 'system' | 'note',
    isPinned: boolean = false
  ): Promise<void> {
    const newLog: Omit<ActivityLog, 'id'> = {
      timestamp: new Date().toISOString(),
      user: performedBy,
      action: eventType,
      entity: 'guest',
      entityId: guestId,
      details: description,
      guestId,
      eventType,
      title,
      description,
      previousValue,
      newValue,
      performedBy,
      isPinned,
      category
    };

    if (isFirebaseConfigured && db) {
      const colRef = collection(db, this.getPath(workspaceId, weddingId, 'activities'));
      await addDoc(colRef, newLog);
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const data = localStorage.getItem(storageKey);
      let logs: ActivityLog[] = data ? JSON.parse(data) : this.getDefaultSeedData();
      
      const logWithId: ActivityLog = {
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        ...newLog
      };
      
      logs.unshift(logWithId);
      localStorage.setItem(storageKey, JSON.stringify(logs));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  private getDefaultSeedData(): ActivityLog[] {
    const now = new Date();
    return [
      { id: 'l_mock_mom', timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), action: 'Update', entity: 'family', entityId: 'f1', details: 'updated 2 families', user: 'mom@projectra.com' },
      { id: 'l_mock_dad', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), action: 'Create', entity: 'guest', entityId: 'g_bulk', details: 'added 6 guests', user: 'dad@projectra.com' },
      { id: 'l1', timestamp: '2026-07-08T10:05:00Z', action: 'Import', entity: 'guest', entityId: 'bulk', details: 'Initialized database with Jenkins and Khan families', user: 'system@projectra.com' },
      { id: 'l2', timestamp: '2026-07-09T09:32:00Z', action: 'Create', entity: 'guest', entityId: 'g6', details: 'Added Emily & Michael Watson to Bride side', user: 'admin@projectra.com' },
      { id: 'l3', timestamp: '2026-07-09T18:42:00Z', action: 'Create', entity: 'guest', entityId: 'g12', details: 'Added Omar family (Yusuf & Aminah) as VIPs', user: 'admin@projectra.com' },
      { id: 'l4', timestamp: '2026-07-10T08:15:00Z', action: 'Create', entity: 'guest', entityId: 'g15', details: 'Added Chloe Bennett to Bride side', user: 'admin@projectra.com' }
    ];
  }
}

export default ActivityRepository;
