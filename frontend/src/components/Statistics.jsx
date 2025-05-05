import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Statistics() {
  const { isDarkMode } = useTheme();
  const [timeRange, setTimeRange] = useState('month');

  // Sample data - in a real application, this would come from an API
  const statistics = {
    projects: {
      total: 24,
      active: 12,
      completed: 8,
      pending: 4,
      trend: '+12%'
    },
    candidates: {
      total: 156,
      active: 45,
      placed: 32,
      available: 79,
      trend: '+8%'
    },
    clients: {
      total: 42,
      active: 28,
      new: 5,
      inactive: 9,
      trend: '+5%'
    },
    revenue: {
      total: '$245,678',
      monthly: '$32,450',
      quarterly: '$98,750',
      yearly: '$245,678',
      trend: '+15%'
    }
  };

  const performanceMetrics = [
    {
      id: 1,
      metric: 'Project Completion Rate',
      value: '85%',
      target: '90%',
      status: 'on-track'
    },
    {
      id: 2,
      metric: 'Candidate Placement Rate',
      value: '78%',
      target: '80%',
      status: 'on-track'
    },
    {
      id: 3,
      metric: 'Client Satisfaction',
      value: '92%',
      target: '95%',
      status: 'on-track'
    },
    {
      id: 4,
      metric: 'Revenue Growth',
      value: '15%',
      target: '20%',
      status: 'needs-improvement'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'needs-improvement':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'at-risk':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Statistics & Analytics</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('quarter')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-md ${
              timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Projects</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{statistics.projects.total}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active: {statistics.projects.active}</span>
              <span className="ml-2 text-sm text-green-600 dark:text-green-400">{statistics.projects.trend}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Candidates</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{statistics.candidates.total}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Available: {statistics.candidates.available}</span>
              <span className="ml-2 text-sm text-green-600 dark:text-green-400">{statistics.candidates.trend}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clients</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{statistics.clients.total}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Active: {statistics.clients.active}</span>
              <span className="ml-2 text-sm text-green-600 dark:text-green-400">{statistics.clients.trend}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revenue</h3>
          <div className="mt-2">
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{statistics.revenue.total}</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Monthly: {statistics.revenue.monthly}</span>
              <span className="ml-2 text-sm text-green-600 dark:text-green-400">{statistics.revenue.trend}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.id} className="border dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.metric}</h3>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Target</span>
                  <span className="font-medium text-gray-900 dark:text-white">{metric.target}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(parseInt(metric.value) / parseInt(metric.target)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Distribution</h2>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {/* Placeholder for chart - would be replaced with actual chart component */}
            Project Distribution Chart
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h2>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            {/* Placeholder for chart - would be replaced with actual chart component */}
            Revenue Trend Chart
          </div>
        </div>
      </div>
    </div>
  );
} 