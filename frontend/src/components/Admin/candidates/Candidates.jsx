import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import {
  PlusIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import path from "path";
import { useNavigate } from "react-router-dom";

export default function RegisterCandidate() {
  const { isDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filters, setFilters] = useState({
    position: "",
    experience: "",
    availability: "",
    workPreference: "",
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    skills: "",
    education: "",
    resume: null,
    coverLetter: null,
    availability: "",
    expectedSalary: "",
    workPreference: "full-time",
    location: "",
    portfolio: "",
    linkedin: "",
    github: "",
    personId: "",
  });
  const navigate = useNavigate();

  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/candidates");
      console.log('Fetched candidates:', response.data);
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
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
    return (
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

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name === "personId") {
      // Remove any non-digit characters
      let cleaned = value.replace(/\D/g, "");

      // Format as YYYY-MM-DD-XXXX
      if (cleaned.length > 8) {
        cleaned = cleaned.slice(0, 8) + "-" + cleaned.slice(8, 12);
      }
      if (cleaned.length > 6) {
        cleaned = cleaned.slice(0, 6) + "-" + cleaned.slice(6);
      }
      if (cleaned.length > 4) {
        cleaned = cleaned.slice(0, 4) + "-" + cleaned.slice(4);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: cleaned,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "file" ? files[0] : value,
      }));
    }
  };

  const validatePersonId = (id) => {
    if (!id) return false;

    // Check if it matches the format YYYY-MM-DD-XXXX
    const regex = /^\d{4}-\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(id)) return false;

    // Check if it has exactly 12 digits
    const digitCount = id.replace(/\D/g, "").length;
    if (digitCount !== 12) return false;

    // Extract parts
    const [year, month, day] = id.split("-").slice(0, 3).map(Number);

    // Validate year is not before 1930
    if (year < 1930) return false;

    // Validate date
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part to compare only dates

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date <= today
    ); // Ensure date is not in the future
  };

  const handleUpdate = (candidate) => {
    setSelectedCandidate(candidate);
    setIsUpdating(true);
    
    // Convert location object to string format for the form
    let locationString = '';
    if (candidate.location) {
      if (typeof candidate.location === 'object') {
        locationString = [
          candidate.location.city || '',
          candidate.location.state || '',
          candidate.location.country || ''
        ].filter(part => part).join(', ');
      } else {
        locationString = candidate.location;
      }
    }
    
    // Convert availability enum to date format for the form
    let availabilityDate = '';
    if (candidate.availability) {
      const today = new Date();
      switch (candidate.availability) {
        case 'immediate':
          availabilityDate = today.toISOString().split('T')[0];
          break;
        case '1-week':
          today.setDate(today.getDate() + 7);
          availabilityDate = today.toISOString().split('T')[0];
          break;
        case '2-weeks':
          today.setDate(today.getDate() + 14);
          availabilityDate = today.toISOString().split('T')[0];
          break;
        case '1-month':
          today.setMonth(today.getMonth() + 1);
          availabilityDate = today.toISOString().split('T')[0];
          break;
        case 'more-than-1-month':
          today.setMonth(today.getMonth() + 2);
          availabilityDate = today.toISOString().split('T')[0];
          break;
        default:
          availabilityDate = today.toISOString().split('T')[0];
      }
    }
    
    // Convert skills array to string if needed
    let skillsString = '';
    if (candidate.skills) {
      if (Array.isArray(candidate.skills)) {
        skillsString = candidate.skills.join(', ');
      } else {
        skillsString = candidate.skills;
      }
    }
    
    // Convert education object to string if needed
    let educationString = '';
    if (candidate.education) {
      if (typeof candidate.education === 'object') {
        educationString = [
          candidate.education.degree || '',
          candidate.education.field || '',
          candidate.education.institution || '',
          candidate.education.graduationYear || ''
        ].filter(part => part).join('\n');
      } else {
        educationString = candidate.education;
      }
    }
    
    setFormData({
      firstName: candidate.firstName || "",
      lastName: candidate.lastName || "",
      email: candidate.email || "",
      phone: candidate.phone || "",
      position: candidate.currentRole || "",
      experience: candidate.experience || "",
      skills: skillsString,
      education: educationString,
      resume: null,
      coverLetter: null,
      availability: availabilityDate,
      expectedSalary: candidate.expectedSalary || "",
      workPreference: candidate.workPreference || "full-time",
      location: locationString,
      portfolio: candidate.portfolio || "",
      linkedin: candidate.linkedin || "",
      github: candidate.github || "",
      personId: candidate.personId || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/candidates/${selectedCandidate._id}`
      );
      setShowDeleteModal(false);
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      experience: "",
      skills: "",
      education: "",
      resume: null,
      coverLetter: null,
      availability: "",
      expectedSalary: "",
      workPreference: "full-time",
      location: "",
      portfolio: "",
      linkedin: "",
      github: "",
      personId: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate person ID before submission
    if (!validatePersonId(formData.personId)) {
      alert(
        "Person ID must be exactly 12 digits in the format YYYY-MM-DD-XXXX, the year must be 1930 or later, and the date cannot be in the future"
      );
      return;
    }

    const formDataToSend = new FormData();

    // Required fields that must be present
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "position",
      "experience",
      "skills",
      "education",
      "availability",
      "expectedSalary",
      "workPreference",
      "location",
      "personId",
    ];

    // Add resume to required fields only for new registrations, not updates
    if (!isUpdating) {
      requiredFields.push("resume");
    }

    // Check if all required fields are present
    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Convert experience to number
    const experience = parseInt(formData.experience, 10);
    if (isNaN(experience)) {
      alert("Experience must be a valid number");
      return;
    }

    // Convert expectedSalary to number
    const expectedSalary = parseInt(formData.expectedSalary, 10);
    if (isNaN(expectedSalary)) {
      alert("Expected salary must be a valid number");
      return;
    }

    // Format location as an object
    const locationParts = formData.location
      .split(",")
      .map((part) => part.trim());
    const location = {
      city: locationParts[0] || "",
      state: locationParts[1] || "",
      country: locationParts[2] || "",
    };

    // Format availability as an enum value
    const availabilityDate = new Date(formData.availability);
    const today = new Date();
    const diffTime = Math.abs(availabilityDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let availability;
    if (diffDays <= 7) {
      availability = "1-week";
    } else if (diffDays <= 14) {
      availability = "2-weeks";
    } else if (diffDays <= 30) {
      availability = "1-month";
    } else {
      availability = "more-than-1-month";
    }

    // Add all form fields to FormData
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        if (key === "experience") {
          formDataToSend.append(key, experience);
        } else if (key === "expectedSalary") {
          formDataToSend.append(key, expectedSalary);
        } else if (key === "location") {
          formDataToSend.append("location[city]", location.city);
          formDataToSend.append("location[state]", location.state);
          formDataToSend.append("location[country]", location.country);
        } else if (key === "availability") {
          formDataToSend.append(key, availability);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    // Log FormData contents
    console.log("FormData contents:");
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const url = isUpdating
        ? `http://localhost:5000/api/candidates/${selectedCandidate._id}`
        : "http://localhost:5000/api/candidates";

      const method = isUpdating ? "put" : "post";

      const response = await axios[method](url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        setShowForm(false);
        resetForm();
        setIsUpdating(false);
        setSelectedCandidate(null);
        fetchCandidates();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        // Log the specific error message from the server
        console.error("Server error response:", error.response.data);
        alert(
          `Error: ${
            error.response.data.message ||
            "Failed to submit form. Please check your input and try again."
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

  const handleExportCSV = () => {
    // Define CSV headers
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Position",
      "Experience",
      "Skills",
      "Education",
      "Availability",
      "Expected Salary",
      "Work Preference",
      "Location",
      "Portfolio",
      "LinkedIn",
      "GitHub",
      "Person ID",
    ];

    // Convert candidates data to CSV format
    const csvData = candidates.map((candidate) => [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone,
      candidate.currentRole || candidate.position || 'No position',
      candidate.experience,
      candidate.skills,
      candidate.education,
      new Date(candidate.availability).toLocaleDateString(),
      candidate.expectedSalary,
      candidate.workPreference,
      typeof candidate.location === "object"
        ? `${candidate.location.city},${candidate.location.state},${candidate.location.country}`
        : candidate.location,
      candidate.portfolio || "",
      candidate.linkedin || "",
      candidate.github || "",
      candidate.personId,
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `candidates_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCV = async (candidate) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/candidates/${candidate._id}/resume`, {
        responseType: 'blob'
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Get the file extension from the content type or default to .pdf
      const contentType = response.headers['content-type'];
      const extension = contentType === 'application/pdf' ? '.pdf' : 
                       contentType === 'application/msword' ? '.doc' :
                       contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? '.docx' : '.pdf';
      
      // Set the download filename
      link.download = `${candidate.firstName}_${candidate.lastName}_CV${extension}`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Error downloading CV. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent w-fit">
          Candidates
        </h1>
        <div className="flex items-center space-x-4">
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <select
              name="position"
              value={filters.position}
              onChange={handleFilterChange}
              className="h-10 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="h-10 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="h-10 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              className="h-10 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Work Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 pl-1 pr-4 py-1 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors duration-300"
          >
            <div className="bg-white rounded-3xl p-2 text-black">
              <ArrowDownTrayIcon className="h-5 w-5 text-black" />
            </div>
            Export CSV
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 pl-1 pr-4 py-1 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors duration-300"
          >
            <div className="bg-white rounded-3xl p-2 text-black">
              <PlusIcon className="h-5 w-5 text-black" />
            </div>
            Register New Candidate
          </button>
        </div>
      </div>

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
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Candidate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Position
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Experience
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Documents
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate) => (
                  <tr
                    key={candidate._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/candidates/${candidate._id}`)}
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
                            ID:{" "}
                            {candidate.personId
                              ? candidate.personId.replace(/\d{4}$/, "XXXX")
                              : "N/A"}
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
                        {candidate.currentRole || 'No position'}
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
                        Available: {candidate.availability || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {typeof candidate.location === "object"
                          ? `${candidate.location.city}${
                              candidate.location.state
                                ? `, ${candidate.location.state}`
                                : ""
                            }${
                              candidate.location.country
                                ? `, ${candidate.location.country}`
                                : ""
                            }`
                          : candidate.location}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Expected: {candidate.expectedSalary}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div
                        className="flex space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {candidate.resume ? (
                          <>
                            <button
                              onClick={() => {
                                const url = `http://localhost:5000/api/candidates/${candidate._id}/resume`;
                                window.open(url, "_blank");
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View CV
                            </button>
                            <button
                              onClick={() => handleDownloadCV(candidate)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Download CV
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">
                            No CV available
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div
                        className="flex space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleUpdate(candidate)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Update
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                      Delete Candidate
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete{" "}
                        {selectedCandidate?.firstName}{" "}
                        {selectedCandidate?.lastName}? This action cannot be
                        undone.
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedCandidate(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration/Update Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"
                onClick={() => {
                  setShowForm(false);
                  setSelectedCandidate(null);
                  setIsUpdating(false);
                }}
              ></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {isUpdating ? "Update Candidate" : "Register New Candidate"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedCandidate(null);
                      setIsUpdating(false);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
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
                          placeholder="Enter first name"
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
                          placeholder="Enter last name"
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
                          placeholder="Enter email address"
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
                          placeholder="Enter phone number"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Person ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="personId"
                          value={formData.personId}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          placeholder="YYYY-MM-DD-XXXX"
                          maxLength={15}
                          pattern="\d{4}-\d{2}-\d{2}-\d{4}"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Professional Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          placeholder="Enter position"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Years of Experience{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter years of experience"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Skills <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          className="mt-1 block w-full h-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3"
                          placeholder="Enter skills separated by commas"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Education and Documents */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Education and Documents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Education <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="education"
                          value={formData.education}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="mt-1 block w-full h-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3"
                          placeholder="Enter education details in the following format:
Degree (e.g., Bachelor's in Computer Science)
Field of Study
Institution Name
Graduation Year"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Resume <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          name="resume"
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          dark:file:bg-blue-900 dark:file:text-blue-400
                          hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Cover Letter
                        </label>
                        <input
                          type="file"
                          name="coverLetter"
                          onChange={handleInputChange}
                          className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          dark:file:bg-blue-900 dark:file:text-blue-400
                          hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Additional Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Availability <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="availability"
                          value={formData.availability}
                          onChange={handleInputChange}
                          required
                          placeholder="Select availability date"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Expected Salary{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="expectedSalary"
                          value={formData.expectedSalary}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter expected salary"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Work Preference{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="workPreference"
                          value={formData.workPreference}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        >
                          <option value="full-time">Full Time</option>
                          <option value="part-time">Part Time</option>
                          <option value="contract">Contract</option>
                          <option value="freelance">Freelance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter location"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Social Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Portfolio URL
                        </label>
                        <input
                          type="url"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleInputChange}
                          placeholder="Enter portfolio URL"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleInputChange}
                          placeholder="Enter LinkedIn profile URL"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          GitHub
                        </label>
                        <input
                          type="url"
                          name="github"
                          value={formData.github}
                          onChange={handleInputChange}
                          placeholder="Enter GitHub profile URL"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-3xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors-"
                    >
                      Register Candidate
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
