import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Statistics = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    candidates: {
      total: 0,
      active: 0,
      placed: 0,
      inProgress: 0
    },
    clients: {
      total: 0,
      active: 0,
      new: 0
    },
    revenue: {
      monthly: [0, 0, 0, 0, 0, 0] // Initialize with zeros for 6 months
    },
    performance: {
      placementRate: 0,
      averageTimeToFill: 0,
      clientSatisfaction: 0,
      candidateSatisfaction: 0
    }
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchStatistics();
    fetchEmployees();
    // Set up polling every 30 seconds to keep data fresh
    const interval = setInterval(() => {
      fetchStatistics();
      fetchEmployees();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      // Fetch candidates data
      const candidatesResponse = await axios.get('http://localhost:5000/api/candidates');
      const candidates = candidatesResponse.data;
    
      
      // Fetch clients data
      const clientsResponse = await axios.get('http://localhost:5000/api/clients');
      const clients = clientsResponse.data;

      // Calculate statistics
      const candidateStats = {
        total: candidates.length,
        active: candidates.filter(c => c.status === 'active').length,
        placed: candidates.filter(c => c.status === 'placed').length,
        inProgress: candidates.filter(c => c.status === 'in-progress').length
      };


      const clientStats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        new: clients.filter(c => {
          const createdDate = new Date(c.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdDate >= thirtyDaysAgo;
        }).length
      };

      // Calculate revenue data (example calculation)
      const revenueData = {
        monthly: [0, 0, 0, 0, 0, 0] // Initialize with zeros
      };

      // Calculate performance metrics (example calculation)
      const performanceData = {
        placementRate: 0,
        averageTimeToFill: 0,
        clientSatisfaction: 0,
        candidateSatisfaction: 0
      };

      setStatistics({
        candidates: candidateStats,
        clients: clientStats,
        revenue: revenueData,
        performance: performanceData
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeesResponse = await axios.get('http://localhost:5000/api/employees');
      setEmployees(employeesResponse.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  const candidateData = {
    labels: Object.keys(statistics.candidates.byStatus || {}),
    datasets: [
      {
        label: 'Candidates by Status',
        data: Object.values(statistics.candidates.byStatus || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ]
      }
    ]
  };



  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: statistics.revenue?.monthly || [0, 0, 0, 0, 0, 0],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const clientData = {
    labels: Object.keys(statistics.clients.byIndustry || {}),
    datasets: [
      {
        label: 'Clients by Industry',
        data: Object.values(statistics.clients.byIndustry || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }
    ]
  };

  // Employee statistics
  const employeeStats = {
    total: employees.length,
    byStatus: employees.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1;
      return acc;
    }, {}),
    byDepartment: employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {}),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Statistics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg shadow">
          <h2 
            className="text-lg font-semibold mb-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => navigate('/candidates')}
          >
            Candidate Overview
          </h2>
          <div className="space-y-2">
            <p>Total Candidates: {statistics.candidates.total}</p>
            <p>Active Candidates: {statistics.candidates.active}</p>
            <p>Placed Candidates: {statistics.candidates.placed}</p>
            <p>In Progress: {statistics.candidates.inProgress}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg shadow">
          <h2 
            className="text-lg font-semibold mb-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => navigate('/clients')}
          >
            Client Overview
          </h2>
          <div className="space-y-2">
            <p>Total Clients: {statistics.clients.total}</p>
            <p>Active Clients: {statistics.clients.active}</p>
            <p>New Clients: {statistics.clients.new}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded-lg shadow">
          <h2 
            className="text-lg font-semibold mb-4 cursor-pointer hover:text-green-600 dark:hover:text-green-400"
            onClick={() => navigate('/employees')}
          >
            Employee Overview
          </h2>
          <div className="space-y-2">
            <p>Total Employees: {employeeStats.total}</p>
            <p>By Status:</p>
            <ul className="ml-4 list-disc">
              {Object.entries(employeeStats.byStatus).map(([status, count]) => (
                <li key={status}>{status}: {count}</li>
              ))}
            </ul>
            <p>By Department:</p>
            <ul className="ml-4 list-disc">
              {Object.entries(employeeStats.byDepartment).map(([dept, count]) => (
                <li key={dept}>{dept}: {count}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics; 