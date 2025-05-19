import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

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

export default function OnboardingDetails({ item, type }) {
  const navigate = useNavigate();
  const [formsData, setFormsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        // Fetch all forms where this employee/candidate is a recipient
        const response = await axios.get(`http://localhost:5000/api/onboarding/forms-by-recipient/${item.email}`);
        
        if (response.data.success) {
          setFormsData(response.data.forms);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (item && item.email) {
      fetchFormData();
    }
  }, [item]);

  const handleViewProfile = () => {
    navigate(`/${type}/${item._id}`, { state: { fromOnboarding: true } });
  };

  // Calculate form progress stats
  const calculateFormProgress = () => {
    if (formsData.length === 0) return { notStarted: 0, inProgress: 0, completed: 0, totalForms: 0 };
    
    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;
    
    formsData.forEach(form => {
      const recipient = form.recipients.find(r => r.email === item.email);
      if (!recipient) return;
      
      if (!recipient.completedFields) {
        notStarted++;
      } else if (recipient.completedAt) {
        completed++;
      } else {
        inProgress++;
      }
    });
    
    return {
      notStarted,
      inProgress,
      completed,
      totalForms: formsData.length
    };
  };
  
  const progress = calculateFormProgress();
  const progressPercentage = progress.totalForms > 0 
    ? Math.round((progress.completed / progress.totalForms) * 100) 
    : 0;

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

              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{item.email}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <button
              className="mb-2 bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700 transition"
              onClick={handleViewProfile}
            >
              View Profile
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">Start Date</div>
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium mt-1">
              {formatDate(item.hireDate || item.startDate)}
            </div>
          </div>
        </div>
        
        {/* Form Completion Progress */}
        <div className="mt-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">Form Completion Progress</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{progressPercentage}% Complete</span>
            <span>{progress.completed} of {progress.totalForms} forms completed</span>
          </div>
          
          {/* Form Status Breakdown */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <XCircleIcon className="h-6 w-6 mx-auto text-red-500" />
              <p className="mt-1 font-medium">Not Started</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{progress.notStarted}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 text-center">
              <ClockIcon className="h-6 w-6 mx-auto text-yellow-500" />
              <p className="mt-1 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{progress.inProgress}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <CheckCircleIcon className="h-6 w-6 mx-auto text-green-500" />
              <p className="mt-1 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.completed}</p>
            </div>
          </div>
        </div>
        

      </div>

      {/* Forms List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Assigned Forms</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading forms...</p>
          </div>
        ) : formsData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No forms assigned to this person yet.</p>
        ) : (
          <div className="space-y-3">
            {formsData.map((form, index) => {
              const recipient = form.recipients.find(r => r.email === item.email);
              let status = "Not Started";
              let statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
              
              if (recipient && recipient.completedFields) {
                if (recipient.completedAt) {
                  status = "Completed";
                  statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                } else {
                  status = "In Progress";
                  statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                }
              }
              
              // Calculate questions answered
              const totalQuestions = form.fields.length;
              const answeredQuestions = recipient?.completedFields?.length || 0;
              
              return (
                <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">{form.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sent on: {formatDate(form.createdAt)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Questions answered: <span className="font-medium">{answeredQuestions}/{totalQuestions}</span>
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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