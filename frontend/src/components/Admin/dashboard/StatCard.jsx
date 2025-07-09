import React from "react";

const StatCard = ({ title, value, icon, type }) => {
  const getBackgroundColor = (type) => {
    switch (type) {
      case "Candidate":
        return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300";
      case "Employee":
        return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
      case "Client":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex h-12 w-12">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${getBackgroundColor(
              type
            )}`}
          >
            {icon}
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
