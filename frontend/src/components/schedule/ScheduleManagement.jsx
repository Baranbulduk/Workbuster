import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function ScheduleManagement() {
  const { isDarkMode } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Project Meeting',
      date: '2024-03-15',
      time: '10:00 AM',
      duration: '1 hour',
      type: 'meeting',
      participants: ['John Doe', 'Jane Smith'],
      location: 'Conference Room A'
    },
    {
      id: 2,
      title: 'Client Call',
      date: '2024-03-15',
      time: '2:00 PM',
      duration: '30 minutes',
      type: 'call',
      participants: ['Mike Johnson'],
      location: 'Online'
    },
    {
      id: 3,
      title: 'Team Review',
      date: '2024-03-16',
      time: '11:00 AM',
      duration: '2 hours',
      type: 'review',
      participants: ['Team Alpha'],
      location: 'Conference Room B'
    }
  ]);

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    duration: '1 hour',
    type: 'meeting',
    participants: [],
    location: ''
  });

  const handleAddEvent = (e) => {
    e.preventDefault();
    const event = {
      id: events.length + 1,
      ...newEvent
    };
    setEvents([...events, event]);
    setShowAddEvent(false);
    setNewEvent({
      title: '',
      date: '',
      time: '',
      duration: '1 hour',
      type: 'meeting',
      participants: [],
      location: ''
    });
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(event => event.id !== id));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => event.date === date);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'call':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'review':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Schedule Management</h1>
        <button
          onClick={() => setShowAddEvent(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border dark:border-gray-600 rounded-md dark:text-white">Today</button>
              <button className="px-3 py-1 border dark:border-gray-600 rounded-md dark:text-white">Week</button>
              <button className="px-3 py-1 border dark:border-gray-600 rounded-md dark:text-white">Month</button>
            </div>
          </div>
          {/* Calendar grid would go here */}
          <div className="grid grid-cols-7 gap-1">
            {/* Calendar days would be rendered here */}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {events.map(event => (
              <div
                key={event.id}
                className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.date} at {event.time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Duration: {event.duration}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Location: {event.location}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                  placeholder="Select event date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  required
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                  placeholder="Select event time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
                <select
                  name="duration"
                  value={newEvent.duration}
                  onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                  required
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="3 hours">3 hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <select
                  name="type"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  required
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                >
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="review">Review</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3"
                  placeholder="Enter location or meeting link"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 border dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 