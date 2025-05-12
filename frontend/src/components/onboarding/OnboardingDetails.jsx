import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getInitials(firstName, lastName) {
  if (!firstName || !lastName) return '?';
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export default function OnboardingDetails({ item }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Item Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-xl font-medium">
                {getInitials(item.firstName, item.lastName)}
              </span>
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                {item.name || `${item.firstName} ${item.lastName}`}
                <span className="text-gray-400 cursor-pointer" title="User info">?</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{item.email}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <button
              className="mb-2 bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700 transition"
              onClick={() => navigate(`/${item.type || 'employees'}/${item._id}`, { state: { fromOnboarding: true } })}
            >
              View Profile
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">Start Date</div>
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium mt-1">
              {formatDate(item.hireDate || item.startDate)}
            </div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1 flex items-center">
            <div className="flex-1 h-1 bg-blue-200 dark:bg-blue-900 rounded-full relative">
              <div className="absolute left-0 top-0 h-1 bg-blue-500 dark:bg-blue-400 rounded-full" style={{ width: '33%' }} />
              <div className="absolute left-1/3 top-0 h-1 bg-blue-300 dark:bg-blue-600 rounded-full" style={{ width: '33%' }} />
            </div>
            <div className="flex gap-8 ml-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-blue-700 dark:text-blue-400 font-semibold">Onboarding Started</span>
              <span>Data Completed</span>
              <span>Onboarding Closed</span>
            </div>
          </div>
        </div>
        <button className="mt-4 w-full border border-gray-300 dark:border-gray-700 rounded py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Interrupt Onboarding Procedure
        </button>
      </div>

      {/* Welcome Email */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800 dark:text-white">Welcome Email</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Sent on:
            <span className="text-gray-700 dark:text-white font-medium">{formatDate(item.welcomeSent)}</span>
            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
          </div>
        </div>
      </div>

      {/* Administrative Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800 dark:text-white">Administrative Data Form</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Completed on:
            <span className="text-gray-700 dark:text-white font-medium">{formatDate(item.formCompleted)}</span>
            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
          </div>
        </div>
        <a href="#" className="text-blue-600 dark:text-blue-400 underline text-sm">view the form</a>
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
          Tasks
          <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full">{item.tasks || 0}</span>
        </div>
      </div>
    </div>
  );
} 