import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ClientsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    companySize: "",
    website: "",
    description: "",
  });

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/clients/${id}`
        );
        setClient(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch client details");
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`);
      navigate(location.state?.fromOnboarding ? "/onboarding" : "/clients");
    } catch (error) {
      setError("Failed to delete client");
    }
  };

  const handleUpdate = () => {
    // Convert address object to string format for the form
    let addressString = "";
    if (client.address) {
      if (typeof client.address === "object") {
        addressString = [
          client.address.street || "",
          client.address.city || "",
          client.address.state || "",
          client.address.zipCode || "",
          client.address.country || "",
        ]
          .filter((part) => part)
          .join(", ");
      } else {
        addressString = client.address;
      }
    }

    setFormData({
      companyName: client.companyName || "",
      contactPerson: client.contactPerson || "",
      email: client.email || "",
      phone: client.phone || "",
      address: addressString,
      industry: client.industry || "",
      companySize: client.companySize || "",
      website: client.website || "",
      description: client.description || "",
    });
    setShowUpdateForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/clients/${id}`,
        formData
      );
      if (response.status === 200) {
        setShowUpdateForm(false);
        // Refresh client data
        const updatedClient = await axios.get(
          `http://localhost:5000/api/clients/${id}`
        );
        setClient(updatedClient.data);
      }
    } catch (error) {
      console.error("Error updating client:", error);
      if (error.response) {
        alert(
          `Error: ${
            error.response.data.message ||
            "Failed to update client. Please check your input and try again."
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
                        ? `${client.address.street || ""}${
                            client.address.city
                              ? `, ${client.address.city}`
                              : ""
                          }${
                            client.address.state
                              ? `, ${client.address.state}`
                              : ""
                          }${
                            client.address.zipCode
                              ? `, ${client.address.zipCode}`
                              : ""
                          }${
                            client.address.country
                              ? `, ${client.address.country}`
                              : ""
                          }`
                            .replace(/^,\s*/, "")
                            .replace(/,\s*$/, "") || "No address"
                        : client.address || "No address"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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

            {/* Right Column - Additional Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Client not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() =>
            navigate(
              location.state?.fromOnboarding ? "/onboarding" : "/clients"
            )
          }
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to {location.state?.fromOnboarding ? "Onboarding" : "Clients"}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {client.companyName.substring(0, 2).toUpperCase()}
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
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 py-1 pl-1 pr-4 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Delete Client
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete {client.companyName}?
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
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
                    Update Client
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
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={formData.contactPerson}
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
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Company Size <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Update Client
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
}
