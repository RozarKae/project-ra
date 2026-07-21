import { useEffect, useState } from 'react';
import { useAuth } from '@project-ra/firebase';
import { UserRepository } from '../repositories/UserRepository';
import { UserProfileData } from '@project-ra/types';

const userRepo = new UserRepository();

export const useUserProfile = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'mock-admin-uid-12345';
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = userRepo.subscribeProfile(userId, (loadedProfile) => {
      setProfile(loadedProfile);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userId]);

  const saveProfile = async (updatedProfile: UserProfileData) => {
    await userRepo.saveProfile(userId, updatedProfile);
  };

  return { profile, loading, saveProfile };
};

export default useUserProfile;
