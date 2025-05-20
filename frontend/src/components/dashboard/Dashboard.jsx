import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import StatCard from './StatCard';

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    candidates: {
      total: 0,
      byStatus: {},
      bySource: {},
      byDepartment: {}
    },
    employees: {
      total: 0,
      byDepartment: {},
      byStatus: {}
    },
    clients: {
      total: 0,
      byIndustry: {},
      byStatus: {}
    },
    revenue: {
      total: 0,
      monthly: [0, 0, 0, 0, 0, 0]
    }
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch candidates
      const candidatesResponse = await axios.get('http://localhost:5000/api/candidates');
      const totalCandidates = candidatesResponse.data.length;

  

      // For messages, we'll use the length of the messages array from Messaging component
      // This is a static example since we don't have a messages API endpoint yet
      const newMessages = 3; // This matches the initial messages in Messaging.jsx

      setStatistics({
        candidates: {
          total: totalCandidates,
          byStatus: {},
          bySource: {},
          byDepartment: {}
        },
        employees: {
          total: 0,
          byDepartment: {},
          byStatus: {}
        },
        clients: {
          total: 0,
          byIndustry: {},
          byStatus: {}
        },
        revenue: {
          total: 0,
          monthly: [0, 0, 0, 0, 0, 0]
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [candidatesRes, employeesRes, clientsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/candidates'),
        axios.get('http://localhost:5000/api/employees'),
        axios.get('http://localhost:5000/api/clients'),
      ]);
      const activities = [];
      candidatesRes.data.forEach(c => activities.push({
        type: 'Candidate',
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        action: 'Added/Updated Candidate',
        time: c.updatedAt || c.createdAt
      }));
      employeesRes.data.forEach(e => activities.push({
        type: 'Employee',
        name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        action: 'Added/Updated Employee',
        time: e.updatedAt || e.createdAt
      }));
      clientsRes.data.forEach(cl => activities.push({
        type: 'Client',
        name: cl.companyName,
        email: cl.email,
        action: 'Added/Updated Client',
        time: cl.updatedAt || cl.createdAt
      }));
      // Sort by time, descending
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 8)); // Show only the 8 most recent
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Candidates"
          value={statistics.candidates.total}
          icon={<UserGroupIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Total Employees"
          value={statistics.employees.total}
          icon={<UserIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Total Clients"
          value={statistics.clients.total}
          icon={<BuildingOfficeIcon className="h-6 w-6" />}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">No recent activity.</div>
            ) : (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === 'Candidate' ? 'bg-blue-100 dark:bg-blue-900' : activity.type === 'Employee' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                      <span className={`font-medium ${activity.type === 'Candidate' ? 'text-blue-600 dark:text-blue-400' : activity.type === 'Employee' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{activity.type[0]}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.action}</p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.time).toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/candidates')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Register New Candidate
            </button>
            <button 
              onClick={() => navigate('/employees')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add New Employee
            </button>
            <button 
              onClick={() => navigate('/clients')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Register New Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 