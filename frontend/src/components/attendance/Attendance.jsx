import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Attendance() {
  const { isDarkMode } = useTheme();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'present',
    workHours: '',
    notes: ''
  });

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      let url = 'http://localhost:5000/api/attendance';
      if (dateRange.startDate && dateRange.endDate) {
        url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      }
      const response = await axios.get(url);
      setAttendanceRecords(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setError('Failed to fetch attendance records');
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

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = (record) => {
    setSelectedRecord(record);
    setIsUpdating(true);
    setFormData({
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      workHours: record.workHours,
      notes: record.notes
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/attendance/${id}`);
      setAttendanceRecords(attendanceRecords.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting attendance record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'present',
      workHours: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isUpdating 
        ? `http://localhost:5000/api/attendance/${selectedRecord.id}`
        : 'http://localhost:5000/api/attendance';
      
      const method = isUpdating ? 'put' : 'post';
      
      const response = await axios[method](url, formData);

      if (response.status === 201 || response.status === 200) {
        setShowForm(false);
        resetForm();
        setIsUpdating(false);
        setSelectedRecord(null);
        fetchAttendanceRecords();
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Attendance Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setIsUpdating(false);
            resetForm();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Record
        </button>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchAttendanceRecords}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {attendanceRecords.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No attendance records found</p>
        ) : (
          attendanceRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {record.employeeName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Employee ID: {record.employeeId}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Date: {new Date(record.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Check In: {record.checkIn}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Check Out: {record.checkOut}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Status: {record.status}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Work Hours: {record.workHours}
                      </p>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notes: {record.notes}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdate(record)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
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
                setSelectedRecord(null);
                setIsUpdating(false);
              }}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {isUpdating ? 'Update Attendance Record' : 'Add New Attendance Record'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedRecord(null);
                      setIsUpdating(false);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Check In
                      </label>
                      <input
                        type="time"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Check Out
                      </label>
                      <input
                        type="time"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Work Hours
                      </label>
                      <input
                        type="text"
                        name="workHours"
                        value={formData.workHours}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      {isUpdating ? 'Update Record' : 'Add Record'}
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