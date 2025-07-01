import React, { useState, useEffect, useRef } from "react";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  Bars3BottomLeftIcon,
  EnvelopeIcon,
  HashtagIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  ListBulletIcon,
  HeartIcon,
  PhotoIcon,
  PhoneIcon,
  CalendarIcon,
  CalculatorIcon,
  ClockIcon,
  LinkIcon,
  ArrowUpOnSquareIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassCircleIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  Bars3Icon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { verifyAndRefreshToken, apiCall, handleTokenExpiration } from '../../../utils/tokenManager';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

const FIELD_TYPES = [
  { type: "text", label: "Single Line", icon: DocumentTextIcon },
  { type: "textarea", label: "Multi Line", icon: Bars3BottomLeftIcon },
  { type: "email", label: "Email ID", icon: EnvelopeIcon },
  { type: "number", label: "Number", icon: HashtagIcon },
  { type: "currency", label: "Currency", icon: CurrencyDollarIcon },
  { type: "notes", label: "Add Notes", icon: PencilSquareIcon },
  { type: "dropdown", label: "Dropdown", icon: ListBulletIcon },
  { type: "blood", label: "Blood Group", icon: HeartIcon },
  { type: "image", label: "Image", icon: PhotoIcon },
  { type: "phone", label: "Phone", icon: PhoneIcon },
  { type: "date", label: "Date", icon: CalendarIcon },
  { type: "formula", label: "Formula", icon: CalculatorIcon },
  { type: "datetime", label: "Date - Time", icon: ClockIcon },
  { type: "url", label: "Url", icon: LinkIcon },
  { type: "file", label: "File upload", icon: ArrowUpOnSquareIcon },
  { type: "gender", label: "Gender", icon: UserIcon },
  { type: "decimal", label: "Decimal", icon: AdjustmentsHorizontalIcon },
  { type: "lookup", label: "Lookup", icon: MagnifyingGlassCircleIcon },
  { type: "radio", label: "Radio", icon: Squares2X2Icon },
  { type: "country", label: "Country", icon: GlobeAltIcon },
  { type: "decision", label: "Decision box", icon: CheckCircleIcon },
  { type: "multiselect", label: "Multi-select", icon: SquaresPlusIcon },
];

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    candidateName: "",
    candidatePhoto: null,
    personalMail: "",
    officialMail: "",
    offerLetter: null,
    contactNo: "",
    dateOfJoining: "",
    offerAccepted: false,
  });
  const [dynamicFields, setDynamicFields] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [formTitle, setFormTitle] = useState("Offer Letter Form Details");
  const [editingTitle, setEditingTitle] = useState(false);

  const [fields, setFields] = useState([
    {
      id: "candidateName",
      type: "text",
      label: "Candidate Name",
      value: "",
    },
    {
      id: "candidatePhoto",
      type: "file",
      label: "Candidate Photograph",
      value: null,
    },
    {
      id: "personalMail",
      type: "email",
      label: "Personal Mail ID",
      value: "",
    },
    {
      id: "officialMail",
      type: "email",
      label: "Official Mail ID",
      value: "",
    },
    {
      id: "offerLetter",
      type: "file",
      label: "Offer Letter",
      value: null,
    },
    {
      id: "contactNo",
      type: "text",
      label: "Contact no",
      value: "",
    },
    {
      id: "dateOfJoining",
      type: "date",
      label: "Date of Joining",
      value: "",
    },
    {
      id: "offerAccepted",
      type: "checkbox",
      label: "Offer accepted",
      value: false,
    },
  ]);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [labelDraft, setLabelDraft] = useState("");
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [fieldOptions, setFieldOptions] = useState({});
  const [editingOptions, setEditingOptions] = useState(null);
  const [optionDraft, setOptionDraft] = useState("");
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const genders = ["Male", "Female", "Other", "Prefer not to say"];
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czech Republic",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Korea",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Korea",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe",
  ];
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({
    totalFields: 0,
    completedFields: 0,
    isComplete: false,
  });

  const percentage =
    (completionStatus.completedFields / completionStatus.totalFields) * 100 ||
    0;

  useEffect(() => {
    const employeeToken = localStorage.getItem("employeeToken");
    if (!employeeToken) {
      navigate(
        `/employee/login?token=${token}${email ? `&email=${email}` : ""}`
      );
      return;
    }

    const verifyToken = async () => {
      const { valid, expired } = await verifyAndRefreshToken();
      if (!valid) {
        handleTokenExpiration(navigate, token, email);
      }
    };

    verifyToken();
  }, [token, email, navigate]);

  useEffect(() => {
    if (token) {
      fetchFormData(token);
    } else {
      setError("No form token provided. Please use the link from your email.");
      setLoading(false);
    }
  }, [token]);

  const fetchFormData = async (token) => {
    try {
      setLoading(true);
      const response = await apiCall('get', `/onboarding/form/${token}`);

      if (response.success) {
        const { title, fields, recipients } = response.form;
        setFormTitle(title);

        // Get existing form data from localStorage if available
        const existingFormData = localStorage.getItem(`formData_${token}`);
        const parsedExistingData = existingFormData ? JSON.parse(existingFormData) : {};

        const resetFields = fields.map((field) => {
          // Check if we have existing data for this field
          const existingValue = parsedExistingData[field.id];
          
          return {
            ...field,
            value: existingValue !== undefined 
              ? existingValue 
              : field.type === "checkbox"
              ? false
              : field.type === "file"
              ? null
              : field.type === "multiselect"
              ? []
              : "",
          };
        });

        setFields(resetFields);
        setRecipients(recipients);
        
        // Calculate completion status after setting fields
        const totalFields = resetFields.length;
        const completedFields = resetFields.filter((field) => {
          if (field.type === "checkbox") return false;
          if (field.type === "file" || field.type === "image") {
            // Count as filled if we have a File object OR a filename from localStorage
            return (field.value && typeof field.value !== 'string') || 
                   (typeof field.value === 'string' && field.value.trim() !== '');
          }
          if (field.type === "multiselect") {
            return field.value && field.value.length > 0;
          }
          if (field.type === "number" || field.type === "currency" || field.type === "decimal") {
            return field.value !== "" && field.value !== null && field.value !== undefined && field.value !== 0 && field.value !== "0";
          }
          return field.value !== "" && field.value !== null && field.value !== undefined;
        }).length;

        setCompletionStatus({
          totalFields,
          completedFields,
          isComplete: completedFields === totalFields,
        });
        
        setLoading(false);
      } else {
        setError("Failed to fetch form data");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching form:", error);
      if (error.response?.data?.message === 'Session expired. Please log in again.') {
        handleTokenExpiration(navigate, token, email);
      } else {
        setError("Error loading the form. Please try again or contact support.");
      }
      setLoading(false);
    }
  };

  const handleFieldChange = (e, fieldId) => {
    const { type, value, checked, files } = e.target;

    setFields((prevFields) => {
      const updatedFields = prevFields.map((field) => {
        if (field.id === fieldId) {
          let newValue;

          switch (field.type) {
            case "checkbox":
              newValue = checked;
              break;
            case "file":
            case "image":
              newValue = files[0] || null;
              break;
            case "multiselect":
              newValue = Array.from(
                e.target.selectedOptions,
                (option) => option.value
              );
              break;
            default:
              newValue = value;
          }

          return {
            ...field,
            value: newValue,
          };
        }
        return field;
      });

      // Save form data to localStorage
      const formDataToSave = {};
      updatedFields.forEach((field) => {
        // Don't save File objects to localStorage as they can't be serialized
        if (field.type === "file" || field.type === "image") {
          // For files, we'll save the filename if available
          if (field.value && field.value.name) {
            formDataToSave[field.id] = field.value.name;
          }
        } else {
          formDataToSave[field.id] = field.value;
        }
      });
      localStorage.setItem(`formData_${token}`, JSON.stringify(formDataToSave));

      // Update completion status
      const totalFields = updatedFields.length;
      const completedFields = updatedFields.filter((field) => {
        if (field.type === "checkbox") return false;
        if (field.type === "file" || field.type === "image") {
          // Count as filled if we have a File object OR a filename from localStorage
          return (field.value && typeof field.value !== 'string') || 
                 (typeof field.value === 'string' && field.value.trim() !== '');
        }
        if (field.type === "multiselect") {
          return field.value && field.value.length > 0;
        }
        if (field.type === "number" || field.type === "currency" || field.type === "decimal") {
          return field.value !== "" && field.value !== null && field.value !== undefined && field.value !== 0 && field.value !== "0";
        }
        return field.value !== "" && field.value !== null && field.value !== undefined;
      }).length;

      setCompletionStatus({
        totalFields,
        completedFields,
        isComplete: completedFields === totalFields,
      });
      return updatedFields;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Only include fields that have values
      const completedFields = fields
        .filter((field) => {
          if (field.type === "checkbox") return true;
          if (field.type === "file" || field.type === "image")
            return field.value !== null;
          if (field.type === "multiselect") return field.value.length > 0;
          return field.value !== "";
        })
        .map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          value: field.value,
        }));

      const response = await apiCall('post', `/onboarding/submit/${token}`, {
        completedFields,
        recipientEmail: searchParams.get("email"),
      });

      if (response.success) {
        setSubmissionStatus({
          success: true,
          message: completionStatus.isComplete
            ? "Form submitted successfully! Thank you for completing your onboarding form."
            : "Form partially submitted. You can continue filling out the remaining fields later.",
        });

        if (completionStatus.isComplete) {
          localStorage.removeItem("employeeToken");
          // Clear the saved form data when form is completed
          localStorage.removeItem(`formData_${token}`);

          // Reset form only if all fields are completed
          const resetFields = fields.map((field) => ({
            ...field,
            value:
              field.type === "checkbox"
                ? false
                : field.type === "file"
                ? null
                : field.type === "multiselect"
                ? []
                : "",
          }));
          setFields(resetFields);
        }
      } else {
        setSubmissionStatus({
          success: false,
          message: response.message || "Failed to submit form",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response?.data?.message === 'Session expired. Please log in again.') {
        handleTokenExpiration(navigate, token, email);
      } else {
        setSubmissionStatus({
          success: false,
          message:
            "Error submitting form. Please try again or contact support.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Loading your onboarding form...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200">
            Error
          </h2>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <p className="mt-4">
            Please check your link or contact your administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (
    submissionStatus &&
    submissionStatus.success &&
    completionStatus.isComplete
  ) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-green-50 dark:bg-green-900 p-6 rounded-lg text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto text-green-500 dark:text-green-300" />
          <h2 className="text-2xl font-medium text-green-800 dark:text-green-200 mt-4">
            Form Submitted Successfully
          </h2>
          <p className="mt-2 text-green-700 dark:text-green-300">
            Thank you for completing your onboarding form!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Onboarding
        </h1>
      </div>

      <div className="flex">
        {/* Main Panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="flex h-[calc(100vh-10rem)] w-full mx-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            {/* Form Section */}
            <div className="flex-1 p-8 overflow-y-auto transition-all duration-150">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {formTitle}
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() =>
                      formRef.current && formRef.current.requestSubmit()
                    }
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      percentage < 40
                        ? "bg-red-500"
                        : percentage < 99.99
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400 h-8">
                  {completionStatus.completedFields === 0 ? (
                    <span>
                      <span
                        className="text-red-500 
                      text-2xl font-bold"
                      >
                        0
                      </span>{" "}
                      % Complete
                    </span>
                  ) : (
                    <span>
                      <span
                        className={`text-2xl font-bold ${
                          percentage < 40
                            ? "text-red-500"
                            : percentage < 99.99
                            ? "text-yellow-500"
                            : "text-green-500"
                        }`}
                      >
                        {Math.round(percentage)}
                      </span>{" "}
                      % Complete
                    </span>
                  )}

                  <span>
                    <span className="text-xl font-bold">
                      {completionStatus.completedFields}
                    </span>{" "}
                    of{" "}
                    <span className="text-xl font-bold">
                      {completionStatus.totalFields}
                    </span>{" "}
                    fields filled
                  </span>
                </div>
              </div>

              {submissionStatus && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    submissionStatus.success
                      ? "bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200"
                  }`}
                >
                  <p>{submissionStatus.message}</p>
                </div>
              )}

              <form
                ref={formRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                onSubmit={handleSubmit}
              >
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="col-span-1 group flex items-start gap-2"
                  >
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        {field.label}
                        {field.value !== "" &&
                        field.value !== null &&
                        field.value !== false &&
                        field.value.length !== 0 ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-500" />
                        )}
                      </label>

                      {/* Field Type Specific Inputs */}
                      {field.type === "image" && (
                        <div className="mt-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFieldChange(e, field.id)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {field.value && typeof field.value !== 'string' && (
                            <img
                              src={URL.createObjectURL(field.value)}
                              alt="Preview"
                              className="mt-2 h-32 w-32 object-cover rounded"
                            />
                          )}
                          {field.value && typeof field.value === 'string' && (
                            <div className="mt-2 flex items-center gap-2">
                              <PhotoIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {field.value} (previously uploaded)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {field.type === "file" && (
                        <div className="mt-1">
                          <input
                            type="file"
                            accept={
                              field.id === "offerLetter"
                                ? ".pdf,.doc,.docx"
                                : undefined
                            }
                            onChange={(e) => handleFieldChange(e, field.id)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                          {field.value && typeof field.value !== 'string' && (
                            <div className="mt-2 flex items-center gap-2">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {field.value.name}
                              </span>
                            </div>
                          )}
                          {field.value && typeof field.value === 'string' && (
                            <div className="mt-2 flex items-center gap-2">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {field.value} (previously uploaded)
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {field.type === "email" && (
                        <input
                          type="email"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder={
                            field.id === "personalMail"
                              ? "Enter personal email address..."
                              : field.id === "officialMail"
                              ? "Enter official email address..."
                              : "Enter email address..."
                          }
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "date" && (
                        <input
                          type="date"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "datetime" && (
                        <input
                          type="datetime-local"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "checkbox" && (
                        <div className="mt-1">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => handleFieldChange(e, field.id)}
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              {field.id === "offerAccepted"
                                ? "I accept the offer"
                                : field.label}
                            </span>
                          </label>
                        </div>
                      )}

                      {field.type === "tel" && (
                        <input
                          type="tel"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter contact number..."
                          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "blood" && (
                        <select
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        >
                          <option value="">Select blood group</option>
                          {bloodGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "text" && (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter text here..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "phone" && (
                        <input
                          type="tel"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter phone number..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "gender" && (
                        <select
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        >
                          <option value="">Select gender</option>
                          {genders.map((gender) => (
                            <option key={gender} value={gender}>
                              {gender}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "decimal" && (
                        <input
                          type="number"
                          step="0.01"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter decimal number..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "country" && (
                        <select
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        >
                          <option value="">Select country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "url" && (
                        <input
                          type="url"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter URL..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter text here..."
                          rows={4}
                          className="mt-1 py-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter number..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        />
                      )}

                      {field.type === "currency" && (
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 px-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">
                              $
                            </span>
                          </div>
                          <input
                            type="number"
                            value={field.value}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-7"
                          />
                        </div>
                      )}

                      {field.type === "dropdown" && (
                        <select
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                        >
                          <option value="">Select an option</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "multiselect" && (
                        <div className="mt-2 space-y-2">
                          {field.options?.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                checked={(field.value || []).includes(option)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...(field.value || []), option]
                                    : (field.value || []).filter(
                                        (v) => v !== option
                                      );
                                  setFields((prev) => {
                                    const updated = prev.map((f) =>
                                      f.id === field.id
                                        ? { ...f, value: newValue }
                                        : f
                                    );
                                    
                                    // Save form data to localStorage
                                    const formDataToSave = {};
                                    updated.forEach((field) => {
                                      if (field.type === "file" || field.type === "image") {
                                        if (field.value && field.value.name) {
                                          formDataToSave[field.id] = field.value.name;
                                        }
                                      } else {
                                        formDataToSave[field.id] = field.value;
                                      }
                                    });
                                    localStorage.setItem(`formData_${token}`, JSON.stringify(formDataToSave));
                                    
                                    // Update completion status
                                    const totalFields = updated.length;
                                    const completedFields = updated.filter((field) => {
                                      if (field.type === "checkbox") return false;
                                      if (field.type === "file" || field.type === "image") {
                                        return (field.value && typeof field.value !== 'string') || 
                                               (typeof field.value === 'string' && field.value.trim() !== '');
                                      }
                                      if (field.type === "multiselect") {
                                        return field.value && field.value.length > 0;
                                      }
                                      if (field.type === "number" || field.type === "currency" || field.type === "decimal") {
                                        return field.value !== "" && field.value !== null && field.value !== undefined && field.value !== 0 && field.value !== "0";
                                      }
                                      return field.value !== "" && field.value !== null && field.value !== undefined;
                                    }).length;

                                    setCompletionStatus({
                                      totalFields,
                                      completedFields,
                                      isComplete: completedFields === totalFields,
                                    });
                                    
                                    return updated;
                                  });
                                }}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === "radio" && (
                        <div className="mt-2 space-y-2">
                          {field.options?.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={option}
                                checked={field.value === option}
                                onChange={(e) => handleFieldChange(e, field.id)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === "decision" && (
                        <div className="mt-2 space-y-2">
                          {field.options?.map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={field.id}
                                value={option}
                                checked={field.value === option}
                                onChange={(e) => handleFieldChange(e, field.id)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === "formula" && (
                        <div className="mt-1">
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            placeholder="Enter formula..."
                            className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                          />
                        </div>
                      )}

                      {field.type === "notes" && (
                        <div className="mt-1">
                          <textarea
                            value={field.value}
                            onChange={(e) => handleFieldChange(e, field.id)}
                            placeholder="Add your notes here..."
                            rows={4}
                            className="mt-1 py-2 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                          />
                        </div>
                      )}

                      {field.type === "lookup" && (
                        <div className="mt-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => handleFieldChange(e, field.id)}
                              placeholder="Enter Lookup Value..."
                              className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3"
                            />
                          </div>
                          {field.value && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Selected: {field.value}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
