import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@project-ra/firebase';
import { WorkspaceProvider } from '@project-ra/shared';
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './modules/dashboard/Dashboard';
import Guests from './modules/guests/Guests';
import RsvpDashboard from './modules/rsvp/RsvpDashboard';
import RsvpDetails from './modules/rsvp/RsvpDetails';
import RsvpAttendancePage from './modules/rsvp/RsvpAttendance';
import RsvpHospitality from './modules/rsvp/RsvpHospitality';
import WorkspaceSettings from './modules/settings/WorkspaceSettings';
import UserProfile from './modules/settings/UserProfile';
import TeamManagement from './modules/settings/TeamManagement';
import WeddingSettingsPage from './modules/settings/WeddingSettings';
import InvitationDashboard from './modules/invitations/InvitationDashboard';
import ReportsDashboard from './modules/reports/ReportsDashboard';

function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-panel text-ra-text border-ra-gold/20 font-poppins',
            style: {
              background: '#141414',
              color: '#F5F5F5',
              border: '1px solid rgba(212, 175, 55, 0.15)',
            },
            duration: 4000,
          }}
        />
        <Routes>
          {/* Admin Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Protected Layout (Base /) */}
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="guests" element={<Guests />} />
            <Route path="rsvp" element={<RsvpDashboard />} />
            <Route path="rsvp/details" element={<RsvpDetails />} />
            <Route path="rsvp/attendance" element={<RsvpAttendancePage />} />
            <Route path="rsvp/hospitality" element={<RsvpHospitality />} />
            <Route path="invitations" element={<InvitationDashboard />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="settings/workspace" element={<WorkspaceSettings />} />
            <Route path="settings/profile" element={<UserProfile />} />
            <Route path="settings/team" element={<TeamManagement />} />
            <Route path="settings/wedding" element={<WeddingSettingsPage />} />
          </Route>

          {/* Admin Protected Layout (Base /admin) for backwards compatibility */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="guests" element={<Guests />} />
            <Route path="rsvp" element={<RsvpDashboard />} />
            <Route path="rsvp/details" element={<RsvpDetails />} />
            <Route path="rsvp/attendance" element={<RsvpAttendancePage />} />
            <Route path="rsvp/hospitality" element={<RsvpHospitality />} />
            <Route path="invitations" element={<InvitationDashboard />} />
            <Route path="reports" element={<ReportsDashboard />} />
            <Route path="settings/workspace" element={<WorkspaceSettings />} />
            <Route path="settings/profile" element={<UserProfile />} />
            <Route path="settings/team" element={<TeamManagement />} />
            <Route path="settings/wedding" element={<WeddingSettingsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
