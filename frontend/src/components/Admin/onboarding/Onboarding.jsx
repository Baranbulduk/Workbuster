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
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import axios from "../../../utils/axios";
import { adminApiCall, handleAdminTokenExpiration } from "../../../utils/tokenManager";
import { useNavigate } from "react-router-dom";
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
  if (!firstName || !lastName) return "?";
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
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
  const [activeView, setActiveView] = useState("overview");
  const [selectedItemType, setSelectedItemType] = useState(null);
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

  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeProjects: 0,
    openPositions: 0,
    newMessages: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const recipientOptions = [
    ...candidates.map(c => ({ type: 'Candidate', name: `${c.firstName} ${c.lastName}`, email: c.email })),
    ...employees.map(e => ({ type: 'Employee', name: `${e.firstName} ${e.lastName}`, email: e.email })),
    ...clients.map(cl => ({ type: 'Client', name: cl.companyName, email: cl.email })),
  ];

  const [recipientType, setRecipientType] = useState('candidate');

  useEffect(() => {
    fetchData();
    if (activeView === "overview") {
      fetchStats();
      fetchRecentActivity();
      const interval = setInterval(fetchRecentActivity, 15000);
      return () => clearInterval(interval);
    }
    // Fetch all lists for the dropdown
    const fetchAll = async () => {
      try {
        const [candidatesRes, employeesRes, clientsRes] = await Promise.all([
          adminApiCall("GET", "/candidates"),
          adminApiCall("GET", "/employees"),
          adminApiCall("GET", "/clients"),
        ]);
        setCandidates(candidatesRes);
        setEmployees(employeesRes);
        setClients(clientsRes);
      } catch (error) {
        console.error("Error fetching user lists for dropdown:", error);
      }
    };
    fetchAll();
  }, [activeTab, activeView]);

  const fetchData = async () => {
    try {
      switch (activeTab) {
        case "candidates":
          const candidatesResponse = await adminApiCall("GET", "/candidates");
          setCandidates(candidatesResponse);
          break;
        case "employees":
          const employeesResponse = await adminApiCall("GET", "/employees");
          setEmployees(employeesResponse);
          break;
        case "clients":
          const clientsResponse = await adminApiCall("GET", "/clients");
          setClients(clientsResponse);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      if (error.response?.data?.message === "Session expired. Please log in again.") {
        handleAdminTokenExpiration(navigate);
      }
    }
  };

  const fetchStats = async () => {
    try {
      const candidatesResponse = await adminApiCall("GET", "/candidates");
      const totalCandidates = candidatesResponse.length;
      const newMessages = 3;

      setStats({
        openPositions: 8,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (error.response?.data?.message === "Session expired. Please log in again.") {
        handleAdminTokenExpiration(navigate);
      }
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [candidatesRes, employeesRes, clientsRes] = await Promise.all([
        adminApiCall("GET", "/candidates"),
        adminApiCall("GET", "/employees"),
        adminApiCall("GET", "/clients"),
      ]);

      const activities = [];

      candidatesRes.forEach((c) =>
        activities.push({
          type: "Candidate",
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          action: "Added/Updated Candidate",
          time: c.updatedAt || c.createdAt,
        })
      );

      employeesRes.forEach((e) =>
        activities.push({
          type: "Employee",
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          action: "Added/Updated Employee",
          time: e.updatedAt || e.createdAt,
        })
      );

      clientsRes.forEach((cl) =>
        activities.push({
          type: "Client",
          name: cl.companyName,
          email: cl.email,
          action: "Added/Updated Client",
          time: cl.updatedAt || cl.createdAt,
        })
      );

      // Sort by time, descending
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 8)); // Show only the 8 most recent
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      if (error.response?.data?.message === "Session expired. Please log in again.") {
        handleAdminTokenExpiration(navigate);
      }
    }
  };

  const handleImportCSV = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split("\n").filter((row) => row.trim() !== "");
          const headers = rows[0].split(",").map((header) => header.trim());

          const newItems = rows.slice(1).map((row) => {
            const values = row.split(",").map((value) => value.trim());
            const itemData = {};

            headers.forEach((header, index) => {
              itemData[header.toLowerCase().replace(/\s+/g, "")] =
                values[index] || "";
            });

            return {
              firstName: itemData.firstname || itemData.first_name || "",
              lastName: itemData.lastname || itemData.last_name || "",
              email: itemData.email || "",
              phone: itemData.phone || "",
              position: itemData.position || "",
              department: itemData.department || "",
              status: itemData.status || "Active",
              hireDate:
                itemData.hiredate ||
                itemData.hire_date ||
                new Date().toISOString().split("T")[0],
            };
          });

          const response = await adminApiCall("POST", `/${activeTab}/import`, {
            items: newItems,
          });

          if (response.success) {
            // Update only the relevant state based on activeTab
            switch (activeTab) {
              case "candidates":
                setCandidates((prev) => [
                  ...prev,
                  ...response.data.results.success,
                ]);
                break;
              case "employees":
                setEmployees((prev) => [
                  ...prev,
                  ...response.data.results.success,
                ]);
                break;
              case "clients":
                setClients((prev) => [
                  ...prev,
                  ...response.data.results.success,
                ]);
                break;
            }
            alert(
              `Successfully imported ${response.results.success.length} ${activeTab}. ${response.results.failed.length} failed.`
            );
          } else {
            throw new Error(response.message || "Failed to import items");
          }
        } catch (error) {
          console.error("Error importing items:", error);
          alert(`Error importing items: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case "candidates":
        return candidates;
      case "employees":
        return employees;
      case "clients":
        return clients;
      default:
        return [];
    }
  };

  const handleItemClick = (item) => {
    if (selectedItem && selectedItem._id === item._id) {
      setSelectedItem(null);
      setSelectedItemType(null);
    } else {
      setSelectedItem(item);
      setSelectedItemType(activeTab);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, field) => {
    // Set the data being dragged
    const fieldData = {
      type: field.type,
      label: field.label,
      icon: field.icon,
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(fieldData));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    try {
      const fieldData = e.dataTransfer.getData("text/plain");
      const field = JSON.parse(fieldData);

      // Create a new field with a unique ID
      const newField = {
        id: `${field.type}-${Date.now()}`,
        type: field.type,
        label: field.label,
        value: field.type === "checkbox" ? false : "",
        required: false,
      };

      // Add the new field to the fields array
      setFields((prev) => [...prev, newField]);
    } catch (error) {
      console.error("Error adding field:", error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  // Add this new function to handle drag end
  const handleDragEnd = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  // Drag and drop reordering
  const handleDragStartField = (e, id) => {
    setDraggedFieldId(id);
  };

  const handleDragOverField = (e, id) => {
    e.preventDefault();
    if (draggedFieldId === id) return;
    setFields((prev) => {
      const draggedIdx = prev.findIndex((f) => f.id === draggedFieldId);
      const overIdx = prev.findIndex((f) => f.id === id);
      if (draggedIdx === -1 || overIdx === -1) return prev;
      const newFields = [...prev];
      const [dragged] = newFields.splice(draggedIdx, 1);
      newFields.splice(overIdx, 0, dragged);
      return newFields;
    });
  };

  const handleDragEndField = () => {
    setDraggedFieldId(null);
  };

  // Edit label
  const handleLabelClick = (id, label) => {
    setEditingLabelId(id);
    setLabelDraft(label);
  };

  const handleLabelChange = (e) => {
    setLabelDraft(e.target.value);
  };

  const handleLabelBlur = (id) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, label: labelDraft } : f))
    );
    setEditingLabelId(null);
  };

  const handleLabelKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleLabelBlur(id);
    }
  };

  // Delete field
  const handleDeleteField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Edit form title
  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  const handleTitleChange = (e) => {
    setFormTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") setEditingTitle(false);
  };

  // Field value change
  const handleFieldChange = (e, id) => {
    const { type, value, checked, files } = e.target;
    setFields((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              value:
                (type === "checkbox" || f.type === "decision")
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

  const handleAddRecipient = () => {
    if (!recipientEmail || !emailRegex.test(recipientEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    setRecipients((prev) => [
      ...prev,
      { name: recipientName, email: recipientEmail, type: recipientType },
    ]);
    setRecipientName("");
    setRecipientEmail("");
    setRecipientType('candidate');
  };

  const handleBulkAdd = () => {
    const lines = bulkInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newRecipients = lines
      .map((line) => {
        const [name, email] = line.includes("@") ? [null, line] : [line, null];
        return emailRegex.test(email || name)
          ? { name: name || "", email: email || name, type: recipientType }
          : null;
      })
      .filter(Boolean);

    if (newRecipients.length === 0) {
      alert("No valid email addresses found in the input");
      return;
    }

    setRecipients((prev) => [...prev, ...newRecipients]);
    setBulkInput("");
  };

  const handleRemoveRecipient = (idx) => {
    setRecipients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate recipients
    if (recipients.length === 0) {
      return;
    }

    try {
      // Prepare payload
      const payload = {
        formTitle,
        fields: fields.map((field) => ({
          ...field,
          options: fieldOptions[field.id] || field.options,
        })),
        recipients,
      };

      // Send to backend
      const response = await adminApiCall("POST", "/onboarding/send-form", payload);

      if (response.success) {
        // Reset form state
        const resetFields = fields.map((field) => ({
          ...field,
          value:
            (field.type === "checkbox" || field.type === "decision")
              ? false
              : field.type === "file"
              ? null
              : field.type === "multiselect"
              ? []
              : "",
        }));

        setFields(resetFields);
        setRecipients([]);
        setFieldOptions({});
        alert("Form submitted successfully!");
      } else {
        throw new Error(response.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error submitting form: ${error.message}`);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await adminApiCall("GET", "/onboarding/export/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `onboarding_candidates_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting candidates:", error);
      alert("Failed to export candidates");
    }
  };

  const handleViewProfile = (item) => {
    switch (activeTab) {
      case "employees":
        navigate(`/employees/${item._id}`, { state: { fromOnboarding: true } });
        break;
      case "clients":
        navigate(`/clients/${item._id}`, { state: { fromOnboarding: true } });
        break;
      case "candidates":
        navigate(`/candidates/${item._id}`, {
          state: { fromOnboarding: true },
        });
        break;
    }
  };

  const handleAddOption = (fieldId) => {
    if (!optionDraft.trim()) return;
    setFieldOptions((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), optionDraft.trim()],
    }));
    setOptionDraft("");
  };

  const handleRemoveOption = (fieldId, optionIndex) => {
    setFieldOptions((prev) => ({
      ...prev,
      [fieldId]: prev[fieldId].filter((_, idx) => idx !== optionIndex),
    }));
  };

  const handleEditOptions = (fieldId) => {
    setEditingOptions(fieldId);
    setOptionDraft("");
  };

  const handleSaveOptions = (fieldId) => {
    setEditingOptions(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent">
          Onboarding
        </h1>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 pl-4 pr-1 py-1 text-white rounded-3xl w-full font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors duration-300"
            type="button"
            onClick={() => document.getElementById("csv-upload").click()}
          >
            Import CSV
            <div className="bg-white rounded-3xl p-2 text-black">
              <ArrowUpTrayIcon className="h-5 w-5" />
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </button>
        </div>
      </div>
      <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
        {/* Left Panel */}
        <aside className="w-80 bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-gray-900 flex flex-col">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-transparent">
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "candidates"
                  ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("candidates")}
            >
              Candidates
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "employees"
                  ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("employees")}
            >
              Employees
            </button>
            <button
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                activeTab === "clients"
                  ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("clients")}
            >
              Clients
            </button>
          </div>

          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800/50 dark:backdrop-blur-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {getCurrentItems()
              .filter((item) => {
                const searchTerm = search.toLowerCase();
                return (
                  item.name?.toLowerCase().includes(searchTerm) ||
                  item.email?.toLowerCase().includes(searchTerm) ||
                  item.firstName?.toLowerCase().includes(searchTerm) ||
                  item.lastName?.toLowerCase().includes(searchTerm)
                );
              })
              .map((item) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer mb-1 transition-colors ${
                    selectedItem?._id === item._id
                      ? "bg-red-100 dark:bg-red-900"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-300 text-sm font-medium">
                      {activeTab === "clients"
                        ? item.companyName?.substring(0, 2).toUpperCase()
                        : getInitials(item.firstName, item.lastName)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 dark:text-white">
                      {activeTab === "clients"
                        ? item.companyName
                        : item.name || `${item.firstName} ${item.lastName}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.email}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </aside>
        {/* Main Panel */}
        <main className="flex-1 pl-8 overflow-y-auto">
          {selectedItem ? (
            <OnboardingDetails item={selectedItem} type={selectedItemType} />
          ) : (
            <div className="flex flex-col h-[calc(100vh-10rem)] w-full mx-auto bg-white dark:bg-gray-900/50 dark:backdrop-blur-sm rounded-lg shadow border border-gray-200 dark:border-gray-900">
              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-200 dark:border-transparent">
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeView === "overview"
                      ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveView("overview")}
                >
                  Overview
                </button>
                <button
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeView === "form"
                      ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                  onClick={() => setActiveView("form")}
                >
                  Form
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto">
                {activeView === "overview" ? (
                  <div className="p-6 space-y-6">
                    {/* Recent Activity */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Recent Logs
                      </h2>
                      <div className="mt-4">
                        {recentActivity.length === 0 ? (
                          <div className="text-gray-500 dark:text-gray-400">
                            No recent activity.
                          </div>
                        ) : (
                          recentActivity.map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => {
                                switch (activity.type) {
                                  case "Candidate":
                                    navigate(`/candidates/${activity._id}`, {
                                      state: { fromOnboarding: true },
                                    });
                                    break;
                                  case "Employee":
                                    navigate(`/employees/${activity._id}`, {
                                      state: { fromOnboarding: true },
                                    });
                                    break;
                                  case "Client":
                                    navigate(`/clients/${activity._id}`, {
                                      state: { fromOnboarding: true },
                                    });
                                    break;
                                }
                              }}
                            >
                              <div className="flex-shrink-0">
                                <div
                                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    activity.type === "Candidate"
                                      ? "bg-red-100 dark:bg-red-900"
                                      : activity.type === "Employee"
                                      ? "bg-green-100 dark:bg-green-900"
                                      : "bg-yellow-100 dark:bg-yellow-900"
                                  }`}
                                >
                                  <span
                                    className={`font-medium ${
                                      activity.type === "Candidate"
                                        ? "text-red-600 dark:text-red-400"
                                        : activity.type === "Employee"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-yellow-600 dark:text-yellow-400"
                                    }`}
                                  >
                                    {activity.type[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {activity.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {activity.action}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(activity.time).toLocaleString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full">
                    {/* Add Field Section */}
                    <aside className="w-1/3 border-r dark:border-gray-700 p-8 flex flex-col h-full bg-gray-100 dark:bg-gray-700 rounded-l-[5px]">
                      <h2 className="text-lg font-semibold mt-2 mb-10 text-gray-900 dark:text-white">
                        Add Field
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {FIELD_TYPES.map((field) => (
                          <div
                            key={field.label}
                            className="flex items-center gap-2 rounded px-4 py-4 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-move hover:bg-gray-200 dark:hover:bg-gray-600 transition group"
                            draggable
                            onDragStart={(e) => handleDragStart(e, field)}
                          >
                            <div className="flex items-center justify-center w-6 h-6 text-gray-400">
                              <Bars3Icon className="h-6 w-6" />
                            </div>
                            <div className="flex items-center justify-center w-8 h-8">
                              {field.icon && (
                                <field.icon className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                              )}
                            </div>
                            <span className="font-semibold">{field.label}</span>
                          </div>
                        ))}
                      </div>
                    </aside>
                    {/* Form Section */}
                    <div
                      className="flex-1 p-8 overflow-y-auto"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex justify-between items-center mb-8">
                        {editingTitle ? (
                          <input
                            className="text-xl font-semibold  text-gray-900 dark:text-white bg-transparent border-b border-blue-400 focus:outline-none"
                            value={formTitle}
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            autoFocus
                          />
                        ) : (
                          <h2
                            className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer"
                            onClick={handleTitleClick}
                          >
                            {formTitle}
                            <PencilIcon className="h-5 w-5 inline ml-2 text-gray-400" />
                          </h2>
                        )}
                        <button
                          type="button"
                          className="gap-2 px-4 py-2 text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors duration-300"
                          onClick={() =>
                            formRef.current && formRef.current.requestSubmit()
                          }
                        >
                          Submit
                        </button>
                      </div>
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                        <div className="mb-2 font-semibold text-gray-800 dark:text-white">
                          Send this form to:
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 mb-2 items-start">
                          <select
                            value={recipientType}
                            onChange={e => setRecipientType(e.target.value)}
                            className="mt-1 block w-full md:w-1/6 h-11 rounded-md bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 pl-3"
                          >
                            <option value="candidate">Candidate</option>
                            <option value="employee">Employee</option>
                            <option value="client">Client</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Recipient name (optional)"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="mt-1 block w-full md:w-1/3 h-11 rounded-md bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 pl-3"
                          />
                          <input
                            type="email"
                            placeholder="Recipient email"
                            value={recipientEmail}
                            onChange={e => setRecipientEmail(e.target.value)}
                            className="mt-1 block w-full md:w-1/3 h-11 rounded-md bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-700 pl-3"
                            autoComplete="off"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setRecipients(prev => [...prev, { name: recipientName, email: recipientEmail, type: recipientType }]);
                              setRecipientName('');
                              setRecipientEmail('');
                              setRecipientType('candidate');
                            }}
                            className="gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 mb-2 items-start">
                          <textarea
                            placeholder="Paste or type multiple emails/names (comma, semicolon, or newline separated)"
                            value={bulkInput}
                            onChange={(e) => setBulkInput(e.target.value)}
                            className="mt-1 block w-full md:w-2/3 h-24 rounded-md bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-700  pl-3 pt-3"
                          />
                          <button
                            type="button"
                            onClick={handleBulkAdd}
                            className="px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400"
                          >
                            Add Bulk
                          </button>
                        </div>
                        {recipients.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {recipients.map((r, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm"
                              >
                                {r.name ? `${r.name} ` : ""}
                                {r.email}
                                <button
                                  type="button"
                                  className="ml-2 text-red-500 hover:text-red-700 "
                                  onClick={() => handleRemoveRecipient(idx)}
                                  title="Remove"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <form
                        ref={formRef}
                        className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg transition-colors ${
                          isDraggingOver
                            ? "bg-red-50 dark:bg-red-900 border-2 border-red-500"
                            : ""
                        }`}
                        onSubmit={handleSubmit}
                      >
                        {fields.map((field, idx) => (
                          <div
                            key={field.id}
                            className="col-span-1 group flex items-end gap-2"
                            draggable
                            onDragStart={(e) =>
                              handleDragStartField(e, field.id)
                            }
                            onDragOver={(e) => handleDragOverField(e, field.id)}
                            onDragEnd={handleDragEndField}
                          >
                            <div className="flex items-center justify-center w-8 h-11 text-gray-400 cursor-move">
                              <Bars3Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              {editingLabelId === field.id ? (
                                <input
                                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border-b border-blue-400 focus:outline-none"
                                  value={labelDraft}
                                  onChange={handleLabelChange}
                                  onBlur={() => handleLabelBlur(field.id)}
                                  onKeyDown={(e) =>
                                    handleLabelKeyDown(e, field.id)
                                  }
                                  autoFocus
                                />
                              ) : (
                                <button
                                  type="button"
                                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                                  onClick={() =>
                                    handleLabelClick(field.id, field.label)
                                  }
                                >
                                  {field.label}
                                  <PencilIcon className="h-4 w-4 inline ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                                </button>
                              )}

                              {/* Field Type Specific Inputs */}
                              {field.type === "image" && (
                                <div className="mt-1">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleFieldChange(e, field.id)
                                    }
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-not-allowed opacity-50"
                                    disabled
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
                                    onChange={(e) =>
                                      handleFieldChange(e, field.id)
                                    }
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-not-allowed opacity-50"
                                    disabled
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
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder={
                                    field.id === "personalMail"
                                      ? "Enter personal email address..."
                                      : field.id === "officialMail"
                                      ? "Enter official email address..."
                                      : "Enter email address..."
                                  }
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "date" && (
                                <input
                                  type="date"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "datetime" && (
                                <input
                                  type="datetime-local"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {(field.type === "checkbox" || field.type === "decision") && (!fieldOptions[field.id] || fieldOptions[field.id].length === 0) && (
                                <div className="mt-1">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={(e) => handleFieldChange(e, field.id)}
                                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                      disabled
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                      {field.label}
                                    </span>
                                  </label>
                                </div>
                              )}

                              {field.type === "tel" && (
                                <input
                                  type="tel"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter contact number..."
                                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "blood" && (
                                <select
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                >
                                  <option value="">Select blood group</option>
                                  {bloodGroups.map((group) => (
                                    <option key={group} value={group}>
                                      {group}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {field.type === "dropdown" && (
                                <div className="mt-1">
                                  {editingOptions === field.id ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={optionDraft}
                                          onChange={(e) =>
                                            setOptionDraft(e.target.value)
                                          }
                                          placeholder="Add new option..."
                                          className="flex-1 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                        />
                                        <button
                                          onClick={() =>
                                            handleAddOption(field.id)
                                          }
                                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          Add
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                              disabled
                                            >
                                              {option}
                                              <button
                                                onClick={() =>
                                                  handleRemoveOption(
                                                    field.id,
                                                    idx
                                                  )
                                                }
                                                className="ml-2 text-red-500 hover:text-red-700"
                                              >
                                                <XMarkIcon className="h-4 w-4" />
                                              </button>
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleSaveOptions(field.id)
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        Done
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <select
                                        value={field.value}
                                        onChange={(e) => {
                                          // Prevent selection change
                                          e.preventDefault();
                                          return false;
                                        }}
                                        className="block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 cursor-not-allowed opacity-60"
                                        style={{ pointerEvents: "auto" }}
                                      >
                                        <option value="">Select an option</option>
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <option key={idx} value={option}>
                                              {option}
                                            </option>
                                          )
                                        )}
                                      </select>
                                      <button
                                        onClick={() =>
                                          handleEditOptions(field.id)
                                        }
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        Edit Options
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {field.type === "text" && (
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter text here..."
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "phone" && (
                                <input
                                  type="tel"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter phone number..."
                                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "formula" && (
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter formula..."
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "gender" && (
                                <select
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
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
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter decimal number..."
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "country" && (
                                <select
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                >
                                  <option value="">Select country</option>
                                  {countries.map((country) => (
                                    <option key={country} value={country}>
                                      {country}
                                    </option>
                                  ))}
                                </select>
                              )}

                              {field.type === "multiselect" && (
                                <div className="mt-1">
                                  {editingOptions === field.id ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={optionDraft}
                                          onChange={(e) =>
                                            setOptionDraft(e.target.value)
                                          }
                                          placeholder="Add new option..."
                                          className="flex-1 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                          onKeyDown={(e) => {
                                            if (
                                              e.key === "Enter" &&
                                              optionDraft.trim()
                                            ) {
                                              handleAddOption(field.id);
                                            }
                                          }}
                                        />
                                        <button
                                          onClick={() =>
                                            handleAddOption(field.id)
                                          }
                                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          Add
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                            >
                                              {option}
                                              <button
                                                onClick={() =>
                                                  handleRemoveOption(
                                                    field.id,
                                                    idx
                                                  )
                                                }
                                                className="ml-2 text-red-500 hover:text-red-700"
                                              >
                                                <XMarkIcon className="h-4 w-4" />
                                              </button>
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleSaveOptions(field.id)
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        Done
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <label
                                              key={idx}
                                              className="flex items-center gap-2"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={(
                                                  field.value || []
                                                ).includes(option)}
                                                onChange={(e) => {
                                                  const newValue = e.target
                                                    .checked
                                                    ? [
                                                        ...(field.value || []),
                                                        option,
                                                      ]
                                                    : (
                                                        field.value || []
                                                      ).filter(
                                                        (v) => v !== option
                                                      );
                                                  setFields((prev) =>
                                                    prev.map((f) =>
                                                      f.id === field.id
                                                        ? {
                                                            ...f,
                                                            value: newValue,
                                                          }
                                                        : f
                                                    )
                                                  );
                                                }}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                disabled
                                              />
                                              <span className="text-gray-700 dark:text-gray-300">
                                                {option}
                                              </span>
                                            </label>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleEditOptions(field.id)
                                        }
                                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        Edit Options
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {field.type === "lookup" && (
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter lookup value..."
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "notes" && (
                                <textarea
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Add notes..."
                                  rows={4}
                                  className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "url" && (
                                <input
                                  type="url"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter URL..."
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "radio" && (
                                <div className="mt-1 space-y-2">
                                  {editingOptions === field.id ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={optionDraft}
                                          onChange={(e) =>
                                            setOptionDraft(e.target.value)
                                          }
                                          placeholder="Add new option..."
                                          className="flex-1 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                        />
                                        <button
                                          onClick={() =>
                                            handleAddOption(field.id)
                                          }
                                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          Add
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                            >
                                              {option}
                                              <button
                                                onClick={() =>
                                                  handleRemoveOption(
                                                    field.id,
                                                    idx
                                                  )
                                                }
                                                className="ml-2 text-red-500 hover:text-red-700"
                                              >
                                                <XMarkIcon className="h-4 w-4" />
                                              </button>
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleSaveOptions(field.id)
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        Done
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <label
                                              key={idx}
                                              className="flex items-center gap-2"
                                            >
                                              <input
                                                type="radio"
                                                name={field.id}
                                                value={option}
                                                checked={field.value === option}
                                                onChange={(e) =>
                                                  handleFieldChange(e, field.id)
                                                }
                                                className="text-blue-600 focus:ring-blue-500"
                                                disabled
                                              />
                                              <span>{option}</span>
                                            </label>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleEditOptions(field.id)
                                        }
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        Edit Options
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {field.type === "decision" && (
                                <div className="mt-1 space-y-2">
                                  {editingOptions === field.id ? (
                                    <div className="space-y-2">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={optionDraft}
                                          onChange={(e) =>
                                            setOptionDraft(e.target.value)
                                          }
                                          placeholder="Add new option..."
                                          className="flex-1 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                        />
                                        <button
                                          onClick={() =>
                                            handleAddOption(field.id)
                                          }
                                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          Add
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded"
                                            >
                                              {option}
                                              <button
                                                onClick={() =>
                                                  handleRemoveOption(
                                                    field.id,
                                                    idx
                                                  )
                                                }
                                                className="ml-2 text-red-500 hover:text-red-700"
                                              >
                                                <XMarkIcon className="h-4 w-4" />
                                              </button>
                                            </span>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleSaveOptions(field.id)
                                        }
                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                      >
                                        Done
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="space-y-2">
                                        {(fieldOptions[field.id] || []).map(
                                          (option, idx) => (
                                            <label
                                              key={idx}
                                              className="flex items-center gap-2"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={field.value === option}
                                                onChange={(e) =>
                                                  handleFieldChange(e, field.id)
                                                }
                                                className="text-blue-600 focus:ring-blue-500"
                                                disabled
                                              />
                                              <span>{option}</span>
                                            </label>
                                          )
                                        )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleEditOptions(field.id)
                                        }
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                      >
                                        Edit Options
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}

                              {field.type === "textarea" && (
                                <textarea
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter text here..."
                                  rows={4}
                                  className="mt-1 block w-full rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
                                />
                              )}

                              {field.type === "number" && (
                                <input
                                  type="number"
                                  value={field.value}
                                  onChange={(e) =>
                                    handleFieldChange(e, field.id)
                                  }
                                  placeholder="Enter number..."
                                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                                  disabled
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
                                    onChange={(e) =>
                                      handleFieldChange(e, field.id)
                                    }
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-7"
                                    disabled
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleDeleteField(field.id)}
                                className="inline-flex items-center px-2.5 py-1.5 border w-11 h-11 border-transparent text-xs font-medium rounded text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
