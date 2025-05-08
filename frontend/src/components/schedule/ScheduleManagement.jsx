import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ScheduleManagement() {
  const { isDarkMode } = useTheme();
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    participants: [],
    location: ''
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/schedule');
      setSchedules(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to fetch schedules');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = (schedule) => {
    setSelectedSchedule(schedule);
    setIsUpdating(true);
    setFormData({
      title: schedule.title,
      description: schedule.description,
      startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
      endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
      type: schedule.type,
      participants: schedule.participants,
      location: schedule.location
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/schedule/${id}`);
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      type: 'meeting',
      participants: [],
      location: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isUpdating 
        ? `http://localhost:5000/api/schedule/${selectedSchedule.id}`
        : 'http://localhost:5000/api/schedule';
      
      const method = isUpdating ? 'put' : 'post';
      
      const response = await axios[method](url, formData);

      if (response.status === 201 || response.status === 200) {
        setShowForm(false);
        resetForm();
        setIsUpdating(false);
        setSelectedSchedule(null);
        fetchSchedules();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Schedule Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setIsUpdating(false);
            resetForm();
          }}
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
              key={schedule.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
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
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={() => {
                setShowForm(false);
                setSelectedSchedule(null);
                setIsUpdating(false);
              }}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {isUpdating ? 'Update Schedule' : 'Add New Schedule'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedSchedule(null);
                      setIsUpdating(false);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="presentation">Presentation</option>
                      <option value="interview">Interview</option>
                      <option value="training">Training</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Participants
                    </label>
                    <input
                      type="text"
                      name="participants"
                      value={formData.participants.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        participants: e.target.value.split(',').map(p => p.trim())
                      }))}
                      placeholder="Enter participant names separated by commas"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      {isUpdating ? 'Update Schedule' : 'Add Schedule'}
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