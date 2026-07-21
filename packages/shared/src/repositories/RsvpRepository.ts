import { BaseRepository } from './BaseRepository';
import { isFirebaseConfigured, db } from '@project-ra/firebase';
import { collection, onSnapshot, setDoc } from 'firebase/firestore';

export interface RsvpTimelineEvent {
  type: 'sent' | 'viewed' | 'submitted' | 'updated' | 'reminder_sent' | 'checkin';
  timestamp: string;
  description: string;
}

export interface RsvpMealPreferences {
  type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'kids_meal' | 'custom';
  allergies?: string;
  notes?: string;
}

export interface RsvpSpecialRequirements {
  wheelchairAccess: boolean;
  seniorCitizen: boolean;
  infant: boolean;
  parkingRequired: boolean;
  accommodationRequired: boolean;
  transportRequired: boolean;
  notes?: string;
}

export interface RsvpInvitationInfo {
  sent: boolean;
  sentAt?: string;
  viewed: boolean;
  viewedAt?: string;
  delivered: boolean;
  deliveredAt?: string;
  type: 'digital' | 'printed' | 'both';
}

// Sprint C.4: Hospitality Preferences Sub-models
export interface HospitalityAccommodation {
  requiresAccommodation: boolean;
  numberOfRooms: number;
  checkInDate: string;
  checkOutDate: string;
  hotelPreference: string;
  notes?: string;
}

export interface HospitalityTransport {
  requiresPickup: boolean;
  requiresDropoff: boolean;
  vehicleRequired: boolean;
  parkingRequired: boolean;
  pickupLocation: string;
}

export interface HospitalityPreferences {
  mealPreference: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'kids_meal' | 'custom';
  dietaryRestrictions: string[]; // e.g. Nut Allergy, Halal, etc.
  dietaryRestrictionsCustom?: string;
  accessibility: string[]; // e.g. Wheelchair Access, Pregnant Guest
  accommodation: HospitalityAccommodation;
  transport: HospitalityTransport;
  organizerNotes?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Sprint C.3: Attendance Planning Sub-model
export interface RsvpAttendance {
  status: 'attending' | 'not-attending' | 'maybe' | 'pending';
  adults: number;
  children: number;
  infants: number;
  events: string[]; // wedding event IDs the guest is attending
  specialAttendance: string[]; // e.g. 'senior', 'wheelchair', 'pregnant', 'infant', 'vip', 'escort'
  completion: number; // percentage (0 to 100)
  updatedAt?: string;
  updatedBy?: string;
}

export interface RsvpEntry {
  id: string; // guestId
  guestId: string;
  guestName: string;
  familyName: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe' | 'expired';
  response: 'yes' | 'no' | 'maybe';
  mealPreference: RsvpMealPreferences;
  specialRequirements: RsvpSpecialRequirements;
  membersAttending: {
    adults: number;
    children: number;
    total: number;
  };
  invitationInfo: RsvpInvitationInfo;
  respondedAt?: string;
  lastUpdated?: string;
  updatedBy?: string;
  timeline: RsvpTimelineEvent[];
  notes?: string;

  // C.4 Hospitality Payload
  hospitality?: HospitalityPreferences;

  // C.3 Attendance Payload
  attendance?: RsvpAttendance;
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

  public createDefaultRsvp(guestId: string, guestName: string, familyName: string, invitationType: 'digital' | 'printed' | 'both' = 'digital'): RsvpEntry {
    return {
      id: guestId,
      guestId,
      guestName,
      familyName,
      status: 'pending',
      response: 'maybe',
      mealPreference: {
        type: 'non-vegetarian',
        allergies: '',
        notes: ''
      },
      specialRequirements: {
        wheelchairAccess: false,
        seniorCitizen: false,
        infant: false,
        parkingRequired: false,
        accommodationRequired: false,
        transportRequired: false,
        notes: ''
      },
      membersAttending: {
        adults: 1,
        children: 0,
        total: 1
      },
      invitationInfo: {
        sent: false,
        viewed: false,
        delivered: false,
        type: invitationType
      },
      timeline: [],
      hospitality: {
        mealPreference: 'non-vegetarian',
        dietaryRestrictions: [],
        dietaryRestrictionsCustom: '',
        accessibility: [],
        accommodation: {
          requiresAccommodation: false,
          numberOfRooms: 0,
          checkInDate: '',
          checkOutDate: '',
          hotelPreference: '',
          notes: ''
        },
        transport: {
          requiresPickup: false,
          requiresDropoff: false,
          vehicleRequired: false,
          parkingRequired: false,
          pickupLocation: ''
        },
        organizerNotes: ''
      },
      attendance: {
        status: 'pending',
        adults: 1,
        children: 0,
        infants: 0,
        events: [],
        specialAttendance: [],
        completion: 20
      }
    };
  }
}

export default RsvpRepository;
