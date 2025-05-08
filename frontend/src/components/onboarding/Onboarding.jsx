import React, { useState, useEffect } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, ChevronDownIcon, CheckCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export default function Onboarding() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [importedUsers, setImportedUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidates');
      const formattedUsers = response.data.map(candidate => ({
        id: candidate._id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        avatar: null, // We'll use initials instead
        arrivedDaysAgo: 0,
        contractStart: new Date().toISOString().split('T')[0],
        onboardingStep: 1,
        welcomeSent: new Date().toISOString().split('T')[0],
        formCompleted: new Date().toISOString().split('T')[0],
        tasks: 0,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        experience: candidate.experience,
        skills: candidate.skills,
        education: candidate.education,
        availability: candidate.availability,
        expectedSalary: candidate.expectedSalary,
        workPreference: candidate.workPreference,
        location: candidate.location,
        portfolio: candidate.portfolio,
        linkedin: candidate.linkedin,
        github: candidate.github,
        personId: candidate.personId
      }));
      setUsers(formattedUsers);
      if (formattedUsers.length > 0) {
        setSelectedUser(formattedUsers[0]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => header.trim().replace(/"/g, ''));
        
        const newUsers = rows.slice(1).map((row, index) => {
          const values = row.split(',').map(value => value.trim().replace(/"/g, ''));
          const firstName = values[0];
          const lastName = values[1];
          const user = {
            id: `imported-${index}`,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            avatar: null, // We'll use initials instead
            arrivedDaysAgo: 0,
            contractStart: new Date().toISOString().split('T')[0],
            onboardingStep: 1,
            welcomeSent: new Date().toISOString().split('T')[0],
            formCompleted: new Date().toISOString().split('T')[0],
            tasks: 0,
            email: values[2],
            phone: values[3],
            position: values[4],
            experience: values[5],
            skills: values[6],
            education: values[7],
            availability: values[8],
            expectedSalary: values[9],
            workPreference: values[10],
            location: values[11],
            portfolio: values[12],
            linkedin: values[13],
            github: values[14],
            personId: values[15]
          };
          return user;
        });

        setImportedUsers(newUsers);
        if (newUsers.length > 0) {
          setSelectedUser(newUsers[0]);
        }
      };
      reader.readAsText(file);
    }
  };

  const inProgress = [...users, ...importedUsers];
  const toStart = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Onboarding</h1>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer">
            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
      <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>To Start</span>
              <span className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5">{toStart.length}</span>
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>In Progress</span>
              <span className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-0.5">{inProgress.length}</span>
              <ChevronDownIcon className="h-4 w-4 ml-1 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {inProgress.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer mb-1 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
                    {getInitials(user.firstName, user.lastName)}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Arrived {user.arrivedDaysAgo} days ago</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 px-8 overflow-y-auto">
          {selectedUser ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* User Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-xl font-medium">
                        {getInitials(selectedUser.firstName, selectedUser.lastName)}
                      </span>
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                        {selectedUser.name}
                        <span className="text-gray-400 cursor-pointer" title="User info">?</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Contract Start Date</div>
                    <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium mt-1">
                      {formatDate(selectedUser.contractStart)}
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
                <button className="mt-4 w-full border border-gray-300 dark:border-gray-700 rounded py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition">Interrupt Onboarding Procedure</button>
              </div>

              {/* Welcome Email */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-800 dark:text-white">Welcome Email</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    Sent on:
                    <span className="text-gray-700 dark:text-white font-medium">{formatDate(selectedUser.welcomeSent)}</span>
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
                    <span className="text-gray-700 dark:text-white font-medium">{formatDate(selectedUser.formCompleted)}</span>
                    <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
                  </div>
                </div>
                <a href="#" className="text-blue-600 dark:text-blue-400 underline text-sm">view the form</a>
              </div>

              {/* Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
                  Tasks
                  <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full">{selectedUser.tasks}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">Select a user to view their onboarding details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 