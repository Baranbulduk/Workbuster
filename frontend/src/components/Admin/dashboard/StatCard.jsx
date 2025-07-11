import React from "react";

const StatCard = ({ title, value, type }) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col items-center justify-center gap-2">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${getBackgroundColor(
              type
            )}`}
          >
            <div className="text-2xl font-semibold">
              {value}
            </div>
          </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
