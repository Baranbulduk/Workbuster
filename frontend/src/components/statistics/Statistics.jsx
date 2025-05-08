import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    candidates: {},
    projects: {},
    clients: {},
    revenue: {},
    performance: {}
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/statistics');
      setStatistics(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
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

  const projectData = {
    labels: Object.keys(statistics.projects.byStatus || {}),
    datasets: [
      {
        label: 'Projects by Status',
        data: Object.values(statistics.projects.byStatus || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)'
        ]
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: statistics.revenue.monthly || [],
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Statistics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Candidate Overview</h2>
          <div className="space-y-2">
            <p>Total Candidates: {statistics.candidates.total}</p>
            <p>Active Candidates: {statistics.candidates.active}</p>
            <p>Placed Candidates: {statistics.candidates.placed}</p>
            <p>In Progress: {statistics.candidates.inProgress}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Project Overview</h2>
          <div className="space-y-2">
            <p>Total Projects: {statistics.projects.total}</p>
            <p>Active Projects: {statistics.projects.active}</p>
            <p>Completed Projects: {statistics.projects.completed}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Client Overview</h2>
          <div className="space-y-2">
            <p>Total Clients: {statistics.clients.total}</p>
            <p>Active Clients: {statistics.clients.active}</p>
            <p>New Clients: {statistics.clients.new}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <Line data={revenueData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="space-y-2">
            <p>Placement Rate: {statistics.performance.placementRate}%</p>
            <p>Average Time to Fill: {statistics.performance.averageTimeToFill} days</p>
            <p>Client Satisfaction: {statistics.performance.clientSatisfaction}%</p>
            <p>Candidate Satisfaction: {statistics.performance.candidateSatisfaction}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Candidates by Status</h2>
          <Pie data={candidateData} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Projects by Status</h2>
          <Bar data={projectData} />
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Clients by Industry</h2>
          <Pie data={clientData} />
        </div>
      </div>
    </div>
  );
};

export default Statistics; 