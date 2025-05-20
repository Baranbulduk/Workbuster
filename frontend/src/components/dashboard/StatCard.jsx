import React from 'react';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard; 