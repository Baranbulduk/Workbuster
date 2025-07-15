import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { FiSearch, FiFilter } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Candidates() {
  const { isDarkMode } = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    position: "",
    experience: "",
    availability: "",
    workPreference: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/candidates");
      setCandidates(response.data);
      setError(null);
    } catch (error) {
      setError("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      (candidate.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (candidate.position?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return (
      matchesSearch &&
      (!filters.position ||
        (candidate.currentRole &&
          candidate.currentRole
            .toLowerCase()
            .includes(filters.position.toLowerCase()))) &&
      (!filters.experience ||
        candidate.experience >= parseInt(filters.experience)) &&
      (!filters.availability ||
        candidate.availability === filters.availability) &&
      (!filters.workPreference ||
        candidate.workPreference === filters.workPreference)
    );
  });

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent w-fit">
          Candidates
        </h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search candidates..."
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Positions</option>
              <option value="developer">Developer</option>
              <option value="designer">Designer</option>
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
            </select>
            <select
              name="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Experience</option>
              <option value="0">0+ years</option>
              <option value="2">2+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
            <select
              name="availability"
              value={filters.availability}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Availability</option>
              <option value="immediate">Immediate</option>
              <option value="1-week">1 Week</option>
              <option value="2-weeks">2 Weeks</option>
              <option value="1-month">1 Month</option>
              <option value="more-than-1-month">More than 1 Month</option>
            </select>
            <select
              name="workPreference"
              value={filters.workPreference}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Work Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredCandidates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No candidates found matching the selected filters.
          </p>
        ) : (
          <div className="overflow-x-auto w-full dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate) => (
                <tr
                    key={candidate._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                              {candidate.firstName[0]}
                              {candidate.lastName[0]}
                          </span>
                        </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {candidate.firstName} {candidate.lastName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {candidate.personId ? candidate.personId.replace(/\d{4}$/, "XXXX") : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {candidate.email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {candidate.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {candidate.currentRole || "No position"}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {candidate.workPreference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {candidate.experience} years
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Available: {candidate.availability || "Not specified"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {typeof candidate.location === "object"
                          ? `${candidate.location.city}${candidate.location.state ? `, ${candidate.location.state}` : ""}${candidate.location.country ? `, ${candidate.location.country}` : ""}`
                          : candidate.location}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expected: {candidate.expectedSalary}
                    </div>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {candidate.resume ? (
                        <button
                          onClick={() => {
                            const url = `http://localhost:5000/api/candidates/${candidate._id}/resume`;
                            window.open(url, "_blank");
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View CV
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs">No CV available</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/candidate/candidate/${candidate._id}`)}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
