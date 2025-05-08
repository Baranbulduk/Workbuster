import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Import all components
import Dashboard from './components/dashboard/Dashboard';
import Candidates from './components/candidates/Candidates';
import CandidateDetails from './components/candidates/CandidateDetails';
import Clients from './components/clients/Clients';
import Projects from './components/projects/Projects';
import Missions from './components/missions/Missions';
import Messaging from './components/messaging/Messaging';
import Notifications from './components/notifications/Notifications';
import ScheduleManagement from './components/schedule/ScheduleManagement';
import Attendance from './components/attendance/Attendance';
import Reports from './components/reports/Reports';
import Statistics from './components/statistics/Statistics';
import DocumentSharing from './components/documents/DocumentSharing';
import Settings from './components/settings/Settings';
import Onboarding from './components/onboarding/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';

// Layout wrapper component
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes with layout */}
          <Route element={<LayoutWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateDetails />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/schedule" element={<ScheduleManagement />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/documents" element={<DocumentSharing />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
