import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Messaging() {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John Doe', content: 'Hello, how can I help you?', timestamp: '10:30 AM', isRead: true },
    { id: 2, sender: 'You', content: 'I need help with the new project', timestamp: '10:32 AM', isRead: true },
    { id: 3, sender: 'John Doe', content: 'Sure, what do you need help with?', timestamp: '10:33 AM', isRead: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState('John Doe');

  const contacts = [
    { id: 1, name: 'John Doe', lastMessage: 'Sure, what do you need help with?', timestamp: '10:33 AM', unread: 0 },
    { id: 2, name: 'Jane Smith', lastMessage: 'The report is ready', timestamp: 'Yesterday', unread: 2 },
    { id: 3, name: 'Mike Johnson', lastMessage: 'Meeting at 2 PM', timestamp: 'Yesterday', unread: 0 },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Contacts Sidebar */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                selectedContact === contact.name ? 'bg-blue-50 dark:bg-blue-900' : ''
              }`}
              onClick={() => setSelectedContact(contact.name)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 dark:text-white">{contact.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{contact.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{contact.lastMessage}</p>
              {contact.unread > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {contact.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedContact}</h2>
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
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white h-11"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 