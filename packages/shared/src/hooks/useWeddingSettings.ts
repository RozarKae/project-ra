import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { SettingRepository } from '../repositories/SettingRepository';
import { WeddingSettings } from '@project-ra/types';

const settingRepo = new SettingRepository();

export const useWeddingSettings = () => {
  const { currentWorkspaceId, currentWeddingId } = useWorkspace();
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = settingRepo.subscribeSettings(
      currentWorkspaceId,
      currentWeddingId,
      (loadedSettings) => {
        setSettings(loadedSettings || settingRepo.getDefaultSettings(currentWeddingId));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentWorkspaceId, currentWeddingId]);

  const saveSettings = async (updatedSettings: WeddingSettings) => {
    await settingRepo.saveSettings(currentWorkspaceId, currentWeddingId, updatedSettings);
  };

  return { settings, loading, saveSettings };
};

export default useWeddingSettings;
