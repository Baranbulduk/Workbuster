import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import { useTheme } from '../../../context/ThemeContext';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import { ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const Employees = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    experience: ''
  });
  const [importedEmployees, setImportedEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    street: '',
    postalCode: '',
    city: '',
    country: ''
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [onboardingProgress, setOnboardingProgress] = useState({});

  useEffect(() => {
    fetchEmployees();
    // Set up polling for real-time updates
    const interval = setInterval(fetchOnboardingProgress, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOnboardingProgress = async () => {
    try {
      // Get progress for each employee
      const progressPromises = employees.map(async (employee) => {
        try {
          const response = await axios.get(`http://localhost:5000/api/onboarding/forms-by-recipient/${employee.email}`);
          
          if (response.data.success) {
            const formsData = response.data.forms;
            let notStarted = 0;
            let inProgress = 0;
            let completed = 0;
            
            formsData.forEach(form => {
              const recipient = form.recipients.find(r => r.email === employee.email);
              if (!recipient) {
                notStarted++;
              } else if (recipient.completedAt) {
                completed++;
              } else if (recipient.completedFields) {
                inProgress++;
              } else {
                notStarted++;
              }
            });
            
            const totalForms = formsData.length || 0;
            const progress = totalForms > 0 ? Math.round((completed / totalForms) * 100) : 0;
            
            let status = 'Not Started';
            if (progress === 100) {
              status = 'Complete';
            } else if (progress > 0) {
              status = 'In Progress';
            }

            return {
              employeeId: employee._id,
              status,
              progress,
              completed,
              totalForms,
              notStarted,
              inProgress
            };
          }
          return null;
          
          
        } catch (error) {
          console.error(`Error fetching progress for employee ${employee.email}:`, error);
          return null;
        }
      });

      const progressResults = await Promise.all(progressPromises);
      
      // Update the progress state with new data
      setOnboardingProgress(prev => {
        const newProgress = { ...prev };
        progressResults.forEach((progress, index) => {
          if (progress) {
            newProgress[employees[index]._id] = progress;
          }
        });
        return newProgress;
      });
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/employees');
      
      // Process employee data
      const processedEmployees = response.data.map(employee => ({
        ...employee,
        name: employee.name || `${employee.firstName} ${employee.lastName}`,
        fullName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
        employeeId: employee.employeeId || `EM${String(employee._id).slice(-4)}`,
        status: employee.status || 'active',
        department: employee.department || 'IT',
        position: employee.position || 'Employee',
        hireDate: employee.hireDate || employee.createdAt,
        forms: employee.forms || []
      }));
      
      setEmployees(processedEmployees);
    
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employees.length > 0) {
      fetchOnboardingProgress();
    }
  }, [employees]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const allEmployees = [...employees, ...importedEmployees];

  const filteredEmployees = allEmployees.filter(employee => {
    const matchesSearch =
      (employee.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = !filters.status || employee.status === filters.status;
    const matchesDepartment = !filters.department || employee.department === filters.department;
    const matchesExperience = !filters.experience || employee.experience >= parseInt(filters.experience);
    return matchesSearch && matchesStatus && matchesDepartment && matchesExperience;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await axios.delete(`/employees/${id}`);
        // Remove from both employees and importedEmployees arrays
        setEmployees(prev => prev.filter(emp => emp._id !== id));
        setImportedEmployees(prev => prev.filter(emp => emp._id !== id));
        
        // Show success message with details
        const message = 'Employee deleted successfully';
        if (response.data.deletedFromEmployee && response.data.deletedFromUser) {
          setSuccessMsg(`${message} (deleted from both Employee and User records)`);
        } else if (response.data.deletedFromEmployee) {
          setSuccessMsg(`${message} (deleted from Employee records)`);
        } else if (response.data.deletedFromUser) {
          setSuccessMsg(`${message} (deleted from User records)`);
        } else {
          setSuccessMsg(message);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/login');
          return;
        }
        console.error('Error deleting employee:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to delete employee');
      }
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Full Name', 'Position', 'E-Mail', 'Hiring Lead', 'Department', 'Status'
    ];
    const csvData = [...employees, ...importedEmployees].map(emp => [
      emp.employeeId || emp._id || '',
      emp.name || emp.fullName || '-',
      emp.position || '-',
      emp.email || '-',
      emp.hiringLead || 'Sammy Stone',
      emp.department || '-',
      emp.status || '-'
    ]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const newEmployees = rows.slice(1).filter(Boolean).map((row, idx) => {
          const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
          return {
            employeeId: values[0] || `imported-${idx}`,
            name: values[1] || '-',
            position: values[2] || '-',
            email: values[3] || '-',
            hiringLead: values[4] || 'Sammy Stone',
            department: values[5] || '-',
            status: values[6] || 'active',
            _id: `imported-${idx}`
          };
        });
        setImportedEmployees(newEmployees);
      };
      reader.readAsText(file);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    console.log(formData.street);
    setSuccessMsg('');
    setErrorMsg('');

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'position'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setErrorMsg(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const res = await axios.post('/employees', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department || 'IT',
        role: 'employee',
        status: 'Active',
        address: {
          street: formData.street,
          zipCode: formData.postalCode,
          city: formData.city,
          country: formData.country
        }
      });

      setSuccessMsg('Employee created successfully! Credentials have been sent via email.');
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        street: '',
        postalCode: '',
        city: '',
        country: ''
      });
      fetchEmployees();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      setErrorMsg(err.response?.data?.message || 'Failed to create employee. Please try again.');
      console.log('Server message:', err.response?.data?.message);
      console.error('Error creating employee:', err);
    }
  };

  const updateOnboardingStatus = async (employeeId, updates) => {
    try {
      const response = await axios.put(`/onboarding/${employeeId}/status`, updates);
      
      // Update local state with the new employee data
      setEmployees(prev => prev.map(emp => 
        emp._id === employeeId ? { ...emp, ...response.data } : emp
      ));
      
      // Recalculate progress for the updated employee
      const updatedEmployee = response.data;
      setOnboardingProgress(prev => ({
        ...prev,
        [employeeId]: calculateOnboardingProgress(updatedEmployee)
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return false;
    }
  };

  const handleOnboardingUpdate = (employeeId, formData) => {
    setEmployees(prev => prev.map(emp => {
      if (emp._id === employeeId) {
        const updatedEmployee = {
          ...emp,
          forms: emp.forms ? [...emp.forms, formData] : [formData]
        };
        return updatedEmployee;
      }
      return emp;
    }));
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Employees</h1>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer">
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus /> Add New Employee
          </button>
        </div>
      </div>
      {successMsg && <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{errorMsg}</div>}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:border-gray-700 dark:text-white"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>

            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              name="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Experience</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Employee</h2>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleFormChange}
                      className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
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
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">ID #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Full name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">E-Mail</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Hiring Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Documents</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Onboarding Workflow</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredEmployees.map((employee, idx) => (
                <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{employee.employeeId || employee._id?.slice(-4) || idx + 1}</td>
                  <td className="px-4 py-4 whitespace-nowrap flex items-center gap-3">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={employee.avatar || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23CBD5E0'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"}
                      alt={employee.name || employee.fullName || 'Employee'}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {employee.firstName && employee.lastName 
                          ? `${employee.firstName} ${employee.lastName}`
                          : employee.name || employee.fullName || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{employee.position || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{employee.email || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      onClick={() => navigate(`/employees/${employee._id}`)}
                    >
                      View more
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-[120px] max-w-[180px]">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{onboardingProgress[employee._id]?.status || 'Not Started'}</span>
                          <span>{onboardingProgress[employee._id]?.progress || 0}%</span>
                        </div>
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div 
                            className={`absolute left-0 top-0 h-2 rounded-full transition-all duration-300 ease-in-out ${
                              onboardingProgress[employee._id]?.progress === 100 
                                ? 'bg-green-500' 
                                : onboardingProgress[employee._id]?.progress > 0 
                                  ? 'bg-blue-500' 
                                  : 'bg-gray-400'
                            }`} 
                            style={{ 
                              width: `${onboardingProgress[employee._id]?.progress || 0}%`,
                              transition: 'width 0.3s ease-in-out'
                            }} 
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {onboardingProgress[employee._id]?.completed || 0} of {onboardingProgress[employee._id]?.totalForms || 0} forms completed
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/employees/${employee._id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FiEdit2 className="inline-block" />
                    </button>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FiTrash2 className="inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees; 