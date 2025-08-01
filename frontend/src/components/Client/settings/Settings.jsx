import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import axios from "../../../utils/axios";

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

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    // Try to load client info from localStorage
    const clientStr = localStorage.getItem("client");
    console.log(clientStr);
    if (clientStr) {
      try {
        const client = JSON.parse(clientStr);
        setSettings((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            name:
              client.firstName && client.lastName
                ? `${client.firstName} ${client.lastName}`
                : client.name || prev.profile.name,
            email: client.email || prev.profile.email,
            role: client.role || prev.profile.role,
            department: client.department || prev.profile.department,
            phone: client.phone || prev.profile.phone,
            location: client.location || prev.profile.location,
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

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error/success messages when user starts typing
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      // Validate passwords match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("New passwords do not match");
        setIsUpdatingPassword(false);
        return;
      }

      // Validate password length
      if (passwordForm.newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters long");
        setIsUpdatingPassword(false);
        return;
      }

      const response = await axios.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response?.data?.message) {
        setPasswordError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        setPasswordError(error.response.data.errors[0].msg);
      } else {
        setPasswordError("Failed to update password. Please try again.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen w-full dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent w-fit mb-6">
          Settings
        </h1>

        {/* Profile Settings */}
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
              Profile Settings
            </h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 my-6">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800s"
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
            
            {/* Password Error/Success Messages */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
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
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
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
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className="mt-1 block w-full h-11 rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-3"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-3xl font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
