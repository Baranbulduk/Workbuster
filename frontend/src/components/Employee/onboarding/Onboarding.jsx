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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import OnboardingDetails from "./OnboardingDetails";

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
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("candidates");
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
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
      required: true,
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
      required: true,
    },
    {
      id: "officialMail",
      type: "email",
      label: "Official Mail ID",
      value: "",
      required: true,
    },
    { id: "offerLetter", type: "file", label: "Offer Letter", value: null },
    {
      id: "contactNo",
      type: "text",
      label: "Contact no",
      value: "",
      required: true,
    },
    {
      id: "dateOfJoining",
      type: "date",
      label: "Date of Joining",
      value: "",
      required: true,
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
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formToken, setFormToken] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({ success: false, message: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      setFormToken(token);
      fetchFormData(token);
    } else {
      setError("No form token provided. Please use the link from your email.");
      setLoading(false);
    }
  }, [location]);

  const fetchFormData = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/onboarding/form/${token}`);
      
      if (response.data.success) {
        const { title, fields, recipients } = response.data.form;
        setFormTitle(title);
        
        const resetFields = fields.map(field => ({
          ...field,
          value: field.type === "checkbox" ? false : 
                field.type === "file" ? null : 
                field.type === "multiselect" ? [] : ""
        }));
        
        setFields(resetFields);
        
        const emailParam = new URLSearchParams(location.search).get("email");
        if (emailParam) {
          const matchingRecipient = recipients.find(r => r.email === emailParam);
          if (matchingRecipient) {
            setRecipientEmail(emailParam);
          }
        }
        
        setLoading(false);
      } else {
        setError("Failed to fetch form data");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching form:", error);
      setError("Error loading the form. Please try again or contact support.");
      setLoading(false);
    }
  };

  const handleFieldChange = (e, id) => {
    const { type, value, checked, files } = e.target;
    setFields((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              value:
                type === "checkbox"
                  ? checked
                  : type === "file"
                  ? files[0]
                  : type === "multiselect"
                  ? (f.value || []).includes(value)
                    ? (f.value || []).filter((v) => v !== value)
                    : [...(f.value || []), value]
                  : value,
            }
          : f
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const missingFields = fields
      .filter(field => field.required && !field.value)
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      setSubmissionStatus({
        success: false,
        message: `Please fill in the following required fields: ${missingFields.join(', ')}`
      });
      return;
    }
    
    if (!recipientEmail) {
      setSubmissionStatus({
        success: false,
        message: "Please enter your email address to submit the form"
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const completedFields = fields.map(field => ({
        id: field.id,
        label: field.label,
        type: field.type,
        value: field.value
      }));
      
      const response = await axios.post(
        `http://localhost:5000/api/onboarding/submit/${formToken}`, 
        { 
          completedFields,
          recipientEmail
        }
      );
      
      if (response.data.success) {
        setSuccess(true);
        setSubmissionStatus({
          success: true,
          message: "Form submitted successfully! Thank you for completing your onboarding form."
        });
        
        const resetFields = fields.map(field => ({
          ...field,
          value: field.type === "checkbox" ? false : 
                field.type === "file" ? null : 
                field.type === "multiselect" ? [] : ""
        }));
        
        setFields(resetFields);
      } else {
        setSubmissionStatus({
          success: false,
          message: response.data.message || "Failed to submit form"
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmissionStatus({
        success: false,
        message: "Error submitting form. Please try again or contact support."
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading your onboarding form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-red-50 dark:bg-red-900 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h2>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
          <p className="mt-4">
            Please check your link or contact your administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
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
            <div
              className="flex-1 p-8 overflow-y-auto transition-all duration-150"
            >
              <div className="flex justify-between items-center mb-8">
                <h2
                  className="text-xl font-semibold text-gray-900 dark:text-white"
                >
                  {formTitle}
                </h2>
                
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => formRef.current && formRef.current.requestSubmit()}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              
              {submissionStatus.message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submissionStatus.success 
                    ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  <p>{submissionStatus.message}</p>
                </div>
              )}
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="mb-2 font-semibold text-gray-800 dark:text-white">
                  Your Email Address
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="mt-1 block w-full md:w-1/2 h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Please enter the email address where you received the onboarding form link.
                </p>
              </div>
  
              <form
                ref={formRef}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                onSubmit={handleSubmit}
              >
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="col-span-1 group flex items-end gap-2"
                  >
                    <div className="flex-1">
                      <label
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
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
                          {field.value && (
                            <img
                              src={URL.createObjectURL(field.value)}
                              alt="Preview"
                              className="mt-2 h-32 w-32 object-cover rounded"
                            />
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
                          {field.value && (
                            <div className="mt-2 flex items-center gap-2">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {field.value.name}
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
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" 
                          required={field.required}
                        />
                      )}

                      {field.type === "date" && (
                        <input
                          type="date"
                          value={field.value} 
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
                        />
                      )}

                      {field.type === "datetime" && (
                        <input 
                          type="datetime-local"
                          value={field.value} 
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" 
                          required={field.required}
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
                              required={field.required}
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
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" 
                          required={field.required}
                        />
                      )}

                      {field.type === "blood" && (
                        <select
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
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
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" 
                          required={field.required}
                        />
                      )}

                      {field.type === "phone" && (
                        <input
                          type="tel"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter phone number..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
                        />
                      )}

                      {field.type === "gender" && (
                        <select 
                          value={field.value} 
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
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
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" 
                          required={field.required}
                        />
                      )}

                      {field.type === "country" && (
                        <select
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
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
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter text here..."
                          rows={4}
                          className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          value={field.value}
                          onChange={(e) => handleFieldChange(e, field.id)}
                          placeholder="Enter number..."
                          className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                          required={field.required}
                        />
                      )}

                      {field.type === "currency" && (
                        <div className="relative mt-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                            className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-7"
                            required={field.required}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="col-span-1 md:col-span-2 mt-6">
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Form'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
