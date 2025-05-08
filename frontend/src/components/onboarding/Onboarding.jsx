import React, { useState } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, ChevronDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const mockUsers = [
  {
    id: 1,
    name: 'Pichou Olivier',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    arrivedDaysAgo: 108,
    contractStart: '2021-04-05',
    onboardingStep: 1,
    welcomeSent: '2016-12-16',
    formCompleted: '2016-12-16',
    tasks: 3,
  },
  {
    id: 2,
    name: 'Curtis Katie',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    arrivedDaysAgo: 101,
    contractStart: '2021-04-12',
    onboardingStep: 1,
    welcomeSent: '2016-12-16',
    formCompleted: '2016-12-16',
    tasks: 2,
  },
  {
    id: 3,
    name: 'Bianco Juan',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    arrivedDaysAgo: 101,
    contractStart: '2021-04-12',
    onboardingStep: 1,
    welcomeSent: '2016-12-16',
    formCompleted: '2016-12-16',
    tasks: 1,
  },
  {
    id: 4,
    name: 'Marceau Anaïs',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    arrivedDaysAgo: 94,
    contractStart: '2021-04-19',
    onboardingStep: 1,
    welcomeSent: '2016-12-16',
    formCompleted: '2016-12-16',
    tasks: 0,
  },
  {
    id: 5,
    name: 'Pascal Gregory',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    arrivedDaysAgo: 94,
    contractStart: '2021-04-19',
    onboardingStep: 1,
    welcomeSent: '2016-12-16',
    formCompleted: '2016-12-16',
    tasks: 0,
  },
  {
    id: 6,
    name: 'Camus Pierre',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    arrivedDaysAgo: 80,
    contractStart: '2021-05-03',
    onboardingStep: 1,
    welcomeSent: '2016-12-16',
    formCompleted: '2016-12-16',
    tasks: 0,
  },
];

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Onboarding() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const inProgress = mockUsers;
  const toStart = [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Onboarding</h1>
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
                className={`flex items-center gap-3 p-2 rounded cursor-pointer mb-1 transition-colors ${selectedUser.id === user.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                onClick={() => setSelectedUser(user)}
              >
                <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow" />
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
          <div className="max-w-3xl mx-auto space-y-6">
            {/* User Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="h-16 w-16 rounded-full object-cover border-2 border-white shadow" />
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
              {/* List of tasks can go here */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 