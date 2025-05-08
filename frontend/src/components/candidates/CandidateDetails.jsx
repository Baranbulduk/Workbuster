import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  LinkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidateDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/candidates/${id}`);
        setCandidate(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch candidate details');
        setLoading(false);
      }
    };

    fetchCandidateDetails();
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
        <p className="text-red-500 mb-4">{error || 'Candidate not found'}</p>
        <button
          onClick={() => navigate('/candidates')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Candidates
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{candidate.position}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => window.open(`mailto:${candidate.email}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Contact
            </button>
            {candidate.resume && (
              <button
                onClick={() => window.open(`http://localhost:5000/api/candidates/${candidate._id}/resume`)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                View Resume
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contact & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.email}</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  {typeof candidate.location === 'object'
                    ? `${candidate.location.city}${candidate.location.state ? `, ${candidate.location.state}` : ''}${candidate.location.country ? `, ${candidate.location.country}` : ''}`
                    : candidate.location}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">{candidate.workPreference}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-600 dark:text-gray-300">
                  Available: {new Date(candidate.availability).toLocaleDateString()}
                </span>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {candidate.skills ? (
                (typeof candidate.skills === 'string' ? candidate.skills.split(',') : candidate.skills).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400">No skills listed</span>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
            <div className="prose dark:prose-invert max-w-none">
              {typeof candidate.education === 'object' ? (
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Degree:</span> {candidate.education.degree}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Field of Study:</span> {candidate.education.field}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Institution:</span> {candidate.education.institution}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Graduation Year:</span> {candidate.education.graduationYear}
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">{candidate.education}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Links</h2>
            <div className="space-y-4">
              {candidate.portfolio && (
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Portfolio
                  </a>
                </div>
              )}
              {candidate.linkedin && (
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={candidate.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
              {candidate.github && (
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <a
                    href={candidate.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 