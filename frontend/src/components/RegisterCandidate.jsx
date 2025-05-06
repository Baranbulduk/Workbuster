import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function RegisterCandidate() {
  const { isDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [candidates, setCandidates] = useState([]);
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

  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
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

  const validatePersonId = (id) => {
    if (!id) return false;
    
    // Check if it matches the format YYYY-MM-DD-XXXX
    const regex = /^\d{4}-\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(id)) return false;
    
    // Check if it has exactly 12 digits
    const digitCount = id.replace(/\D/g, '').length;
    if (digitCount !== 12) return false;
    
    // Extract parts
    const [year, month, day] = id.split('-').slice(0, 3).map(Number);
    
    // Validate year is not before 1930
    if (year < 1930) return false;
    
    // Validate date
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part to compare only dates
    
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day &&
           date <= today; // Ensure date is not in the future
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Person ID
    if (!validatePersonId(formData.personId)) {
      alert('Person ID must be exactly 12 digits in the format YYYY-MM-DD-XXXX, the year must be 1930 or later, and the date cannot be in the future');
      return;
    }
    
    try {
      console.log('Sending form data:', formData);
      const response = await axios.post('http://localhost:5000/api/candidates', formData);
      setCandidates(prev => [...prev, response.data]);
      setShowForm(false);
      setFormData({
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
    } catch (error) {
      console.error('Error adding candidate:', error);
      console.error('Error details:', error.response?.data);
      alert('Error adding candidate. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Candidates</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Register New Candidate
        </button>
      </div>

      <div className="space-y-4">
        {candidates.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No candidates registered yet.</p>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <div key={candidate._id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg w-full">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 text-lg font-medium">
                            {candidate.firstName[0]}{candidate.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">{candidate.email}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">{candidate.phone}</span>
                      </div>

                      <div className="flex items-center text-sm">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300">
                          {candidate.personId ? candidate.personId.replace(/\d{4}$/, 'XXXX') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={() => setShowForm(false)}></div>
            </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Register New Candidate</h3>
                  <button
                    onClick={() => setShowForm(false)}
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
                          rows={3}
                          className="mt-1 block w-full h-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3"
                          placeholder="Enter education details"
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
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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