import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { FiSearch, FiFilter } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Clients() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({});
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({
    industry: "",
    companySize: "",
    country: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get logged-in client from localStorage
  let loggedClient = null;
  try {
    const clientStr = localStorage.getItem("client");
    if (clientStr) loggedClient = JSON.parse(clientStr);
  } catch {}

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/clients");
      setClients(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  // Dropdown options
  const industryOptions = Array.from(new Set(clients.map(c => c.industry).filter(Boolean)));
  const companySizeOptions = Array.from(new Set(clients.map(c => c.companySize).filter(Boolean)));
  const countryOptions = Array.from(new Set(clients.map(c => {
    if (!c.address) return "";
    if (typeof c.address === "object") return c.address.country || "";
    const parts = c.address.split(",");
    return parts.length > 0 ? parts[parts.length - 1].trim() : "";
  }).filter(Boolean)));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      client.companyName?.toLowerCase().includes(term) ||
      client.contactPerson?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term) ||
      client.website?.toLowerCase().includes(term);
    const matchesIndustry = !filters.industry || client.industry === filters.industry;
    const matchesCompanySize = !filters.companySize || client.companySize === filters.companySize;
    const matchesCountry = !filters.country || (typeof client.address === "object" ? client.address.country : (client.address || "").split(",").pop().trim()) === filters.country;
    return matchesSearch && matchesIndustry && matchesCompanySize && matchesCountry;
  });

  const handleUpdateClick = (client) => {
    setSelectedClient(client);
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
      const url = `http://localhost:5000/api/clients/${selectedClient._id}`;
      const response = await axios.put(url, updateFormData);
      if (response.status === 200) {
        setShowUpdateModal(false);
        setSelectedClient(null);
        fetchClients();
      }
    } catch (error) {
      alert("Failed to update client info. Please try again.");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent w-fit">
          Clients
        </h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:border-gray-700 dark:text-white"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Industries</option>
              {industryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              name="companySize"
              value={filters.companySize}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Company Sizes</option>
              {companySizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <select
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Countries</option>
              {countryOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No clients found matching the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto w-full dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredClients.map((client) => {
                  const isOwnProfile = loggedClient && (client._id === loggedClient._id || client.email === loggedClient.email);
                  return (
                    <tr
                      key={client._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate(`/client/clients/${client._id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                                {client.companyName?.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {client.companyName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {client.website || "No website"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.contactPerson}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.industry}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {client.companySize}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {typeof client.address === "object"
                            ? `${client.address.street || ""}${client.address.city ? `, ${client.address.city}` : ""}${client.address.state ? `, ${client.address.state}` : ""}${client.address.zipCode ? `, ${client.address.zipCode}` : ""}${client.address.country ? `, ${client.address.country}` : ""}`.replace(/^,\s*/, "").replace(/,\s*$/, "") || "No address"
                            : client.address || "No address"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {isOwnProfile && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleUpdateClick(client);
                            }}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
