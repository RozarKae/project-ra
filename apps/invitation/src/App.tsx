import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceProvider } from '@project-ra/shared';
import PublicWedding from './pages/PublicWedding';

function App() {
  return (
    <WorkspaceProvider>
      <Routes>
        <Route path="/" element={<PublicWedding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </WorkspaceProvider>
  );
}

export default App;
