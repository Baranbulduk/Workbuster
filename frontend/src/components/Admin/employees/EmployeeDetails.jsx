import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  UserGroupIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOnboarding = location.state?.fromOnboarding;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    address: {
      street: '',
      zipCode: '',
      city: '',
      country: ''
    },
    hireDate: ''
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/employees/${id}`);
        setEmployee(res.data);
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError('Failed to fetch employee details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      navigate(fromOnboarding ? '/onboarding' : '/employees');
    } catch (err) {
      setError('Failed to delete employee.');
    }
  };

  const handleUpdate = () => {
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      department: employee.department || '',
      address: {
        street: employee.address?.street || '',
        zipCode: employee.address?.zipCode || '',
        city: employee.address?.city || '',
        country: employee.address?.country || ''
      },
      hireDate: employee.hireDate || ''
    });
    setShowUpdateForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:5000/api/employees/${id}`, formData);
      if (response.status === 200) {
        setShowUpdateForm(false);
        // Refresh employee data
        const updatedEmployee = await axios.get(`http://localhost:5000/api/employees/${id}`);
        setEmployee(updatedEmployee.data);
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || 'Failed to update employee. Please check your input and try again.'}`);
      } else if (error.request) {
        alert('No response from server. Please check your connection and try again.');
      } else {
        alert('Error setting up the request. Please try again.');
      }
    }
  };

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
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{employee.email}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{employee.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {employee.address?.street}, {employee.address?.zipCode}, {employee.address?.city}, {employee.address?.country}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment Details</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{employee.department}</span>
                  </div>
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">{employee.position}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Hired: {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Column - Additional Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h2>
                <div className="text-gray-600 dark:text-gray-300">No notes available.</div>
              </div>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h2>
            <div className="text-gray-600 dark:text-gray-300">No documents available.</div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment History</h2>
            <div className="text-gray-600 dark:text-gray-300">No history available.</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!employee) return <div className="p-6">Employee not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(fromOnboarding ? '/onboarding' : '/employees', { replace: true })}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          {fromOnboarding ? 'Back to Onboarding' : 'Back to Employees'}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
                {employee.firstName?.[0]}{employee.lastName?.[0]}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{employee.position}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
                      Delete Employee
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete {employee.firstName} {employee.lastName}? This action cannot be undone.
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
                    Update Employee
                  </h3>
                  <button
                    onClick={() => setShowUpdateForm(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
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
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hire Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="hireDate"
                        value={formData.hireDate}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      />
                    </div>
                  </div>

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
                      Update Employee
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
};

export default EmployeeDetails; 