import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@heroicons/react/24/outline";

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "?";
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${firstInitial}${lastInitial}`;
};

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/candidates/${id}`);
        setCandidate(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch candidate details");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || "Candidate not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
              {getInitials(candidate.firstName, candidate.lastName)}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
              {candidate.currentRole}
              </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
                  {candidate.email}
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {candidate.phone}
                </span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {typeof candidate.location === "object"
                    ? `${candidate.location.city}${candidate.location.state ? `, ${candidate.location.state}` : ""}${candidate.location.country ? `, ${candidate.location.country}` : ""}`
                    : candidate.location}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Professional Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {candidate.workPreference}
                </span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Available: {candidate.availability || "Not specified"}
                </div>
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  Expected Salary: {candidate.expectedSalary}
                </span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  Experience: {candidate.experience} years
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Skills, Education, etc. */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills ? (
                (typeof candidate.skills === "string"
                  ? candidate.skills.split(",")
                  : candidate.skills
                ).map((skill, index) => (
                  <span
                    key={`skill-${index}-${skill.trim()}`}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  No skills listed
                </span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Education
            </h2>
            <div className="space-y-4">
              {candidate.education ? (
                Array.isArray(candidate.education) ? (
                  candidate.education.map((edu, index) => (
                    <div key={`edu-${index}`} className="flex items-start">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {edu.degree}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {edu.field && <span>{edu.field} - </span>}
                          {edu.graduationYear || "Present"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : typeof candidate.education === "object" ? (
                  <div className="flex items-start">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {candidate.education.degree}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {candidate.education.institution}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {candidate.education.field && (
                          <span>{candidate.education.field} - </span>
                        )}
                        {candidate.education.graduationYear || "Present"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-gray-600 dark:text-gray-300">
                        {String(candidate.education)}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <span className="text-gray-500 dark:text-gray-400">
                  No education history listed
                </span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Documents
            </h2>
            <div className="space-y-4">
              {candidate.resume && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Resume
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {candidate.resume.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`http://localhost:5000/api/candidates/${candidate._id}/resume`, "_blank")}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                </div>
              )}
              {candidate.coverLetter && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Cover Letter
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {candidate.coverLetter.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`http://localhost:5000/uploads/${candidate.coverLetter}`, "_blank")}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                </div>
              )}
              {!candidate.resume && !candidate.coverLetter && (
                <span className="text-gray-500 dark:text-gray-400">
                  No documents available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
