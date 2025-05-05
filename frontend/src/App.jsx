import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Import all components
import Dashboard from './components/Dashboard';
import RegisterCandidate from './components/RegisterCandidate';
import RegisterClients from './components/RegisterClients';
import CreateProjects from './components/CreateProjects';
import CreateMissions from './components/CreateMissions';
import Messaging from './components/Messaging';
import Notifications from './components/Notifications';
import ScheduleManagement from './components/ScheduleManagement';
import Attendance from './components/Attendance';
import Reports from './components/Reports';
import Statistics from './components/Statistics';
import DocumentSharing from './components/DocumentSharing';
import Settings from './components/Settings';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register-candidate" element={<RegisterCandidate />} />
            <Route path="/register-clients" element={<RegisterClients />} />
            <Route path="/create-projects" element={<CreateProjects />} />
            <Route path="/create-missions" element={<CreateMissions />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/schedule" element={<ScheduleManagement />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/documents" element={<DocumentSharing />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
