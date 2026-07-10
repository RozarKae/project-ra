import { Guest, ActivityLog } from '../types/guest';

const GUEST_STORAGE_KEY = 'ra_guests_database';
const LOGS_STORAGE_KEY = 'ra_activity_logs';

const initialMockGuests: Guest[] = [
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

const initialMockLogs: ActivityLog[] = [
  { id: 'l1', timestamp: '2026-07-08T10:05:00Z', action: 'Import', details: 'Initialized database with Jenkins and Khan families', operator: 'system@projectra.com' },
  { id: 'l2', timestamp: '2026-07-09T09:32:00Z', action: 'Add Guest', details: 'Added Emily & Michael Watson to Bride side', operator: 'admin@projectra.com' },
  { id: 'l3', timestamp: '2026-07-09T18:42:00Z', action: 'Add Guest', details: 'Added Omar family (Yusuf & Aminah) as VIPs', operator: 'admin@projectra.com' },
  { id: 'l4', timestamp: '2026-07-10T08:15:00Z', action: 'Add Guest', details: 'Added Chloe Bennett to Bride side', operator: 'admin@projectra.com' }
];

export const getGuests = (): Guest[] => {
  const data = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(initialMockGuests));
    return initialMockGuests;
  }
  return JSON.parse(data).filter((g: Guest) => !g.isDeleted);
};

export const saveGuest = (guest: Guest): void => {
  const guests = getGuestsFromRaw();
  const index = guests.findIndex(g => g.id === guest.id);
  const operator = getLoggedInOperator();
  
  if (index > -1) {
    const original = guests[index];
    guests[index] = { ...guest, updatedAt: new Date().toISOString() } as any;
    
    // Log the update details
    let changeDetails = `Updated Guest: "${guest.name}"`;
    if (original.rsvpStatus !== guest.rsvpStatus) {
      changeDetails += ` (RSVP changed from ${original.rsvpStatus} to ${guest.rsvpStatus})`;
    } else if (original.isVip !== guest.isVip) {
      changeDetails += ` (VIP status changed to ${guest.isVip})`;
    }
    
    addActivityLog('Update', changeDetails, operator);
  } else {
    const newGuest = {
      ...guest,
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    guests.push(newGuest);
    addActivityLog('Add Guest', `Added Guest: "${guest.name}" to ${guest.side === 'bride' ? 'Bride' : 'Groom'} side`, operator);
  }
  
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guests));
};

export const deleteGuest = (id: string): void => {
  const guests = getGuestsFromRaw();
  const index = guests.findIndex(g => g.id === id);
  const operator = getLoggedInOperator();
  
  if (index > -1) {
    const guest = guests[index];
    guests[index].isDeleted = true;
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guests));
    addActivityLog('Delete', `Soft deleted Guest: "${guest.name}"`, operator);
  }
};

export const getActivityLogs = (): ActivityLog[] => {
  const data = localStorage.getItem(LOGS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initialMockLogs));
    return initialMockLogs;
  }
  return JSON.parse(data).sort((a: ActivityLog, b: ActivityLog) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

export const addActivityLog = (action: string, details: string, operator = 'admin@projectra.com'): void => {
  const logs = getActivityLogs();
  const newLog: ActivityLog = {
    id: 'log_' + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    action,
    details,
    operator
  };
  logs.unshift(newLog);
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

// Internal helpers
const getGuestsFromRaw = (): Guest[] => {
  const data = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!data) {
    return initialMockGuests;
  }
  return JSON.parse(data);
};

const getLoggedInOperator = (): string => {
  try {
    const rawAuth = localStorage.getItem('ra_auth_user'); // Match our Auth module session storage if any
    if (rawAuth) {
      const auth = JSON.parse(rawAuth);
      return auth.email || 'admin@projectra.com';
    }
  } catch (e) {}
  return 'admin@projectra.com';
};
