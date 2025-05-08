import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { PlusIcon, XMarkIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function DocumentSharing() {
  const { isDarkMode } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    sharedWith: []
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [filters]);

  const fetchDocuments = async () => {
    try {
      let url = 'http://localhost:5000/api/documents';
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      
      const response = await axios.get(`${url}?${params.toString()}`);
      setDocuments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = (document) => {
    setSelectedDocument(document);
    setIsUpdating(true);
    setFormData({
      title: document.title,
      description: document.description,
      category: document.category,
      sharedWith: document.sharedWith
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documents/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document-${id}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      sharedWith: []
    });
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'sharedWith') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      if (file) {
        formDataToSend.append('file', file);
      }

      const url = isUpdating 
        ? `http://localhost:5000/api/documents/${selectedDocument.id}`
        : 'http://localhost:5000/api/documents';
      
      const method = isUpdating ? 'put' : 'post';
      
      const response = await axios[method](url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 201 || response.status === 200) {
        setShowForm(false);
        resetForm();
        setIsUpdating(false);
        setSelectedDocument(null);
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response) {
        console.error('Server error response:', error.response.data);
        alert(`Error: ${error.response.data.message || 'Failed to submit form. Please check your input and try again.'}`);
      } else if (error.request) {
        alert('No response from server. Please check your connection and try again.');
      } else {
        alert('Error setting up the request. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Document Sharing</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setIsUpdating(false);
            resetForm();
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Document
        </button>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="proposals">Proposals</option>
              <option value="meetings">Meetings</option>
              <option value="reports">Reports</option>
              <option value="contracts">Contracts</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="xlsx">XLSX</option>
              <option value="txt">TXT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search documents..."
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {documents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {document.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {document.description}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Type: {document.type}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Size: {document.size}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Category: {document.category}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Uploaded by: {document.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Shared with: {document.sharedWith.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Uploaded at: {new Date(document.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(document.id)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleUpdate(document)}
                    className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75" onClick={() => {
                setShowForm(false);
                setSelectedDocument(null);
                setIsUpdating(false);
              }}></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {isUpdating ? 'Update Document' : 'Upload New Document'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setSelectedDocument(null);
                      setIsUpdating(false);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isUpdating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        File
                      </label>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        required={!isUpdating}
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          dark:file:bg-blue-900 dark:file:text-blue-300"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      <option value="proposals">Proposals</option>
                      <option value="meetings">Meetings</option>
                      <option value="reports">Reports</option>
                      <option value="contracts">Contracts</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Share with (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="sharedWith"
                      value={formData.sharedWith.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        sharedWith: e.target.value.split(',').map(item => item.trim())
                      }))}
                      placeholder="Enter team names separated by commas"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    >
                      {isUpdating ? 'Update Document' : 'Upload Document'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 