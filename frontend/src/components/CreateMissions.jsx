import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function CreateMissions() {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    missionName: '',
    project: '',
    startDate: '',
    endDate: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    description: '',
    deliverables: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Mission</h1>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="missionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mission Name
              </label>
              <input
                type="text"
                name="missionName"
                id="missionName"
                value={formData.missionName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
                placeholder="Enter mission name"
              />
            </div>

            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Project
              </label>
              <select
                name="project"
                id="project"
                value={formData.project}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
              >
                <option value="">Select Project</option>
                <option value="project1">Project 1</option>
                <option value="project2">Project 2</option>
                <option value="project3">Project 3</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
                placeholder="Select start date"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
                placeholder="Select end date"
              />
            </div>

            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assigned To
              </label>
              <select
                name="assignedTo"
                id="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
              >
                <option value="">Select Team Member</option>
                <option value="member1">Team Member 1</option>
                <option value="member2">Team Member 2</option>
                <option value="member3">Team Member 3</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                name="priority"
                id="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-11 pl-3"
                required
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mission Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 pl-3 pt-3"
                placeholder="Describe the mission..."
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deliverables
              </label>
              <textarea
                name="deliverables"
                id="deliverables"
                rows={3}
                value={formData.deliverables}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24 pl-3 pt-3"
                placeholder="List the expected deliverables..."
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Mission
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 