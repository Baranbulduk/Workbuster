import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  BellIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentChartBarIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { FiHome, FiUsers, FiUserCheck, FiBriefcase, FiCalendar, FiMessageSquare, FiBarChart2, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Candidates', href: '/candidates', icon: UserGroupIcon },
  { name: 'Employees', href: '/employees', icon: UserGroupIcon },
  { name: 'Projects', href: '/projects', icon: BriefcaseIcon },
  { name: 'Clients', href: '/clients', icon: BuildingOfficeIcon },
  { name: 'Schedule', href: '/schedule', icon: CalendarIcon },
  { name: 'Messaging', href: '/messaging', icon: ChatBubbleLeftRightIcon },
  { name: 'Statistics', href: '/statistics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Missions', href: '/missions', icon: ClipboardDocumentIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Attendance', href: '/attendance', icon: ClockIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  { name: 'Onboarding', href: '/onboarding', icon: UserPlusIcon }
];

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear any stored authentication data if needed
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    
    // Navigate to login page
    navigate('/login');
  };

  const handleNavigation = (href) => {
    navigate(href);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  };

  return (
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
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
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
  );
} 