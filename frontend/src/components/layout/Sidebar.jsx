import React, { useState, useEffect } from 'react';
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
  UserIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  DocumentChartBarIcon,
  ClipboardDocumentIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { FiHome, FiUsers, FiUserCheck, FiBriefcase, FiCalendar, FiMessageSquare, FiBarChart2, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const searchParams = new URLSearchParams(location.search);
const token = searchParams.get('token');
const email = searchParams.get('email');

const navigation = [
  { name: `Dashboard`, href: `/${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: HomeIcon },
  { name: `Candidates`, href: `/candidates${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: UserGroupIcon },
  { name: `Employees`, href: `/employees${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: UserGroupIcon }, 
  { name: `Clients`, href: `/clients${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: UserGroupIcon }, 
  { name: `Onboarding`, href: `/onboarding${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: UserIcon }, 
  { name: `Statistics`, href: `/statistics${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: ChartBarIcon },
  { name: `Settings`, href: `/settings${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`, icon: Cog6ToothIcon }
];

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    // Clear any stored authentication data if needed
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    
    // Navigate to login page
    navigate('/login');
  };

  const handleNavigation = (href) => {
    navigate(href);
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        h-full flex flex-col bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-900                     dark:backdrop-blur-sm rounded-lg shadow border 
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-900">
          <div className={`flex items-center ${!isSidebarOpen ? 'w-full justify-center' : 'space-x-3'}`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 hidden lg:block"
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
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`flex items-center ${!isSidebarOpen ? 'w-full justify-center' : ''}`}>
                    <item.icon
                      className={`h-5 w-5 ${
                        isActive
                          ? 'text-red-700 dark:text-red-300'
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
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-900">
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

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
} 