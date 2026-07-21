import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '@project-ra/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { UserProfileData } from '@project-ra/types';

export class UserRepository extends BaseRepository {
  private getLocalStorageKey(userId: string): string {
    return `ra_user_profile_${userId}`;
  }

  public subscribeProfile(
    userId: string,
    callback: (profile: UserProfileData | null) => void
  ): () => void {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'users', userId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ userId, ...docSnap.data() } as UserProfileData);
        } else {
          callback(this.getDefaultProfile(userId));
        }
      });
    } else {
      const storageKey = this.getLocalStorageKey(userId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          const defaults = this.getDefaultProfile(userId);
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

  public async saveProfile(
    userId: string,
    profile: UserProfileData
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, profile, { merge: true });
    } else {
      const storageKey = this.getLocalStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
    }
  }

  public getDefaultProfile(userId: string): UserProfileData {
    return {
      userId,
      firstName: 'Admin',
      lastName: 'User',
      displayName: 'ADMIN',
      bio: 'Workspace platform owner and senior wedding planner.',
      photoURL: '',
      phone: '+919876543210',
      country: 'India',
      timezone: 'UTC+05:30',
      language: 'en',
      theme: 'dark',
      compactMode: false,
      animationPreference: 'full',
      createdAt: '2026-07-08T10:00:00Z',
      lastLogin: new Date().toISOString(),
      emailVerified: true,
      role: 'owner',
      workspaceId: 'default_workspace'
    };
  }
}

export default UserRepository;
