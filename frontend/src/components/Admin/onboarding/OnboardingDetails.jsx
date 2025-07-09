import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../utils/axios";

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAddress(address) {
  if (!address) return "N/A";
  if (typeof address === "string") return address;
  const { street, city, zipCode, country } = address;
  return [street, city, zipCode, country].filter(Boolean).join(", ");
}

function getInitials(firstName, lastName) {
  if (!firstName || !lastName) return "?";
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export default function OnboardingDetails({ item, type }) {
  const navigate = useNavigate();
  const [formsData, setFormsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFormId, setExpandedFormId] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        // Fetch all forms where this employee/candidate is a recipient
        const response = await axios.get(
          `http://localhost:5000/api/onboarding/forms-by-recipient/${item.email}`
        );

        if (response.data.success) {
          setFormsData(response.data.forms);
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
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
    if (formsData.length === 0)
      return { notStarted: 0, inProgress: 0, completed: 0, totalForms: 0 };

    let notStarted = 0;
    let inProgress = 0;
    let completed = 0;

    formsData.forEach((form) => {
      const recipient = form.recipients.find((r) => r.email === item.email);
      if (!recipient) return;

      const totalQuestions = form.fields.length;
      const answeredQuestions =
        recipient.completedFields?.filter((field) => {
          if (field.type === "checkbox") {
            return field.value === true;
          }
          if (field.type === "file" || field.type === "image") {
            return (
              (field.value && typeof field.value !== "string") ||
              (typeof field.value === "string" && field.value.trim() !== "")
            );
          }
          if (field.type === "multiselect") {
            return field.value && field.value.length > 0;
          }
          if (
            field.type === "number" ||
            field.type === "currency" ||
            field.type === "decimal"
          ) {
            return (
              field.value !== "" &&
              field.value !== null &&
              field.value !== undefined &&
              field.value !== 0 &&
              field.value !== "0"
            );
          }
          return (
            field.value !== "" &&
            field.value !== null &&
            field.value !== undefined
          );
        }).length || 0;

      if (answeredQuestions === 0) {
        notStarted++;
      } else if (answeredQuestions === totalQuestions) {
        completed++;
      } else {
        inProgress++;
      }
    });

    return {
      notStarted,
      inProgress,
      completed,
      totalForms: formsData.length,
    };
  };

  const progress = calculateFormProgress();
  const progressPercentage =
    progress.totalForms > 0
      ? Math.round((progress.completed / progress.totalForms) * 100)
      : 0;

  const toggleFormDetails = (formId) => {
    setExpandedFormId(expandedFormId === formId ? null : formId);
  };

  return (
    <div className="space-y-6">
      {/* Item Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300 text-xl font-medium">
                {type === "clients"
                  ? item.companyName?.substring(0, 2).toUpperCase()
                  : getInitials(item.firstName, item.lastName)}
              </span>
            </div>
            <div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                {type === "clients"
                  ? item.companyName
                  : item.name || `${item.firstName} ${item.lastName}`}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.email}
              </div>
              {type === "clients" && (
                <>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.phone}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatAddress(item.address)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.industry}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <button
              className="mb-2 px-4 py-2 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors duration-300"
              onClick={handleViewProfile}
            >
              View Profile
            </button>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {type === "clients" ? "Registration Date" : "Start Date"}
            </div>
            <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium mt-1">
              {formatDate(
                type === "clients"
                  ? item.registrationDate
                  : item.hireDate || item.startDate
              )}
            </div>
          </div>
        </div>

        {/* Form Completion Progress */}
        <div className="mt-4">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2">
            Form Completion Progress
          </h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{progressPercentage}% Complete</span>
            <span>
              {progress.completed} of {progress.totalForms} forms completed
            </span>
          </div>

          {/* Form Status Breakdown */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 text-center">
              <XCircleIcon className="h-6 w-6 mx-auto text-red-500" />
              <p className="mt-1 font-medium text-red-500">Not Started</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                {progress.notStarted}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-3 text-center">
              <ClockIcon className="h-6 w-6 mx-auto text-yellow-500" />
              <p className="mt-1 font-medium text-yellow-500">In Progress</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {progress.inProgress}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3 text-center">
              <CheckCircleIcon className="h-6 w-6 mx-auto text-green-500" />
              <p className="mt-1 font-medium text-green-500">Completed</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {progress.completed}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          Assigned Forms
        </h3>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Loading forms...
            </p>
          </div>
        ) : formsData.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No forms assigned to this person yet.
          </p>
        ) : (
          <div className="space-y-3">
            {formsData.map((form, index) => {
              const recipient = form.recipients.find(
                (r) => r.email === item.email
              );
              let status = "Not Started";
              let statusColor =
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

              const totalQuestions = form.fields.length;
              const answeredQuestions =
                recipient?.completedFields?.filter((field) => {
                  if (field.type === "checkbox") {
                    return field.value === true;
                  }
                  if (field.type === "file" || field.type === "image") {
                    return (
                      (field.value && typeof field.value !== "string") ||
                      (typeof field.value === "string" &&
                        field.value.trim() !== "")
                    );
                  }
                  if (field.type === "multiselect") {
                    return field.value && field.value.length > 0;
                  }
                  if (
                    field.type === "number" ||
                    field.type === "currency" ||
                    field.type === "decimal"
                  ) {
                    return (
                      field.value !== "" &&
                      field.value !== null &&
                      field.value !== undefined &&
                      field.value !== 0 &&
                      field.value !== "0"
                    );
                  }
                  return (
                    field.value !== "" &&
                    field.value !== null &&
                    field.value !== undefined
                  );
                }).length || 0;

              if (recipient && recipient.completedFields) {
                if (answeredQuestions === totalQuestions) {
                  status = "Completed";
                  statusColor =
                    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                } else if (answeredQuestions > 0) {
                  status = "In Progress";
                  statusColor =
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                }
              }

              const isExpanded = expandedFormId === form._id;

              return (
                <div
                  key={index}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => toggleFormDetails(form._id)}
                  >
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {form.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sent on: {formatDate(form.createdAt)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Questions answered:{" "}
                        <span className="font-medium">
                          {answeredQuestions}/{totalQuestions}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {status}
                      </span>
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${
                          totalQuestions > 0
                            ? (answeredQuestions / totalQuestions) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* Form Details Dropdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <h5 className="font-medium text-gray-800 dark:text-white mb-3">
                        Form Responses
                      </h5>
                      <div className="space-y-4">
                        {form.fields.map((field, fieldIndex) => {
                          // Find the answer in completedFields by matching the field ID
                          const answer = recipient?.completedFields?.find(
                            (f) => f.id === field.id || f.fieldId === field.id
                          )?.value;

                          // Check if the field has been answered
                          const isAnswered =
                            answer !== undefined &&
                            answer !== null &&
                            answer !== "";

                          // Format the answer based on field type
                          let displayAnswer = answer;
                          if (isAnswered) {
                            switch (field.type) {
                              case "date":
                                displayAnswer = formatDate(answer);
                                break;
                              case "datetime":
                                displayAnswer = new Date(
                                  answer
                                ).toLocaleString();
                                break;
                              case "checkbox":
                                displayAnswer = answer ? "Yes" : "No";
                                break;
                              case "multiselect":
                                displayAnswer = Array.isArray(answer)
                                  ? answer.join(", ")
                                  : answer;
                                break;
                              case "file":
                              case "image":
                                displayAnswer = answer.name || "File uploaded";
                                break;
                              case "currency":
                                displayAnswer = `$${parseFloat(answer).toFixed(
                                  2
                                )}`;
                                break;
                              default:
                                displayAnswer = answer;
                            }
                          }

                          return (
                            <div
                              key={fieldIndex}
                              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                            >
                              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {field.label}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400">
                                {isAnswered
                                  ? displayAnswer
                                  : "Not answered yet"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {recipient?.completedAt && (
                        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                          Completed on: {formatDate(recipient.completedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Welcome Email */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800 dark:text-white">
            Welcome Email
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Sent on:
            <span className="text-gray-700 dark:text-white font-medium">
              {formatDate(item.welcomeSent)}
            </span>
            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
          </div>
        </div>
      </div>

      {/* Administrative Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-gray-800 dark:text-white">
            Administrative Data Form
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            Completed on:
            <span className="text-gray-700 dark:text-white font-medium">
              {formatDate(item.formCompleted)}
            </span>
            <CheckCircleIcon className="h-4 w-4 text-green-500 ml-1" />
          </div>
        </div>
        <a
          href="#"
          className="text-blue-600 dark:text-blue-400 underline text-sm"
        >
          view the form
        </a>
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-white">
          Tasks
          <span className="bg-orange-400 text-white text-xs px-2 py-0.5 rounded-full">
            {item.tasks || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
