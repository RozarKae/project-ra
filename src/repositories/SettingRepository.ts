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
          const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
          if (docSnap.exists()) {
            const data = docSnap.data() as WeddingSettings;
            if (!data.events || data.events.length < 6) {
              const defaults = this.getDefaultSettings(weddingId);
              const merged = { ...defaults, ...data, events: defaults.events, venues: defaults.venues };
              setDoc(docRef, merged, { merge: true });
              localStorage.setItem(storageKey, JSON.stringify(merged));
              window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
              callback(merged);
            } else {
              localStorage.setItem(storageKey, JSON.stringify(data));
              window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
              callback({ id: docSnap.id, ...data });
            }
          } else {
            const defaults = this.getDefaultSettings(weddingId);
            localStorage.setItem(storageKey, JSON.stringify(defaults));
            window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
            callback(defaults);
          }
        });
      }
      return () => {};
    } else {
      const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
      const fetchLocal = () => {
        const data = localStorage.getItem(storageKey);
        const defaults = this.getDefaultSettings(weddingId);
        if (!data) {
          localStorage.setItem(storageKey, JSON.stringify(defaults));
          callback(defaults);
        } else {
          try {
            const parsed = JSON.parse(data);
            if (!parsed.events || parsed.events.length < 6) {
              const merged = { ...defaults, ...parsed, events: defaults.events, venues: defaults.venues };
              localStorage.setItem(storageKey, JSON.stringify(merged));
              callback(merged);
            } else {
              callback(parsed);
            }
          } catch (e) {
            callback(defaults);
          }
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
        const storageKey = this.getLocalStorageKey(workspaceId, weddingId);
        localStorage.setItem(storageKey, JSON.stringify(settings));
        window.dispatchEvent(new CustomEvent('ra_storage_update', { detail: { key: storageKey } }));
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
          name: 'NSK & NKR A/C Mahal',
          address: 'GST Main Rd, Lion City, Thiru Nagar, Thanakkankulam',
          city: 'Madurai',
          state: 'Tamil Nadu',
          country: 'India',
          googleMapsUrl: 'https://maps.app.goo.gl/nHmxp5HqnWTBi1R56'
        },
        {
          id: 'brides_residence',
          name: "Bride's Residence",
          address: 'Madurai',
          city: 'Madurai',
          state: 'Tamil Nadu',
          country: 'India',
          googleMapsUrl: 'https://maps.app.goo.gl/5Z7sW3SojqCc7gPV9'
        },
        {
          id: 'grooms_residence',
          name: "Groom's Residence",
          address: 'Madurai',
          city: 'Madurai',
          state: 'Tamil Nadu',
          country: 'India',
          googleMapsUrl: ''
        },
        {
          id: 'celebration_hall',
          name: 'Celebration Hall',
          address: 'Madurai',
          city: 'Madurai',
          state: 'Tamil Nadu',
          country: 'India',
          googleMapsUrl: 'https://maps.app.goo.gl/nHmxp5HqnWTBi1R56'
        }
      ],
      events: [
        {
          id: 'haldi',
          name: '🌿 Haldi Ceremony',
          date: '2026-08-28T19:00:00+05:30',
          venueId: 'brides_residence',
          description: 'A colourful evening filled with blessings, laughter and family traditions as the wedding celebrations begin.'
        },
        {
          id: 'nalang',
          name: '✨ Nalang Ceremony',
          date: '2026-08-29T11:00:00+05:30',
          venueId: 'grooms_residence',
          description: 'Traditional pre-wedding rituals celebrated with close family and friends.'
        },
        {
          id: 'sangeet',
          name: '🎶 Sangeet & DJ Night',
          date: '2026-08-29T19:00:00+05:30',
          venueId: 'celebration_hall',
          description: 'An evening of music, dance and unforgettable memories with family and friends.'
        },
        {
          id: 'nikah',
          name: '💍 Nikkah',
          date: '2026-08-30T09:00:00+05:30',
          venueId: 'nsk_mahal',
          description: 'The sacred Nikāh ceremony where two souls begin their lifelong journey together.'
        },
        {
          id: 'reception',
          name: '🍽️ Wedding Feast & Reception',
          date: '2026-08-30T11:00:00+05:30',
          venueId: 'nsk_mahal',
          description: 'Join us for lunch as we celebrate our union with love, joy and gratitude.'
        },
        {
          id: 'valima',
          name: 'Valima',
          date: 'TBA',
          venueId: 'nsk_mahal',
          description: 'The Valima reception will be announced soon. We look forward to celebrating together once the date is finalized.'
        }
      ]
    };
  }
}

export default SettingRepository;
