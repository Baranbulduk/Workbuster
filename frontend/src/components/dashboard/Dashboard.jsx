import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeProjects: 0,
    openPositions: 0,
    newMessages: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch candidates
      const candidatesResponse = await axios.get('http://localhost:5000/api/candidates');
      const totalCandidates = candidatesResponse.data.length;

  

      // For messages, we'll use the length of the messages array from Messaging component
      // This is a static example since we don't have a messages API endpoint yet
      const newMessages = 3; // This matches the initial messages in Messaging.jsx

      setStats({
        openPositions: 8, // This is still hardcoded as we don't have an API endpoint for positions
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Open Positions</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.openPositions}</p>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">JD</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Added a new candidate</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">2h ago</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-medium">AS</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Alice Smith</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated project status</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">4h ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/candidates')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Register New Candidate
            </button>
            <button 
              onClick={() => navigate('/projects')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Create New Project
            </button>
            <button 
              onClick={() => navigate('/schedule')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Add Schedule
            </button>
            <button 
              onClick={() => navigate('/messaging')}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 