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
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOnboarding = location.state?.fromOnboarding;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    address: {
      street: "",
      zipCode: "",
      city: "",
      country: "",
    },
    hireDate: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/employees/${id}`
        );
        setEmployee(res.data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Failed to fetch employee details.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      navigate(fromOnboarding ? "/onboarding" : "/employees");
    } catch (err) {
      setError("Failed to delete employee.");
    }
  };

  const handleUpdate = () => {
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      department: employee.department || "",
      address: {
        street: employee.address?.street || "",
        zipCode: employee.address?.zipCode || "",
        city: employee.address?.city || "",
        country: employee.address?.country || "",
      },
      hireDate: employee.hireDate || "",
    });
    setShowUpdateForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/employees/${id}`,
        formData
      );
      if (response.status === 200) {
        setShowUpdateForm(false);
        // Refresh employee data
        const updatedEmployee = await axios.get(
          `http://localhost:5000/api/employees/${id}`
        );
        setEmployee(updatedEmployee.data);
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error.response) {
        alert(
          `Error: ${
            error.response.data.message ||
            "Failed to update employee. Please check your input and try again."
          }`
        );
      } else if (error.request) {
        alert(
          "No response from server. Please check your connection and try again."
        );
      } else {
        alert("Error setting up the request. Please try again.");
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
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
        );
      case "documents":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Documents
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              No documents available.
            </div>
          </div>
        );
      case "history":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Employment History
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              No history available.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!employee) return <div className="p-6">Employee not found.</div>;

  return (
    <div className="w-full px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Employees
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </span>
            </div>
            <div className="ml-4 sm:ml-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                {employee.position}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 py-1 pl-1 pr-4  text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors"
            >
              <div className="bg-white rounded-3xl p-2 text-black">
                <PencilSquareIcon className="h-5 w-5" />
              </div>
              Update
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-3 sm:px-4 py-2 font-medium bg-red-600 text-white rounded-3xl hover:bg-red-700 text-sm sm:text-base"
            >
              <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        <nav className="flex min-w-max">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === "overview"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === "documents"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
              activeTab === "history"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div>{renderTabContent()}</div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this employee? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Form Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"
                onClick={() => setShowUpdateForm(false)}
              ></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Update Employee
                  </h3>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Position <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hire Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="hireDate"
                        value={
                          formData.hireDate
                            ? formData.hireDate.split("T")[0]
                            : ""
                        }
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-3xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors-"
                    >
                      Update Employee
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetails;
