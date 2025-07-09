import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOnboarding = location.state?.fromOnboarding;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/employees/${id}`
        );
        console.log("Employee data received:", response.data);
        setEmployee(response.data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Failed to fetch employee details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!employee) return <div className="p-6">Employee not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/employee/employees")}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {fromOnboarding ? "Back to Onboarding" : "Back to Employees"}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {employee.position}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {employee.email}
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {employee.phone}
                </span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {employee.address?.street}, {employee.address?.zipCode},{" "}
                  {employee.address?.city}, {employee.address?.country}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Employment Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {employee.department}
                </span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {employee.position}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  Hired:{" "}
                  {employee.hireDate
                    ? new Date(employee.hireDate).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column - Additional Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notes
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              No notes available.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
