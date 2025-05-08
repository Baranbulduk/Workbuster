import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Messaging() {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/candidates');
      setCandidates(response.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedContact) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
        recipientId: selectedContact._id
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const startNewChat = (candidate) => {
    setSelectedContact(candidate);
    setMessages([]); // Clear existing messages for new chat
    setShowNewChatModal(false);
    setSearchTerm('');
  };

  const filteredCandidates = candidates.filter(candidate => 
    `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Messaging</h1>
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Contacts Sidebar */}
        <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Candidates</h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="overflow-y-auto h-[calc(100%-8rem)]">
            {candidates.map((candidate) => (
              <div
                key={candidate._id}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedContact?._id === candidate._id ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => setSelectedContact(candidate)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {candidate.position}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {candidate.email}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-800">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {selectedContact ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedContact.position}</p>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select a candidate to start chatting</h2>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === 'You'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedContact ? "Type a message..." : "Select a candidate to start chatting"}
                disabled={!selectedContact}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-11 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedContact}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Start New Chat</h3>
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-4"
              />
              <div className="max-h-60 overflow-y-auto">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg"
                    onClick={() => startNewChat(candidate)}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {candidate.firstName} {candidate.lastName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.position}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setSearchTerm('');
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 