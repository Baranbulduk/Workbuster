import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { BellIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Notifications() {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications(notifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:5000/api/notifications/read-all');
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
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
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No notifications</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 shadow rounded-lg p-4 ${
                !notification.isRead ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
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
    </div>
  );
} 