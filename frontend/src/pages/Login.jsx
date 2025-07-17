import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Login form submitted");

    try {
      console.log("About to send login request");
      const response = await axios.post("/auth/login", formData);
      console.log("Login response:", response);

      const { token, role, adminId, admin } = response.data;
      console.log("Login data:", { token, role, adminId, admin });

      if (role !== "admin") {
        setError(
          "This login page is for administrators only. Please use the employee login page."
        );
        return;
      }

      localStorage.setItem("adminToken", token);
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("adminId", adminId);
      if (admin) {
        localStorage.setItem("admin", JSON.stringify(admin));
      }

      console.log("Navigating to dashboard");
      navigate("/");
    } catch (error) {
      console.log("Login error:", error);
      setError(
        error.response?.data?.message || "An error occurred during login"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent">
            Admin Login
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3  placeholder-gray-500 border border-gray-100 text-gray-900 rounded-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 dark:bg-gray-800"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 placeholder-gray-500 border border-gray-100 text-gray-900 rounded-md sm:text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 dark:bg-gray-800"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              onClick={() => console.log("Button clicked")}
              className="flex justify-center items-center py-2 px-8 font-semibold text-lg rounded-3xl text-white bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors"
            >
              Login
            </button>
          </div>
        </form>
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm text-gray-600">
            <Link
              to="/employee/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login as Employee
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            <Link
              to="/candidate/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login as Candidate
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            <Link
              to="/client/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Login as Client
            </Link>
          </p>
          <p className="text-center text-sm text-gray-600">
            <Link
              to="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
