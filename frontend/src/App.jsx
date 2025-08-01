import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import {
  HomeIcon,
  UserIcon,
  UserGroupIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import LogoutPopup from "./components/layout/LogoutPopup";

// Import all components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Admin/dashboard/Dashboard";
import Candidates from "./components/Admin/candidates/Candidates";
import CandidateDetails from "./components/Admin/candidates/CandidateDetails";
import Employees from "./components/Admin/employees/Employees";
import EmployeeDetails from "./components/Admin/employees/EmployeeDetails";
import Clients from "./components/Admin/clients/Clients";
import ClientsDetails from "./components/Admin/clients/ClientsDetails";
import Onboarding from "./components/Admin/onboarding/Onboarding";
import Statistics from "./components/Admin/statistics/Statistics";
import Settings from "./components/Admin/settings/Settings";

import EmployeeLogin from "./components/Employee/EmployeeLogin";
import EmployeeEmployees from "./components/Employee/employees/Employees";
import EmployeeEmployeeDetails from "./components/Employee/employees/EmployeeDetails";
import EmployeeOnboarding from "./components/Employee/onboarding/Onboarding";
import EmployeeSettings from "./components/Employee/settings/Settings";

import CandidateLogin from "./components/Candidate/CandidateLogin";
import CandidateCandidates from "./components/Candidate/candidates/Candidate";
import CandidateCandidateDetails from "./components/Candidate/candidates/CandidateDetails";
import CandidateOnboarding from "./components/Candidate/onboarding/Onboarding";
import CandidateSettings from "./components/Candidate/settings/Settings";

import ClientLogin from "./components/Client/ClientLogin";
import ClientClients from "./components/Client/clients/Client";
import ClientClientDetails from "./components/Client/clients/ClientDetails";
import ClientOnboarding from "./components/Client/onboarding/Onboarding";
import ClientSettings from "./components/Client/settings/Settings";


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
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const navigation = [
    {
      name: "Employees",
      href: `/employee/employees${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: UserGroupIcon,
    },
    {
      name: "Onboarding",
      href: `/employee/onboarding${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: UserIcon,
    },
    {
      name: "Settings",
      href: `/employee/settings${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: Cog6ToothIcon,
    },
  ];

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`h-full flex flex-col bg-gradient-to-br from-[#e6b05c] via-[#e05a5a] to-[#7a5fd3] dark:bg-gradient-to-br dark:from-[#e6b05c] dark:via-[#e05a5a] dark:to-[#7a5fd3] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10">
          <div
            className={`flex items-center ${
              !isSidebarOpen ? "w-full justify-center" : "space-x-3"
            }`}
          >
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-white/10 text-white"
            >
              <svg
                className={`w-5 h-5 text-white transform transition-transform duration-200 ${
                  !isSidebarOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {isSidebarOpen && (
              <h2 className="text-xl font-bold text-white">
                Employee Dashboard
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const itemPath = item.href.split("?")[0]; // Get pathname without query params
              const isActive =
                location.pathname === itemPath ||
                location.pathname.startsWith(itemPath + "/");
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-white text-orange-600"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      !isSidebarOpen ? "w-full justify-center" : ""
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive ? "text-orange-600" : "text-white"
                      } ${isSidebarOpen ? "mr-3" : ""}`}
                      aria-hidden="true"
                    />
                    {isSidebarOpen && item.name}
                  </div>
                  {!isSidebarOpen && (
                    <div className="absolute left-20 bg-black bg-opacity-80 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Theme Switcher */}
        <div className="flex p-2">
          {isSidebarOpen ? (
            <div className="flex items-center justify-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md"
              >
                {isDarkMode ? (
                  <MoonIcon className="h-7 w-7 text-white bg-gray-700 rounded-full p-1" />
                ) : (
                  <SunIcon className="h-7 w-7 text-white bg-yellow-500 rounded-full p-1" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center mb-2"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <MoonIcon className="h-7 w-7 text-white bg-gray-700 rounded-full p-1" />
              ) : (
                <SunIcon className="h-7 w-7 text-white bg-yellow-500 rounded-full p-1" />
              )}
            </button>
          )}
        </div>
        {/* Logout Button */}
        <div className="p-4 bg-white/10">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md"
          >
            <div
              className={`flex items-center ${
                !isSidebarOpen ? "w-full justify-center" : ""
              }`}
            >
              <ArrowRightOnRectangleIcon
                className={`h-5 w-5 text-white ${isSidebarOpen ? "mr-3" : ""}`}
                aria-hidden="true"
              />
              {isSidebarOpen && "Logout"}
            </div>
            {!isSidebarOpen && (
              <div className="absolute left-20 bg-black bg-opacity-80 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

      {/* Logout Popup */}
      <LogoutPopup 
        isOpen={showLogoutPopup}
        onClose={() => setShowLogoutPopup(false)}
        userType="employee"
      />
    </div>
  );
};


// Simple candidate layout with limited navigation
const CandidateLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const navigation = [
    {
      name: "Candidates",
      href: `/candidate/candidates${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: UserGroupIcon,
    },
    {
      name: "Onboarding",
      href: `/candidate/onboarding${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: UserIcon,
    },
    {
      name: "Settings",
      href: `/candidate/settings${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: Cog6ToothIcon,
    },
  ];

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`h-full flex flex-col bg-gradient-to-br from-[#e6b05c] via-[#e05a5a] to-[#7a5fd3] dark:bg-gradient-to-br dark:from-[#e6b05c] dark:via-[#e05a5a] dark:to-[#7a5fd3] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10">
          <div
            className={`flex items-center ${
              !isSidebarOpen ? "w-full justify-center" : "space-x-3"
            }`}
          >
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-white/10 text-white"
            >
              <svg
                className={`w-5 h-5 text-white transform transition-transform duration-200 ${
                  !isSidebarOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {isSidebarOpen && (
              <h2 className="text-xl font-bold text-white">
                Candidate Dashboard
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const itemPath = item.href.split("?")[0]; // Get pathname without query params
              const isActive =
                location.pathname === itemPath ||
                location.pathname.startsWith(itemPath + "/");
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-white text-orange-600"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      !isSidebarOpen ? "w-full justify-center" : ""
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive ? "text-orange-600" : "text-white"
                      } ${isSidebarOpen ? "mr-3" : ""}`}
                      aria-hidden="true"
                    />
                    {isSidebarOpen && item.name}
                  </div>
                  {!isSidebarOpen && (
                    <div className="absolute left-20 bg-black bg-opacity-80 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Theme Switcher */}
        <div className="flex p-2">
          {isSidebarOpen ? (
            <div className="flex items-center justify-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md"
              >
                {isDarkMode ? (
                  <MoonIcon className="h-7 w-7 text-white bg-gray-700 rounded-full p-1" />
                ) : (
                  <SunIcon className="h-7 w-7 text-white bg-yellow-500 rounded-full p-1" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center mb-2"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <MoonIcon className="h-7 w-7 text-white bg-gray-700 rounded-full p-1" />
              ) : (
                <SunIcon className="h-7 w-7 text-white bg-yellow-500 rounded-full p-1" />
              )}
            </button>
          )}
        </div>
        {/* Logout Button */}
        <div className="p-4 bg-white/10">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md"
          >
            <div
              className={`flex items-center ${
                !isSidebarOpen ? "w-full justify-center" : ""
              }`}
            >
              <ArrowRightOnRectangleIcon
                className={`h-5 w-5 text-white ${isSidebarOpen ? "mr-3" : ""}`}
                aria-hidden="true"
              />
              {isSidebarOpen && "Logout"}
            </div>
            {!isSidebarOpen && (
              <div className="absolute left-20 bg-black bg-opacity-80 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

      {/* Logout Popup */}
      <LogoutPopup 
        isOpen={showLogoutPopup}
        onClose={() => setShowLogoutPopup(false)}
        userType="candidate"
      />
    </div>
  );
};

// Simple candidate layout with limited navigation
const ClientLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const navigation = [
    {
      name: "Clients",
      href: `/client/clients${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: UserGroupIcon,
    },
    {
      name: "Onboarding",
      href: `/client/onboarding${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: UserIcon,
    },
    {
      name: "Settings",
      href: `/client/settings${
        token ? `?token=${token}${email ? `&email=${email}` : ""}` : ""
      }`,
      icon: Cog6ToothIcon,
    },
  ];

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`h-full flex flex-col bg-gradient-to-br from-[#e6b05c] via-[#e05a5a] to-[#7a5fd3] dark:bg-gradient-to-br dark:from-[#e6b05c] dark:via-[#e05a5a] dark:to-[#7a5fd3] border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10">
          <div
            className={`flex items-center ${
              !isSidebarOpen ? "w-full justify-center" : "space-x-3"
            }`}
          >
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-white/10 text-white"
            >
              <svg
                className={`w-5 h-5 text-white transform transition-transform duration-200 ${
                  !isSidebarOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            {isSidebarOpen && (
              <h2 className="text-xl font-bold text-white">
                Client Dashboard
              </h2>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const itemPath = item.href.split("?")[0]; // Get pathname without query params
              const isActive =
                location.pathname === itemPath ||
                location.pathname.startsWith(itemPath + "/");
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? "bg-white text-orange-600"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      !isSidebarOpen ? "w-full justify-center" : ""
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive ? "text-orange-600" : "text-white"
                      } ${isSidebarOpen ? "mr-3" : ""}`}
                      aria-hidden="true"
                    />
                    {isSidebarOpen && item.name}
                  </div>
                  {!isSidebarOpen && (
                    <div className="absolute left-20 bg-black bg-opacity-80 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Theme Switcher */}
        <div className="flex p-2">
          {isSidebarOpen ? (
            <div className="flex items-center justify-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md"
              >
                {isDarkMode ? (
                  <MoonIcon className="h-7 w-7 text-white bg-gray-700 rounded-full p-1" />
                ) : (
                  <SunIcon className="h-7 w-7 text-white bg-yellow-500 rounded-full p-1" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center mb-2"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <MoonIcon className="h-7 w-7 text-white bg-gray-700 rounded-full p-1" />
              ) : (
                <SunIcon className="h-7 w-7 text-white bg-yellow-500 rounded-full p-1" />
              )}
            </button>
          )}
        </div>
        {/* Logout Button */}
        <div className="p-4 bg-white/10">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-2 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md"
          >
            <div
              className={`flex items-center ${
                !isSidebarOpen ? "w-full justify-center" : ""
              }`}
            >
              <ArrowRightOnRectangleIcon
                className={`h-5 w-5 text-white ${isSidebarOpen ? "mr-3" : ""}`}
                aria-hidden="true"
              />
              {isSidebarOpen && "Logout"}
            </div>
            {!isSidebarOpen && (
              <div className="absolute left-20 bg-black bg-opacity-80 text-white text-sm py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

      {/* Logout Popup */}
      <LogoutPopup 
        isOpen={showLogoutPopup}
        onClose={() => setShowLogoutPopup(false)}
        userType="client"
      />
    </div>
  );
};

// Custom hook to set dynamic document title
function useDynamicTitle() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith("/employee")) document.title = "Employee Dashboard";
    else if (location.pathname.startsWith("/candidate")) document.title = "Candidate Dashboard";
    else if (location.pathname.startsWith("/client")) document.title = "Client Dashboard";
    else if (location.pathname.startsWith("/")) document.title = "Admin Dashboard";
    else document.title = "Dashboard";
  }, [location]);
}

// Component to call the hook inside Router context
function DynamicTitleHandler() {
  useDynamicTitle();
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <DynamicTitleHandler />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/client/login" element={<ClientLogin />} />

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
            <Route path="dashboard" element={<Dashboard />} />
          </Route>

          {/* Employee dashboard routes */}
          <Route path="/employee" element={<EmployeeLayout />}>
            <Route path="employees" element={<EmployeeEmployees />} />
            <Route path="employees/:id" element={<EmployeeEmployeeDetails />} />
            <Route path="onboarding" element={<EmployeeOnboarding />} />
            <Route path="settings" element={<EmployeeSettings />} />
          </Route>

          {/* Candidate dashboard routes */}
          <Route path="/candidate" element={<CandidateLayout />}>
            <Route path="candidates" element={<CandidateCandidates />} />
            <Route path="candidates/:id" element={<CandidateCandidateDetails />} />
            <Route path="onboarding" element={<CandidateOnboarding />} />
            <Route path="settings" element={<CandidateSettings />} />
          </Route>

          {/* Client dashboard routes */}
          <Route path="/client" element={<ClientLayout />}>
            <Route path="clients" element={<ClientClients />} />
            <Route path="clients/:id" element={<ClientClientDetails />} />
            <Route path="onboarding" element={<ClientOnboarding />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
