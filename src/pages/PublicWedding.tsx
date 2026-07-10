import React, { useEffect } from 'react';
import { useWeddingSettings } from '../hooks/useWeddingSettings';

export const PublicWedding: React.FC = () => {
  const { settings } = useWeddingSettings();

  useEffect(() => {
    // Construct dynamic tab title based on centralized settings (Sprint S.4 logic)
    const groomName = settings?.groom?.name || 'Rozar';
    const brideName = settings?.bride?.name || 'Arifa';
    document.title = `${groomName} & ${brideName} Wedding Invitation`;
  }, [settings]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#090909]">
      <iframe
        src="/invitation/index.html"
        title="Rozar & Arifa Wedding Invitation"
        className="w-full h-full border-none outline-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
      />
    </div>
  );
};

export default PublicWedding;
