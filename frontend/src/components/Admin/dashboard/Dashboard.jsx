import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import axios from "../../../utils/axios";
import StatCard from "./StatCard";

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    candidates: {
      total: 0,
      byStatus: {},
      bySource: {},
      byDepartment: {},
    },
    employees: {
      total: 0,
      byDepartment: {},
      byStatus: {},
    },
    clients: {
      total: 0,
      byIndustry: {},
      byStatus: {},
    },
    revenue: {
      total: 0,
      monthly: [0, 0, 0, 0, 0, 0],
    },
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
      const [candidatesRes, employeesRes, clientsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/candidates"),
        axios.get("http://localhost:5000/api/employees"),
        axios.get("http://localhost:5000/api/clients"),
      ]);

      setStatistics({
        candidates: {
          total: candidatesRes.data.length,
          byStatus: {},
          bySource: {},
          byDepartment: {},
        },
        employees: {
          total: employeesRes.data.length,
          byDepartment: {},
          byStatus: {},
        },
        clients: {
          total: clientsRes.data.length,
          byIndustry: {},
          byStatus: {},
        },
        revenue: {
          total: 0,
          monthly: [0, 0, 0, 0, 0, 0],
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const getIconByType = (type) => {
    switch (type) {
      case "Candidate":
        return UserGroupIcon;
      case "Employee":
        return UserGroupIcon;
      case "Client":
        return UserGroupIcon;
      default:
        return UserGroupIcon;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case "Candidate":
        return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300";
      case "Employee":
        return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
      case "Client":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [candidatesRes, employeesRes, clientsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/candidates"),
        axios.get("http://localhost:5000/api/employees"),
        axios.get("http://localhost:5000/api/clients"),
      ]);
      const activities = [];
      candidatesRes.data.forEach((c) =>
        activities.push({
          type: "Candidate",
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          action: "Added/Updated Candidate",
          time: c.updatedAt || c.createdAt,
          icon: getIconByType("Candidate"),
          _id: c._id,
        })
      );
      employeesRes.data.forEach((e) =>
        activities.push({
          type: "Employee",
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          action: "Added/Updated Employee",
          time: e.updatedAt || e.createdAt,
          icon: getIconByType("Employee"),
          _id: e._id,
        })
      );
      clientsRes.data.forEach((cl) =>
        activities.push({
          type: "Client",
          name: cl.companyName,
          email: cl.email,
          action: "Added/Updated Client",
          time: cl.updatedAt || cl.createdAt,
          icon: getIconByType("Client"),
          _id: cl._id,
        })
      );
      // Sort by time, descending
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 8)); // Show only the 8 most recent
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent w-fit mb-6">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Candidates"
          value={statistics.candidates.total}
         
          type="Candidate"
        />
        <StatCard
          title="Total Employees"
          value={statistics.employees.total}
         
          type="Employee"
        />
        <StatCard
          title="Total Clients"
          value={statistics.clients.total}
         
          type="Client"
        />
      </div>

      {/* Recent Activity */}
      <div className="flex flex-col gap-6">
         <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h2> <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className=" sm:p-2">
          
            <div>
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors duration-150"
                  onClick={() => {
                    switch (activity.type) {
                      case "Candidate":
                        navigate(`/candidates/${activity._id}`);
                        break;
                      case "Employee":
                        navigate(`/employees/${activity._id}`);
                        break;
                      case "Client":
                        navigate(`/clients/${activity._id}`);
                        break;
                    }
                  }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${getBackgroundColor(
                        activity.type
                      )}`}
                    >
                      <span className="text-xl font-medium">
                        {activity.type.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h2>
        <div>
          <div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/candidates")}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-3xl bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition-colors"
              >
                Register New Candidate
              </button>
              <button
                onClick={() => navigate("/employees")}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-3xl bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base transition-colors"
              >
                Add New Employee
              </button>
              <button
                onClick={() => navigate("/clients")}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 font-medium rounded-3xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base transition-colors"
              >
                Register New Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
