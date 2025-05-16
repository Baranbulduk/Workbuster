import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { 
  HomeIcon, 
  UserGroupIcon, 
  UserPlusIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

// Import all components
import Dashboard from './components/dashboard/Dashboard';
import Candidates from './components/candidates/Candidates';
import CandidateDetails from './components/candidates/CandidateDetails';
import Clients from './components/clients/Clients';
import ClientsDetails from './components/clients/ClientsDetails';
import Statistics from './components/statistics/Statistics';
import Settings from './components/settings/Settings';
import Onboarding from './components/Admin/onboarding/Onboarding';
import Login from './pages/Login';
import Register from './pages/Register';
import Employees from './components/Admin/employees/Employees';
import EmployeeDetails from './components/Admin/employees/EmployeeDetails';
import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeEmployees from './components/Employee/employees/Employees';
import EmployeeEmployeeDetails from './components/Employee/employees/EmployeeDetails';
import EmployeeOnboarding from './components/Employee/onboarding/Onboarding';

// Layout wrapper component
const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Simple employee layout with limited navigation
const EmployeeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Employees', href: '/employee/employees', icon: UserGroupIcon },
    { name: 'Onboarding', href: '/employee/onboarding', icon: UserPlusIcon }
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`h-full flex flex-col bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center ${!isSidebarOpen ? 'w-full justify-center' : 'space-x-3'}`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className={`w-5 h-5 text-gray-700 dark:text-gray-300 transform transition-transform duration-200 ${
                  !isSidebarOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {isSidebarOpen && (
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Employee Dashboard</h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`flex items-center ${!isSidebarOpen ? 'w-full justify-center' : ''}`}>
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
                      } ${isSidebarOpen ? 'mr-3' : ''}`}
                      aria-hidden="true"
                    />
                    {isSidebarOpen && item.name}
                  </div>
                  {!isSidebarOpen && (
                    <div className="absolute left-20 bg-gray-800 dark:bg-gray-800 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md"
          >
            <div className={`flex items-center ${!isSidebarOpen ? 'w-full justify-center' : ''}`}>
              <ArrowRightOnRectangleIcon
                className={`h-5 w-5 text-red-500 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300 ${isSidebarOpen ? 'mr-3' : ''}`}
                aria-hidden="true"
              />
              {isSidebarOpen && 'Logout'}
            </div>
            {!isSidebarOpen && (
              <div className="absolute left-20 bg-red-800 dark:bg-red-900 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
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
          <Route path="/employee/login" element={<EmployeeLogin />} />
          
          {/* Protected routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<CandidateDetails />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetails />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientsDetails />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          {/* Employee dashboard routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route path="employees" element={<EmployeeEmployees />} />
            <Route path="employees/:id" element={<EmployeeEmployeeDetails />} />
            <Route path="onboarding" element={<EmployeeOnboarding />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
