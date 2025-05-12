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
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const [candidateRes, notesRes, logsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/candidates/${id}`),
          axios.get(`http://localhost:5000/api/notes?candidate=${id}`),
          axios.get(`http://localhost:5000/api/logs?candidate=${id}`)
        ]);

        setCandidate(candidateRes.data);
        setNotes(notesRes.data);
        setLogs(logsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch candidate details');
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div key="contact-email" className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{candidate.email}</span>
                  </div>
                  <div key="contact-phone" className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{candidate.phone}</span>
                  </div>
                  <div key="contact-location" className="flex items-center">
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
                  <div key="work-preference" className="flex items-center">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{candidate.workPreference}</span>
                  </div>
                  <div key="availability" className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Available: {new Date(candidate.availability).toLocaleDateString()}
                    </span>
                  </div>
                  <div key="salary" className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Expected Salary: {candidate.expectedSalary}
                    </span>
                  </div>
                  <div key="experience" className="flex items-center">
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
                        key={`skill-${index}-${skill.trim()}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
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
                <div className="space-y-4">
                  {candidate.education ? (
                    Array.isArray(candidate.education) ? (
                      candidate.education.map((edu, index) => (
                        <div key={`edu-${index}`} className="flex items-start">
                          <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{edu.degree}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{edu.institution}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {edu.field && <span>{edu.field} - </span>}
                              {edu.graduationYear || 'Present'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : typeof candidate.education === 'object' ? (
                      <div className="flex items-start">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{candidate.education.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{candidate.education.institution}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {candidate.education.field && <span>{candidate.education.field} - </span>}
                            {candidate.education.graduationYear || 'Present'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">{String(candidate.education)}</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">No education history listed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'notes':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
            <div className="space-y-4">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <div key={`note-${index}`} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">{note.content}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No notes available</p>
              )}
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Logs</h2>
            <div className="space-y-4">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={`log-${index}`} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">{log.action}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No activity logs available</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Candidates
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{candidate.position}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/candidates/${id}/edit`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PencilSquareIcon className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'notes'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'logs'
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Activity Logs
            </button>
          </nav>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
}