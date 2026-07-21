import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { GuestRepository } from '../repositories/GuestRepository';
import { Guest } from '@project-ra/types';

const guestRepo = new GuestRepository();

export const useGuests = () => {
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = guestRepo.subscribeGuests(
      currentWorkspaceId,
      currentWeddingId,
      (loadedGuests) => {
        setGuests(loadedGuests);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentWorkspaceId, currentWeddingId]);

  const save = async (guest: Guest, operator: string) => {
    await guestRepo.saveGuest(currentWorkspaceId, currentWeddingId, guest, operator);
  };

  const remove = async (id: string, name: string, operator: string) => {
    await guestRepo.deleteGuest(currentWorkspaceId, currentWeddingId, id, name, operator);
  };

  return { guests, loading, save, remove };
};

export default useGuests;
