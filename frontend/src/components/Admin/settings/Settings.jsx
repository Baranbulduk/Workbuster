import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    profile: {
      name: "",
      email: "",
      role: "",
      department: "",
      phone: "",
      location: "",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      projectUpdates: true,
      teamMessages: true,
      deadlineReminders: true,
      weeklyReports: false,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "UTC-5",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      itemsPerPage: 25,
    },
    security: {
      twoFactorAuth: false,
      passwordChangeRequired: false,
      sessionTimeout: 30,
      loginAttempts: 3,
      lastPasswordChange: "2024-01-15",
    },
  });

  useEffect(() => {
    // Try to load admin info from localStorage
    const adminStr = localStorage.getItem("admin");
    if (adminStr) {
      try {
        const admin = JSON.parse(adminStr);
        setSettings((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            name:
              `${
                admin.firstName && admin.lastName
                  ? `${admin.firstName} ${admin.lastName}`
                  : admin.name
              }` || prev.profile.name,
            email: admin.email || prev.profile.email,
            role: admin.role || prev.profile.role,
            department: admin.department || prev.profile.department,
            phone: admin.phone || prev.profile.phone,
            location: admin.location || prev.profile.location,
          },
        }));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveSettings = (section) => {
    console.log(`Saving ${section} settings:`, settings[section]);
    alert(`${section} settings saved successfully!`);
  };

  return (
    <div className="min-h-screen w-full dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent w-fit mb-6">
          Settings
        </h1>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Profile Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={settings.profile.name}
                onChange={(e) =>
                  handleInputChange("profile", "name", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.profile.email}
                onChange={(e) =>
                  handleInputChange("profile", "email", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={settings.profile.role}
                disabled
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={settings.profile.department}
                onChange={(e) =>
                  handleInputChange("profile", "department", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                placeholder="Enter department"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={settings.profile.phone}
                onChange={(e) =>
                  handleInputChange("profile", "phone", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Location
              </label>
              <input
                type="text"
                value={settings.profile.location}
                onChange={(e) =>
                  handleInputChange("profile", "location", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSaveSettings("profile")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
            >
              Save Profile
            </button>
          </div>

          {/* Forgot Password & Update Password */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-md font-medium text-gray-700 dark:text-gray-300">
                Password Management
              </span>
              <button
                onClick={() => alert("Password reset link sent to your email!")}
                className="text-blue-600 hover:underline text-sm"
                type="button"
              >
                Forgot Password?
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Password updated successfully!");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                  placeholder="Enter new password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notification Settings
          </h2>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      handleInputChange("notifications", key, e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSaveSettings("notifications")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
            >
              Save Notifications
            </button>
          </div>
        </div>

        {/* Preferences Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Theme
              </label>
              <select
                value={isDarkMode ? "dark" : "light"}
                onChange={(e) => {
                  if (e.target.value === "dark" && !isDarkMode) {
                    toggleDarkMode();
                  } else if (e.target.value === "light" && isDarkMode) {
                    toggleDarkMode();
                  }
                }}
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Language
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) =>
                  handleInputChange("preferences", "language", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Timezone
              </label>
              <select
                value={settings.preferences.timezone}
                onChange={(e) =>
                  handleInputChange("preferences", "timezone", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              >
                <option value="UTC-5">UTC-5 (EST)</option>
                <option value="UTC-8">UTC-8 (PST)</option>
                <option value="UTC+0">UTC+0 (GMT)</option>
                <option value="UTC+1">UTC+1 (CET)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date Format
              </label>
              <select
                value={settings.preferences.dateFormat}
                onChange={(e) =>
                  handleInputChange("preferences", "dateFormat", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Format
              </label>
              <select
                value={settings.preferences.timeFormat}
                onChange={(e) =>
                  handleInputChange("preferences", "timeFormat", e.target.value)
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              >
                <option value="12h">12-hour</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Items Per Page
              </label>
              <select
                value={settings.preferences.itemsPerPage}
                onChange={(e) =>
                  handleInputChange(
                    "preferences",
                    "itemsPerPage",
                    parseInt(e.target.value)
                  )
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSaveSettings("preferences")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Security Settings
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) =>
                    handleInputChange(
                      "security",
                      "twoFactorAuth",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Change Required
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Force password change on next login
                </p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.security.passwordChangeRequired}
                  onChange={(e) =>
                    handleInputChange(
                      "security",
                      "passwordChangeRequired",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  handleInputChange(
                    "security",
                    "sessionTimeout",
                    parseInt(e.target.value)
                  )
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                min="1"
                max="120"
                placeholder="Enter session timeout in minutes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Maximum Login Attempts
              </label>
              <input
                type="number"
                name="loginAttempts"
                value={settings.security.loginAttempts}
                onChange={(e) =>
                  handleInputChange(
                    "security",
                    "loginAttempts",
                    parseInt(e.target.value)
                  )
                }
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                min="1"
                max="10"
                placeholder="Enter maximum login attempts"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Password Change
              </label>
              <input
                type="text"
                name="lastPasswordChange"
                value={settings.security.lastPasswordChange}
                disabled
                className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => handleSaveSettings("security")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
            >
              Save Security Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
