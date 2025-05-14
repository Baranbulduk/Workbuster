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
  const [myForms, setMyForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyForms = async () => {
      try {
        setLoading(true);
        // Fetch forms assigned to this employee
        const response = await axios.get(`http://localhost:5000/api/onboarding/my-forms/${item.email}`);
        
        if (response.data.success) {
          setMyForms(response.data.forms);
        }
      } catch (error) {
        console.error('Error fetching my forms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (item && item.email) {
      fetchMyForms();
    }
  }, [item]);

  const handleViewProfile = () => {
    navigate(`/employee/${type}/${item._id}`, { state: { fromOnboarding: true } });
  };

  // Calculate personal progress across all forms
  const calculateProgress = () => {
    if (myForms.length === 0) return {
      completedForms: 0,
      totalForms: 0,
      percentage: 0
    };
    
    let completed = 0;
    
    myForms.forEach(form => {
      const recipient = form.recipients.find(r => r.email === item.email);
      if (recipient && recipient.completedAt) {
        completed++;
      }
    });
    
    return {
      completedForms: completed,
      totalForms: myForms.length,
      percentage: Math.round((completed / myForms.length) * 100)
    };
  };
  
  const progress = calculateProgress();

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
              <div className="text-xl font-semibold text-gray-800 dark:text-white">
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
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">My Onboarding Progress</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{progress.percentage}% Complete</span>
            <span>{progress.completedForms} of {progress.totalForms} forms completed</span>
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
      </div>

      {/* My Forms */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">My Forms</h3>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading your forms...</p>
          </div>
        ) : myForms.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">You don't have any forms assigned yet.</p>
        ) : (
          <div className="space-y-4">
            {myForms.map((form, index) => {
              const recipient = form.recipients.find(r => r.email === item.email);
              let status = "Not Started";
              let statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
              let statusIcon = XCircleIcon;
              
              if (recipient && recipient.completedFields) {
                if (recipient.completedAt) {
                  status = "Completed";
                  statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                  statusIcon = CheckCircleIcon;
                } else {
                  status = "In Progress";
                  statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                  statusIcon = ClockIcon;
                }
              }
              
              // Calculate questions answered
              const totalQuestions = form.fields.length;
              const answeredQuestions = recipient?.completedFields?.length || 0;
              const percentComplete = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
              
              const StatusIcon = statusIcon;
              
              return (
                <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-full p-2 flex-shrink-0 ${statusColor.split(' ')[0]}`}>
                      <StatusIcon className={`h-6 w-6 ${statusColor.split(' ')[1]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800 dark:text-white">{form.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Received on: {formatDate(form.createdAt)}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium">{percentComplete}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${percentComplete}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {answeredQuestions} of {totalQuestions} questions answered
                        </p>
                      </div>
                      
                      {status !== "Completed" && (
                        <a 
                          href={`/employee/onboarding?token=${form.token}&email=${encodeURIComponent(item.email)}`}
                          className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          {status === "Not Started" ? "Start Form" : "Continue Form"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
          Pending Tasks
          <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full">{item.tasks || 0}</span>
        </div>
      </div>
    </div>
  );
} 