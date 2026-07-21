import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { WorkspaceRepository } from '../repositories/WorkspaceRepository';
import { WorkspaceSettings } from '@project-ra/types';

const workspaceRepo = new WorkspaceRepository();

export const useWorkspaceSettings = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = workspaceRepo.subscribeWorkspace(
      currentWorkspaceId,
      (loadedSettings) => {
        setSettings(loadedSettings);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentWorkspaceId]);

  const saveWorkspace = async (updatedSettings: WorkspaceSettings) => {
    await workspaceRepo.saveWorkspace(currentWorkspaceId, updatedSettings);
  };

  return { settings, loading, saveWorkspace };
};

export default useWorkspaceSettings;
