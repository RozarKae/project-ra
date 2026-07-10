import { GuestRepository } from '../repositories/GuestRepository';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { Guest } from '../types/guest';
import { ActivityLog } from '../types/activity';

const guestRepo = new GuestRepository();
const activityRepo = new ActivityRepository();
const defaultWorkspaceId = 'default_workspace';
const defaultWeddingId = 'arifa_rozar_wedding';

export const subscribeGuests = (callback: (guests: Guest[]) => void) => {
  return guestRepo.subscribeGuests(defaultWorkspaceId, defaultWeddingId, callback);
};

export const saveGuest = async (guest: Guest): Promise<void> => {
  await guestRepo.saveGuest(defaultWorkspaceId, defaultWeddingId, guest, 'admin@projectra.com');
};

export const deleteGuest = async (id: string, name?: string): Promise<void> => {
  await guestRepo.deleteGuest(defaultWorkspaceId, defaultWeddingId, id, name || id, 'admin@projectra.com');
};

export const subscribeActivityLogs = (callback: (logs: any[]) => void) => {
  return activityRepo.subscribeLogs(defaultWorkspaceId, defaultWeddingId, callback);
};

export const addActivityLog = async (action: string, details: string, operator = 'admin@projectra.com'): Promise<void> => {
  await activityRepo.addLog(defaultWorkspaceId, defaultWeddingId, operator, action, 'legacy', 'bulk', details);
};
