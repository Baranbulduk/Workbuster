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
  const [projects, setProjects] = useState([]);
  const [missions, setMissions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notes, setNotes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    participants: [],
    location: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const [candidateRes, projectsRes, missionsRes, attendanceRes, notesRes, logsRes, documentsRes, schedulesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/candidates/${id}`),
          axios.get(`http://localhost:5000/api/projects?candidate=${id}`),
          axios.get(`http://localhost:5000/api/missions?candidate=${id}`),
          axios.get(`http://localhost:5000/api/attendance?candidate=${id}`),
          axios.get(`http://localhost:5000/api/notes?candidate=${id}`),
          axios.get(`http://localhost:5000/api/logs?candidate=${id}`),
          axios.get(`http://localhost:5000/api/documents?candidate=${id}`),
          axios.get(`http://localhost:5000/api/schedule?candidate=${id}`)
        ]);

        setCandidate(candidateRes.data);
        setProjects(projectsRes.data);
        setMissions(missionsRes.data);
        setAttendance(attendanceRes.data);
        setNotes(notesRes.data);
        setLogs(logsRes.data);
        setDocuments(documentsRes.data);
        setSchedules(schedulesRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch candidate details');
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [id]);

  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isUpdating 
        ? `http://localhost:5000/api/schedule/${selectedSchedule._id}`
        : 'http://localhost:5000/api/schedule';
      
      const method = isUpdating ? 'put' : 'post';
      
      const response = await axios[method](url, {
        ...scheduleFormData,
        participants: [...scheduleFormData.participants, candidate._id]
      });

      if (response.status === 201 || response.status === 200) {
        setShowScheduleForm(false);
        setScheduleFormData({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          type: 'meeting',
          participants: [],
          location: ''
        });
        setIsUpdating(false);
        setSelectedSchedule(null);
        fetchCandidateData();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Failed to submit form. Please check your input and try again.'}`);
      } else if (error.request) {
        alert('No response from server. Please check your connection and try again.');
      } else {
        alert('Error setting up the request. Please try again.');
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${scheduleId}`);
      setSchedules(schedules.filter(schedule => schedule._id !== scheduleId));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  const handleUpdate = (schedule) => {
    setSelectedSchedule(schedule);
    setIsUpdating(true);
    setScheduleFormData({
      title: schedule.title,
      description: schedule.description,
      startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
      endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
      type: schedule.type,
      participants: schedule.participants,
      location: schedule.location
    });
    setShowScheduleForm(true);
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
                      <p key="degree" className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Degree:</span> {candidate.education.degree}
                      </p>
                      <p key="field" className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Field of Study:</span> {candidate.education.field}
                      </p>
                      <p key="institution" className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Institution:</span> {candidate.education.institution}
                      </p>
                      <p key="graduation" className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Graduation Year:</span> {candidate.education.graduationYear}
                      </p>
                    </div>
                  ) : (
                    <p key="education-text" className="text-gray-600 dark:text-gray-300">{candidate.education}</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Links</h2>
                <div className="space-y-4">
                  {candidate.portfolio && (
                    <div key="portfolio" className="flex items-center">
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
                    <div key="linkedin" className="flex items-center">
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
                    <div key="github" className="flex items-center">
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
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={`project-${project._id}`} className="border dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{project.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Present'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{project.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'missions':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Missions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map((mission) => (
                  <div key={`mission-${mission._id}`} className="border dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{mission.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{mission.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(mission.startDate).toLocaleDateString()} - {mission.endDate ? new Date(mission.endDate).toLocaleDateString() : 'Present'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{mission.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr key="header-row">
                      <th key="date-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th key="checkin-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</th>
                      <th key="checkout-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check Out</th>
                      <th key="status-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th key="hours-header" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {attendance.map((record, index) => (
                      <tr key={`attendance-${record._id || index}-${record.date}`}>
                        <td key={`date-cell-${record._id || index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td key={`checkin-cell-${record._id || index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(record.checkIn).toLocaleTimeString()}
                        </td>
                        <td key={`checkout-cell-${record._id || index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(record.checkOut).toLocaleTimeString()}
                        </td>
                        <td key={`status-cell-${record._id || index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {record.status}
                        </td>
                        <td key={`hours-cell-${record._id || index}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {record.workHours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Logs</h2>
              <div className="space-y-6">
                {/* Notes Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Notes</h3>
                  <div className="space-y-4">
                    {notes.map((note, index) => (
                      <div key={`note-${note._id || index}-${note.createdAt}`} className="border-l-4 border-blue-500 pl-4 py-2">
                        <p className="text-gray-900 dark:text-white">{note.content}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logs Section */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Activity Logs</h3>
                  <div className="space-y-4">
                    {logs.map((log, index) => (
                      <div key={`log-${log._id || index}-${log.timestamp}`} className="border-l-4 border-gray-300 pl-4 py-2">
                        <p className="text-gray-900 dark:text-white">{log.action}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-md font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(`http://localhost:5000/api/documents/${doc._id}/download`)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Download
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h2>
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Schedule
                </button>
              </div>
              <div className="space-y-4">
                {schedules.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No schedules found</p>
                ) : (
                  schedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      className="border dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {schedule.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {schedule.description}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Start: {new Date(schedule.startTime).toLocaleString()}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                End: {new Date(schedule.endTime).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">
                                Type: {schedule.type}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                Location: {schedule.location}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Participants: {schedule.participants.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdate(schedule)}
                            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(schedule._id)}
                            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
          onClick={() => navigate('/candidates')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Candidates
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div key="avatar" className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </span>
            </div>
            <div key="name-info" className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {candidate.firstName} {candidate.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{candidate.position}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              key="contact-button"
              onClick={() => window.open(`mailto:${candidate.email}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Contact
            </button>
            {candidate.resume && (
              <button
                key="resume-button"
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: UserGroupIcon },
            { id: 'projects', label: 'Projects', icon: BriefcaseIcon },
            { id: 'missions', label: 'Missions', icon: ClipboardDocumentListIcon },
            { id: 'attendance', label: 'Attendance', icon: ClockIcon },
            { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
            { id: 'notes', label: 'Notes & Logs', icon: ChatBubbleLeftRightIcon },
            { id: 'documents', label: 'Documents', icon: DocumentDuplicateIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}