import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import axios from "axios";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "?";
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}`;
};

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({});

  // Get logged-in client from localStorage
  let loggedClient = null;
  try {
    const clientStr = localStorage.getItem("client");
    if (clientStr) loggedClient = JSON.parse(clientStr);
  } catch {}

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/clients/${id}`);
        setClient(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [id]);

  const isOwnProfile = loggedClient && (client && (client._id === loggedClient._id || client.email === loggedClient.email));

  const handleUpdateClick = () => {
    setUpdateFormData({
      companyName: client.companyName || "",
      contactPerson: client.contactPerson || "",
      email: client.email || "",
      phone: client.phone || "",
      address: typeof client.address === "object"
        ? [client.address.street, client.address.city, client.address.state, client.address.zipCode, client.address.country].filter(Boolean).join(", ")
        : client.address || "",
      industry: client.industry || "",
      companySize: client.companySize || "",
      website: client.website || "",
      description: client.description || "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:5000/api/clients/${client._id}`;
      const response = await axios.put(url, updateFormData);
      if (response.status === 200) {
        setShowUpdateModal(false);
        // Refresh client data
        const updatedClient = await axios.get(url);
        setClient(updatedClient.data);
      }
    } catch (error) {
      alert("Failed to update client info. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || "Client not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
    );
  }

  const handleBack = () => {
    if (location.state?.fromDashboard) {
      navigate("/dashboard");
    } else if (location.state?.fromOnboarding) {
      navigate("/onboarding");
    } else {
      navigate("/client/clients");
    }
  };

  // Tab content rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {client.email}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {client.phone}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {typeof client.address === "object"
                        ? `${client.address.street || ""}${client.address.city ? `, ${client.address.city}` : ""}${client.address.state ? `, ${client.address.state}` : ""}${client.address.zipCode ? `, ${client.address.zipCode}` : ""}${client.address.country ? `, ${client.address.country}` : ""}`.replace(/^,\s*/, "").replace(/,\s*$/, "") || "No address"
                        : client.address || "No address"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Company Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Size: {client.companySize}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Industry: {client.industry}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Available: {client.availability || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Expected Budget: {client.expectedBudget}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {client.website ? (
                        <a
                          href={client.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {client.website}
                        </a>
                      ) : (
                        "No website provided"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column - Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  {client.description || "No description provided"}
                </div>
              </div>
            </div>
          </div>
        );
      case "projects":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Projects
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              No projects available.
            </div>
          </div>
        );
      case "contacts":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Key Contacts
            </h2>
            <div className="text-gray-600 dark:text-gray-300">
              No contacts available.
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Clients
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {client.companyName?.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {client.companyName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {client.industry}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isOwnProfile && (
              <button
                onClick={handleUpdateClick}
                className="flex items-center gap-2 py-1 pl-1 pr-4 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors"
              >
                <div className="bg-white rounded-3xl p-2 text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                Update
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "overview"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "projects"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "contacts"
                ? "text-red-600 border-b-2 border-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Contacts
          </button>
        </nav>
      </div>

      {/* Main Content */}
      {renderTabContent()}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Your Information</h3>
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                <form onSubmit={handleUpdateSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name <span className="text-red-500">*</span></label>
                      <input type="text" name="companyName" id="companyName" value={updateFormData.companyName} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required placeholder="Enter company name" />
                    </div>
                    <div>
                      <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Person <span className="text-red-500">*</span></label>
                      <input type="text" name="contactPerson" id="contactPerson" value={updateFormData.contactPerson} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required placeholder="Enter contact person name" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email <span className="text-red-500">*</span></label>
                      <input type="email" name="email" id="email" value={updateFormData.email} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required placeholder="Enter email address" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone <span className="text-red-500">*</span></label>
                      <input type="tel" name="phone" id="phone" value={updateFormData.phone} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required placeholder="Enter phone number" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address <span className="text-red-500">*</span></label>
                      <input type="text" name="address" id="address" value={updateFormData.address} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required placeholder="Enter company address" />
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry <span className="text-red-500">*</span></label>
                      <input type="text" name="industry" id="industry" value={updateFormData.industry} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required placeholder="Enter industry" />
                    </div>
                    <div>
                      <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size <span className="text-red-500">*</span></label>
                      <select name="companySize" id="companySize" value={updateFormData.companySize} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" required>
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                      <input type="url" name="website" id="website" value={updateFormData.website} onChange={handleUpdateInputChange} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" placeholder="https://example.com" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Description</label>
                      <textarea name="description" id="description" rows={4} value={updateFormData.description} onChange={handleUpdateInputChange} className="mt-1 block w-full h-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3" placeholder="Brief description of the company..." />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowUpdateModal(false)} className="px-4 py-2 rounded-3xl font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors">Update</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
