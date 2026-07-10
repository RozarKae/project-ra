import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { WeddingSettings } from '../types/settings';

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
            callback(this.getDefaultSettings(weddingId));
          }
        });
      }
      return () => {};
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        if (!data) {
          const defaults = this.getDefaultSettings(weddingId);
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

  public getDefaultSettings(weddingId: string): WeddingSettings {
    return {
      id: 'general',
      brideName: 'Arifa Khan',
      groomName: 'Rozar Khan',
      brideShortName: 'Arifa',
      groomShortName: 'Rozar',
      brideParentNames: 'A. Mohammed Khan & M. Feroza Begum',
      groomParentNames: 'J. Peer Mohideen & P. Kather Beevi',
      rsvpDeadline: '2026-08-15T23:59:59',
      rsvpOpen: true,
      timezone: 'UTC+05:30',
      theme: 'dark',
      primaryColor: '#D4AF37', // Gold
      secondaryColor: '#0F6D5B', // Emerald
      qrCodeUrl: '',
      qrLogoUrl: '',
      invitationTitleDefault: 'Rozar & Arifa Wedding Invitation',
      invitationWelcomeText: 'In the name of Allah, the Most Beneficent, the Most Merciful. We cordially invite you to share our joy as we unite in holy matrimony.',
      venues: [
        {
          id: 'nsk_mahal',
          name: 'NSK & NKR A/C Mahal and Residency',
          address: 'GST Main Rd, Lion City, Thiru Nagar, Thanakkankulam',
          city: 'Madurai',
          state: 'Tamil Nadu',
          country: 'India',
          googleMapsUrl: 'https://maps.app.goo.gl/nHmxp5HqnWTBi1R56'
        }
      ],
      events: [
        {
          id: 'nikah',
          name: 'Nikah (Wedding Ceremony)',
          date: '2026-08-30T09:00:00+05:30',
          venueId: 'nsk_mahal',
          description: 'The marriage contract signing and traditional Nikah ceremony.'
        },
        {
          id: 'reception',
          name: 'Reception & Feast',
          date: '2026-08-30T11:00:00+05:30',
          venueId: 'nsk_mahal',
          description: 'A grand reception celebrating the union.'
        }
      ]
    };
  }
}

export default SettingRepository;
