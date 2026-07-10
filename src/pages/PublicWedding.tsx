import React from 'react';

export const PublicWedding: React.FC = () => {
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
