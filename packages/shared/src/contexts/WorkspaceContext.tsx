import React, { createContext, useContext, useState } from 'react';

export interface WorkspaceContextType {
  currentWorkspaceId: string;
  currentWeddingId: string;
  setWorkspace: (workspaceId: string, weddingId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaceId, setWorkspaceId] = useState('default_workspace');
  const [weddingId, setWeddingId] = useState('arifa_rozar_wedding');

  const setWorkspace = (wId: string, wedId: string) => {
    setWorkspaceId(wId);
    setWeddingId(wedId);
  };

  return (
    <WorkspaceContext.Provider value={{ currentWorkspaceId: workspaceId, currentWeddingId: weddingId, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export default WorkspaceContext;
