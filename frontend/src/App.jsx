import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ThemeProvider } from './context/ThemeContext';

// Import all components
import Dashboard from './components/dashboard/Dashboard';
import Candidates from './components/candidates/Candidates';
import CandidateDetails from './components/candidates/CandidateDetails';
import Clients from './components/clients/Clients';
import Statistics from './components/statistics/Statistics';
import Settings from './components/settings/Settings';
import Onboarding from './components/onboarding/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Employees from './components/employees/Employees';
import EmployeeDetails from './components/employees/EmployeeDetails';

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
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<CandidateDetails />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="clients" element={<Clients />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
