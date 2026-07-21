import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ActivityRepository } from '../repositories/ActivityRepository';
import { ActivityLog } from '@project-ra/types';

const activityRepo = new ActivityRepository();

export const useActivityLogs = () => {
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = activityRepo.subscribeLogs(
      currentWorkspaceId,
      currentWeddingId,
      (loadedLogs) => {
        setLogs(loadedLogs);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentWorkspaceId, currentWeddingId]);

  const addLog = async (operator: string, action: string, entity: string, entityId: string, details: string) => {
    await activityRepo.addLog(currentWorkspaceId, currentWeddingId, operator, action, entity, entityId, details);
  };

  const addGuestTimelineLog = async (
    guestId: string,
    eventType: string,
    title: string,
    description: string,
    previousValue: string,
    newValue: string,
    performedBy: string,
    category: 'invitation' | 'rsvp' | 'attendance' | 'hospitality' | 'system' | 'note',
    isPinned: boolean = false
  ) => {
    await activityRepo.addGuestTimelineLog(
      currentWorkspaceId,
      currentWeddingId,
      guestId,
      eventType,
      title,
      description,
      previousValue,
      newValue,
      performedBy,
      category,
      isPinned
    );
  };

  return { logs, loading, addLog, addGuestTimelineLog };
};

export default useActivityLogs;
