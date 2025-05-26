import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import path from 'path';
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
  TrashIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// Helper function to get initials from name
const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?';
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${firstInitial}${lastInitial}`;
};

export default function CandidateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    skills: '',
    education: '',
    resume: null,
    coverLetter: null,
    availability: '',
    expectedSalary: '',
    workPreference: 'full-time',
    location: '',
    portfolio: '',
    linkedin: '',
    github: '',
    personId: '',
  });

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

  const handleBack = () => {
    if (location.state?.fromOnboarding) {
      navigate('/onboarding');
    } else {
      navigate('/candidates');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await axios.delete(`http://localhost:5000/api/candidates/${id}`);
        navigate(location.state?.fromOnboarding ? '/onboarding' : '/candidates');
      } catch (error) {
        setError('Failed to delete candidate');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (name === 'personId') {
      // Remove any non-digit characters
      let cleaned = value.replace(/\D/g, '');
      
      // Format as YYYY-MM-DD-XXXX
      if (cleaned.length > 8) {
        cleaned = cleaned.slice(0, 8) + '-' + cleaned.slice(8, 12);
      }
      if (cleaned.length > 6) {
        cleaned = cleaned.slice(0, 6) + '-' + cleaned.slice(6);
      }
      if (cleaned.length > 4) {
        cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'file' ? files[0] : value
      }));
    }
  };

  const handleUpdate = () => {
    setFormData({
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      position: candidate.position || '',
      experience: candidate.experience || '',
      skills: candidate.skills || '',
      education: candidate.education || '',
      resume: null,
      coverLetter: null,
      availability: candidate.availability || '',
      expectedSalary: candidate.expectedSalary || '',
      workPreference: candidate.workPreference || 'full-time',
      location: candidate.location || '',
      portfolio: candidate.portfolio || '',
      linkedin: candidate.linkedin || '',
      github: candidate.github || '',
      personId: candidate.personId || '',
    });
    setShowUpdateForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Required fields that must be present
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'position',
      'experience',
      'skills',
      'education',
      'availability',
      'expectedSalary',
      'workPreference',
      'location',
      'personId'
    ];

    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      return !value || (typeof value === 'string' && value.trim() === '');
    });

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Convert experience to number
    const experience = parseInt(formData.experience, 10);
    if (isNaN(experience)) {
      alert('Experience must be a valid number');
      return;
    }

    // Convert expectedSalary to number
    const expectedSalary = parseInt(formData.expectedSalary, 10);
    if (isNaN(expectedSalary)) {
      alert('Expected salary must be a valid number');
      return;
    }

    // Format location as an object
    const locationParts = formData.location.split(',').map(part => part.trim());
    const location = {
      city: locationParts[0] || '',
      state: locationParts[1] || '',
      country: locationParts[2] || ''
    };

    // Format availability as an enum value
    const availabilityDate = new Date(formData.availability);
    const today = new Date();
    const diffTime = Math.abs(availabilityDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let availability;
    if (diffDays <= 7) {
      availability = '1-week';
    } else if (diffDays <= 14) {
      availability = '2-weeks';
    } else if (diffDays <= 30) {
      availability = '1-month';
    } else {
      availability = 'more-than-1-month';
    }

    // Add all form fields to FormData
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        if (key === 'experience') {
          formDataToSend.append(key, experience);
        } else if (key === 'expectedSalary') {
          formDataToSend.append(key, expectedSalary);
        } else if (key === 'location') {
          formDataToSend.append('location[city]', location.city);
          formDataToSend.append('location[state]', location.state);
          formDataToSend.append('location[country]', location.country);
        } else if (key === 'availability') {
          formDataToSend.append(key, availability);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    });

    try {
      const response = await axios.put(`http://localhost:5000/api/candidates/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setShowUpdateForm(false);
        // Refresh candidate data
        const updatedCandidate = await axios.get(`http://localhost:5000/api/candidates/${id}`);
        setCandidate(updatedCandidate.data);
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Failed to update candidate. Please check your input and try again.'}`);
      } else if (error.request) {
        alert('No response from server. Please check your connection and try again.');
      } else {
        alert('Error setting up the request. Please try again.');
      }
    }
  };

  const handleViewCV = () => {
    if (candidate.resume) {
      const resumeUrl = `http://localhost:5000/api/candidates/${id}/resume`;
      window.open(resumeUrl, '_blank');
    }
  };

  const handleDownloadCV = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/candidates/${id}/resume`, {
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
          onClick={handleBack}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to {location.state?.fromOnboarding ? 'Onboarding' : 'Candidates'}
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
      case 'documents':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
            <div className="space-y-4">
              {candidate.documents?.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <DocumentIcon className="h-6 w-6 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(doc.url, '_blank')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application History</h2>
            <div className="text-gray-600 dark:text-gray-300">No application history available.</div>
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
          Back to {location.state?.fromOnboarding ? 'Onboarding' : 'Candidates'}
        </button>
        <div className="flex items-center justify-between">
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
              <p className="text-lg text-gray-600 dark:text-gray-400">{candidate.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {candidate.resume && (
              <>
                <button
                  onClick={handleViewCV}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <DocumentIcon className="h-5 w-5 mr-2" />
                  View CV
                </button>
                <button
                  onClick={handleDownloadCV}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <DocumentIcon className="h-5 w-5 mr-2" />
                  Download CV
                </button>
              </>
            )}
            <button
              onClick={handleUpdate}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PencilSquareIcon className="h-5 w-5 mr-2" />
              Update
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
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
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'documents'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Main Content */}
      {renderTabContent()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
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
                        Are you sure you want to delete {candidate?.firstName} {candidate?.lastName}? This action cannot be undone.
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
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={() => setShowUpdateForm(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Update Candidate
                  </h3>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h2>
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Professional Information</h2>
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
                          Years of Experience <span className="text-red-500">*</span>
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Education and Documents</h2>
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
                          placeholder="Enter education details"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Resume
                        </label>
                        <input
                          type="file"
                          name="resume"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Letter</label>
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Additional Information</h2>
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
                          Expected Salary <span className="text-red-500">*</span>
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
                          Work Preference <span className="text-red-500">*</span>
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
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Social Links</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio URL</label>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</label>
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
                      onClick={() => setShowUpdateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Update Candidate
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