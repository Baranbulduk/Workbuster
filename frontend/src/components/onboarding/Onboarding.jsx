import React, { useState, useEffect } from 'react';
import { UserGroupIcon, MagnifyingGlassIcon, ChevronDownIcon, CheckCircleIcon, ArrowUpTrayIcon, DocumentTextIcon, Bars3BottomLeftIcon, EnvelopeIcon, HashtagIcon, CurrencyDollarIcon, PencilSquareIcon, ListBulletIcon, HeartIcon, PhotoIcon, PhoneIcon, CalendarIcon, CalculatorIcon, ClockIcon, LinkIcon, ArrowUpOnSquareIcon, UserIcon, AdjustmentsHorizontalIcon, MagnifyingGlassCircleIcon, GlobeAltIcon, Squares2X2Icon, SquaresPlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

const FIELD_TYPES = [
  { type: 'text', label: 'Single Line', icon: DocumentTextIcon },
  { type: 'textarea', label: 'Multi Line', icon: Bars3BottomLeftIcon },
  { type: 'email', label: 'Email ID', icon: EnvelopeIcon },
  { type: 'number', label: 'Number', icon: HashtagIcon },
  { type: 'currency', label: 'Currency', icon: CurrencyDollarIcon },
  { type: 'notes', label: 'Add Notes', icon: PencilSquareIcon },
  { type: 'dropdown', label: 'Dropdown', icon: ListBulletIcon },
  { type: 'blood', label: 'Blood Group', icon: HeartIcon },
  { type: 'image', label: 'Image', icon: PhotoIcon },
  { type: 'phone', label: 'Phone', icon: PhoneIcon },
  { type: 'date', label: 'Date', icon: CalendarIcon },
  { type: 'formula', label: 'Formula', icon: CalculatorIcon },
  { type: 'datetime', label: 'Date - Time', icon: ClockIcon },
  { type: 'url', label: 'Url', icon: LinkIcon },
  { type: 'file', label: 'File upload', icon: ArrowUpOnSquareIcon },
  { type: 'gender', label: 'Gender', icon: UserIcon },
  { type: 'decimal', label: 'Decimal', icon: AdjustmentsHorizontalIcon },
  { type: 'lookup', label: 'Lookup', icon: MagnifyingGlassCircleIcon },
  { type: 'radio', label: 'Radio', icon: Squares2X2Icon },
  { type: 'country', label: 'Country', icon: GlobeAltIcon },
  { type: 'decision', label: 'Decision box', icon: CheckCircleIcon },
  { type: 'multiselect', label: 'Multi-select', icon: SquaresPlusIcon },
];

export default function Onboarding() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    candidateName: '',
    candidatePhoto: null,
    personalMail: '',
    officialMail: '',
    offerLetter: null,
    contactNo: '',
    dateOfJoining: '',
    offerAccepted: false
  });
  const [dynamicFields, setDynamicFields] = useState([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [formTitle, setFormTitle] = useState('Offer Letter Form Details');
  const [editingTitle, setEditingTitle] = useState(false);
  const [fields, setFields] = useState([
    { id: 'candidateName', type: 'text', label: 'Candidate Name', value: '', required: true },
    { id: 'candidatePhoto', type: 'file', label: 'Candidate Photograph', value: null },
    { id: 'personalMail', type: 'email', label: 'Personal Mail ID', value: '', required: true },
    { id: 'officialMail', type: 'email', label: 'Official Mail ID', value: '', required: true },
    { id: 'offerLetter', type: 'file', label: 'Offer Letter', value: null },
    { id: 'contactNo', type: 'text', label: 'Contact no', value: '', required: true },
    { id: 'dateOfJoining', type: 'date', label: 'Date of Joining', value: '', required: true },
    { id: 'offerAccepted', type: 'checkbox', label: 'Offer accepted', value: false },
  ]);
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [labelDraft, setLabelDraft] = useState('');
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      const formattedUsers = response.data.map(emp => ({
        id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        avatar: null,
        arrivedDaysAgo: 0,
        contractStart: emp.hireDate || new Date().toISOString().split('T')[0],
        onboardingStep: 1,
        welcomeSent: emp.hireDate || new Date().toISOString().split('T')[0],
        formCompleted: emp.hireDate || new Date().toISOString().split('T')[0],
        tasks: 0,
        email: emp.email,
        phone: emp.phone,
        position: emp.position,
        department: emp.department,
        address: emp.address,
        status: emp.status
      }));
      setUsers(formattedUsers);
      if (formattedUsers.length > 0) {
        setSelectedUser(formattedUsers[0]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const inProgress = users;
  const toStart = [];

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (e, field) => {
    e.dataTransfer.setData('fieldType', JSON.stringify(field));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const field = JSON.parse(e.dataTransfer.getData('fieldType'));
    setFields(prev => [...prev, { ...field, id: `${field.type}-${Date.now()}`, label: field.label, value: field.type === 'checkbox' ? false : '' }]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    setIsDraggingOver(false);
  };

  // Drag and drop reordering
  const handleDragStartField = (e, id) => {
    setDraggedFieldId(id);
  };

  const handleDragOverField = (e, id) => {
    e.preventDefault();
    if (draggedFieldId === id) return;
    setFields(prev => {
      const draggedIdx = prev.findIndex(f => f.id === draggedFieldId);
      const overIdx = prev.findIndex(f => f.id === id);
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
    setFields(prev => prev.map(f => f.id === id ? { ...f, label: labelDraft } : f));
    setEditingLabelId(null);
  };

  const handleLabelKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleLabelBlur(id);
    }
  };

  // Delete field
  const handleDeleteField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id));
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
    if (e.key === 'Enter') setEditingTitle(false);
  };

  // Field value change
  const handleFieldChange = (e, id) => {
    const { type, value, checked, files } = e.target;
    setFields(prev => prev.map(f =>
      f.id === id
        ? { ...f, value: type === 'checkbox' ? checked : type === 'file' ? files[0] : value }
        : f
    ));
  };

  const handleAddRecipient = () => {
    if (!recipientEmail || !emailRegex.test(recipientEmail)) return;
    setRecipients(prev => [...prev, { name: recipientName, email: recipientEmail }]);
    setRecipientName('');
    setRecipientEmail('');
  };
  const handleBulkAdd = () => {
    const lines = bulkInput.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    const newRecipients = lines.map(line => {
      const [name, email] = line.includes('@') ? [null, line] : [line, null];
      return emailRegex.test(email || name) ? { name: name || '', email: email || name } : null;
    }).filter(Boolean);
    setRecipients(prev => [...prev, ...newRecipients]);
    setBulkInput('');
  };
  const handleRemoveRecipient = idx => {
    setRecipients(prev => prev.filter((_, i) => i !== idx));
  };
  const handleSubmit = e => {
    e.preventDefault();
    // Prepare payload
    const payload = {
      formTitle,
      fields,
      recipients
    };
    console.log('Submitting form:', payload);
    alert('Form submitted! (see console for payload)');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Onboarding</h1>
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
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`px-1 py-4 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`px-1 py-4 border-b-2 font-medium text-sm ${activeTab === 'form' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('form')}
              >
                Form
              </button>
            </nav>
          </div>
          {/* Tab Content */}
          {activeTab === 'overview' ? (
            selectedUser ? (
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
                    <div className="flex flex-col items-end">
                      <button
                        className="mb-2 bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700 transition"
                        onClick={() => navigate(`/employees/${selectedUser.id}`, { state: { fromOnboarding: true } })}
                      >
                        View Profile
                      </button>
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
                <p className="text-gray-500 dark:text-gray-400">Select an employee to view their onboarding details</p>
              </div>
            )
          ) : (
            <div className="flex h-[calc(100vh-10rem)] w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              {/* Add Field Section */}
              <aside className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Field</h3>
                <div className="grid grid-cols-1 gap-2">
                  {FIELD_TYPES.map(field => (
                    <button
                      key={field.label}
                      className="flex items-center gap-2 border rounded px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                      draggable
                      onDragStart={e => handleDragStart(e, field)}
                      type="button"
                    >
                      {field.icon && <field.icon className="h-4 w-4 text-gray-400" />}
                      {field.label}
                    </button>
                  ))}
                </div>
              </aside>
              {/* Form Section */}
              <div
                className={`flex-1 p-8 overflow-y-auto transition-all duration-150 ${isDraggingOver ? 'border-2 border-blue-400 bg-blue-50 dark:bg-blue-900' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="mb-4">
                  {editingTitle ? (
                    <input
                      className="text-xl font-semibold mb-4 text-gray-900 dark:text-white bg-transparent border-b border-blue-400 focus:outline-none"
                      value={formTitle}
                      onChange={handleTitleChange}
                      onBlur={handleTitleBlur}
                      onKeyDown={handleTitleKeyDown}
                      autoFocus
                    />
                  ) : (
                    <h2
                      className="text-xl font-semibold mb-4 text-gray-900 dark:text-white cursor-pointer"
                      onClick={handleTitleClick}
                    >
                      {formTitle}
                      <PencilIcon className="h-5 w-5 inline ml-2 text-gray-400" />
                    </h2>
                  )}
                </div>
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="mb-2 font-semibold text-gray-800 dark:text-white">Send this form to:</div>
                  <div className="flex flex-col md:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Recipient name (optional)"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="mt-1 block w-full md:w-1/3 h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                    />
                    <input
                      type="email"
                      placeholder="Recipient email"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      className="mt-1 block w-full md:w-1/3 h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                    />
                    <button
                      type="button"
                      onClick={handleAddRecipient}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 mb-2">
                    <textarea
                      placeholder="Paste or type multiple emails/names (comma, semicolon, or newline separated)"
                      value={bulkInput}
                      onChange={e => setBulkInput(e.target.value)}
                      className="mt-1 block w-full h-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3"
                    />
                    <button
                      type="button"
                      onClick={handleBulkAdd}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 self-start"
                    >
                      Add Bulk
                    </button>
                  </div>
                  {recipients.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recipients.map((r, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
                          {r.name ? `${r.name} ` : ''}{r.email}
                          <button type="button" className="ml-2 text-red-500 hover:text-red-700" onClick={() => handleRemoveRecipient(idx)} title="Remove">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="col-span-1 group flex items-start gap-2"
                      draggable
                      onDragStart={e => handleDragStartField(e, field.id)}
                      onDragOver={e => handleDragOverField(e, field.id)}
                      onDragEnd={handleDragEndField}
                    >
                      <div className="flex-1">
                        {editingLabelId === field.id ? (
                          <input
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border-b border-blue-400 focus:outline-none"
                            value={labelDraft}
                            onChange={handleLabelChange}
                            onBlur={() => handleLabelBlur(field.id)}
                            onKeyDown={e => handleLabelKeyDown(e, field.id)}
                            autoFocus
                          />
                        ) : (
                          <label
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                            onClick={() => handleLabelClick(field.id, field.label)}
                          >
                            {field.label}
                            <PencilIcon className="h-4 w-4 inline ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                          </label>
                        )}
                        {field.type === 'text' && (
                          <input type="text" value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" />
                        )}
                        {field.type === 'textarea' && (
                          <textarea value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-24 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pt-3" />
                        )}
                        {field.type === 'email' && (
                          <input type="email" value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" />
                        )}
                        {field.type === 'number' && (
                          <input type="number" value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" />
                        )}
                        {field.type === 'currency' && (
                          <input type="text" placeholder="$" value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" />
                        )}
                        {field.type === 'dropdown' && (
                          <select value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3">
                            <option>Option 1</option>
                            <option>Option 2</option>
                          </select>
                        )}
                        {field.type === 'date' && (
                          <input type="date" value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" />
                        )}
                        {field.type === 'datetime' && (
                          <input type="datetime-local" value={field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3" />
                        )}
                        {field.type === 'file' && (
                          <input type="file" onChange={e => handleFieldChange(e, field.id)} className="mt-1 block w-full text-gray-700 dark:text-gray-300" />
                        )}
                        {field.type === 'radio' && (
                          <div className="mt-1"><label><input type="radio" name={field.id} /> Option</label></div>
                        )}
                        {field.type === 'checkbox' || field.type === 'decision' ? (
                          <input type="checkbox" checked={!!field.value} onChange={e => handleFieldChange(e, field.id)} className="mt-1" />
                        ) : null}
                      </div>
                      <button type="button" className="ml-2 mt-2 text-red-500 hover:text-red-700" onClick={() => handleDeleteField(field.id)} title="Delete field">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                  <div className="col-span-2 flex justify-end mt-8">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 