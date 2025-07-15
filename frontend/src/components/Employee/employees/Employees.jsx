import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiFilter } from "react-icons/fi";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import {
  verifyAndRefreshEmployeeToken,
  employeeApiCall,
  handleEmployeeTokenExpiration,
} from "../../../utils/tokenManager";

const Employees = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    experience: "",
  });
  const [importedEmployees, setImportedEmployees] = useState([]);
  const [onboardingProgress, setOnboardingProgress] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    address: "",
    postalCode: "",
    city: "",
    country: "",
  });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const employeeToken = localStorage.getItem("employeeToken");
        if (!employeeToken) {
          handleEmployeeTokenExpiration(navigate, token, email);
          return;
        }
        const {
          valid,
          expired,
          token: refreshedToken,
        } = await verifyAndRefreshEmployeeToken();
        if (valid) {
          if (refreshedToken && refreshedToken !== employeeToken) {
            localStorage.setItem("employeeToken", refreshedToken);
          }
          fetchEmployees();
        } else {
          handleEmployeeTokenExpiration(navigate, token, email);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        handleEmployeeTokenExpiration(navigate, token, email);
      }
    };

    verifyToken();
  }, [navigate, token, email]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const employeeToken = localStorage.getItem("employeeToken");
      if (!employeeToken) {
        console.log("No employee token found in localStorage");
        handleEmployeeTokenExpiration(navigate, token, email);
        return;
      }

      const response = await employeeApiCall("GET", "/employees/colleagues");

      console.log("Response from server:", response);

      // Process employee data
      const processedEmployees = response.map((employee) => ({
        ...employee,
        name: employee.name || `${employee.firstName} ${employee.lastName}`,
        fullName:
          employee.fullName || `${employee.firstName} ${employee.lastName}`,
        employeeId:
          employee.employeeId || `EM${String(employee._id).slice(-4)}`,
        status: employee.status || "active",
        department: employee.department || "IT",
        position: employee.position || "Employee",
        hireDate: employee.hireDate || employee.createdAt,
      }));

      setEmployees(processedEmployees);

      setError(null);
    } catch (error) {
      console.error("Error fetching employees:", error);
      if (error.response) {
        console.log("Error response:", error.response.data);
        console.log("Error status:", error.response.status);
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("Token expired or invalid, redirecting to login");
        handleEmployeeTokenExpiration(navigate, token, email);
      } else {
        setError("Failed to fetch employees");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employees.length > 0) {
      fetchOnboardingProgress();
    }
  }, [employees]);

  const fetchOnboardingProgress = async () => {
    try {
      // Get progress for each employee
      const progressPromises = employees.map(async (employee) => {
        try {
          const response = await employeeApiCall(
            "GET",
            `/onboarding/forms-by-recipient/${employee.email}`
          );

          if (response.success) {
            const formsData = response.forms;
            let notStarted = 0;
            let inProgress = 0;
            let completed = 0;

            formsData.forEach((form) => {
              const recipient = form.recipients.find(
                (r) => r.email === employee.email
              );
              if (!recipient) {
                notStarted++;
              } else if (
                recipient.completedFields &&
                Array.isArray(recipient.completedFields) &&
                recipient.completedFields.length === form.fields.length
              ) {
                completed++;
              } else if (
                recipient.completedFields &&
                recipient.completedFields.length > 0
              ) {
                inProgress++;
              } else {
                notStarted++;
              }
            });

            const totalForms = formsData.length || 0;
            const progress =
              totalForms > 0 ? Math.round((completed / totalForms) * 100) : 0;

            let status = "Not Started";
            if (progress === 100) {
              status = "Complete";
            } else if (progress > 0) {
              status = "In Progress";
            }

            return {
              employeeId: employee._id,
              status,
              progress,
              completed,
              totalForms,
              notStarted,
              inProgress,
            };
          }
          return null;
        } catch (error) {
          console.error(
            `Error fetching progress for employee ${employee.email}:`,
            error
          );
          return null;
        }
      });

      const progressResults = await Promise.all(progressPromises);

      // Update the progress state with new data
      setOnboardingProgress((prev) => {
        const newProgress = { ...prev };
        progressResults.forEach((progress, index) => {
          if (progress) {
            newProgress[employees[index]._id] = progress;
          }
        });
        return newProgress;
      });
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const allEmployees = [...employees, ...importedEmployees];

  const filteredEmployees = allEmployees.filter((employee) => {
    const matchesSearch =
      (employee.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (employee.email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (employee.department?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus = !filters.status || employee.status === filters.status;
    const matchesDepartment =
      !filters.department || employee.department === filters.department;
    const matchesExperience =
      !filters.experience ||
      employee.experience >= parseInt(filters.experience);
    return (
      matchesSearch && matchesStatus && matchesDepartment && matchesExperience
    );
  });

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Position",
      "E-Mail",
      "Hiring Lead",
      "Department",
      "Status",
    ];
    const csvData = [...employees, ...importedEmployees].map((emp) => [
      emp.employeeId || emp._id || "",
      emp.name || emp.fullName || "-",
      emp.position || "-",
      emp.email || "-",
      emp.hiringLead || "Sammy Stone",
      emp.department || "-",
      emp.status || "-",
    ]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `employees_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split("\n");
        const headers = rows[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        const newEmployees = rows
          .slice(1)
          .filter(Boolean)
          .map((row, idx) => {
            const values = row
              .split(",")
              .map((v) => v.trim().replace(/"/g, ""));
            return {
              employeeId: values[0] || `imported-${idx}`,
              name: values[1] || "-",
              position: values[2] || "-",
              email: values[3] || "-",
              hiringLead: values[4] || "Sammy Stone",
              department: values[5] || "-",
              status: values[6] || "active",
              _id: `imported-${idx}`,
            };
          });
        setImportedEmployees(newEmployees);
      };
      reader.readAsText(file);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-[#FFD08E] dark:via-[#FF6868] dark:to-[#926FF3] dark:bg-clip-text dark:text-transparent">
          Employees
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => document.getElementById("csv-upload").click()}
            className="inline-flex items-center gap-2 py-1 pl-1 pr-4  text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors"
          >
            <div className="bg-white rounded-3xl p-2 text-black">
              <ArrowUpTrayIcon className="h-5 w-5" />
            </div>
            Import CSV
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 py-1 pl-1 pr-4  text-white rounded-3xl font-medium bg-gradient-to-r from-[#FFD08E] via-[#FF6868] to-[#926FF3] hover:from-[#e0b77e] hover:via-[#e05959] hover:to-[#8565dd] transition-colors"
          >
            <div className="bg-white rounded-3xl p-2 text-black">
              <ArrowDownTrayIcon className="h-5 w-5" />
            </div>
            Export CSV
          </button>
        </div>
      </div>
      {successMsg && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dark:border-gray-700 dark:text-white"
        >
          <FiFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 p-4 border rounded-lg dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>

            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Departments</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>

            <select
              name="experience"
              value={filters.experience}
              onChange={handleFilterChange}
              className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Experience</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
              <option value="10">10+ years</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  ID #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Full name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  E-Mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Hiring Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Documents
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Onboarding Workflow
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredEmployees.map((employee, idx) => (
                <tr
                  key={employee._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.employeeId || employee._id?.slice(-4) || idx + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap flex items-center gap-3">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={
                        employee.avatar ||
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23CBD5E0'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"
                      }
                      alt={employee.name || employee.fullName || "Employee"}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {employee.firstName && employee.lastName
                          ? `${employee.firstName} ${employee.lastName}`
                          : employee.name || employee.fullName || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.position || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.email || "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.hireDate
                      ? new Date(employee.hireDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-blue-600 hover:underline dark:text-blue-400"
                      onClick={() =>
                        navigate(
                          `/employee/employees/${employee._id}${
                            token
                              ? `?token=${token}${
                                  email ? `&email=${email}` : ""
                                }`
                              : ""
                          }`
                        )
                      }
                    >
                      View more
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {/* Onboarding Workflow Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-[120px] max-w-[180px]">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>
                            {onboardingProgress[employee._id]?.status ||
                              "Not Started"}
                          </span>
                          <span>
                            {Math.round(
                              onboardingProgress[employee._id]?.progress || 0
                            )}
                            %
                          </span>
                        </div>
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className={`absolute left-0 top-0 h-2 rounded-full ${
                              onboardingProgress[employee._id]?.progress === 100
                                ? "bg-green-500"
                                : onboardingProgress[employee._id]?.progress > 0
                                ? "bg-blue-500"
                                : "bg-gray-400"
                            }`}
                            style={{
                              width: `${
                                onboardingProgress[employee._id]?.progress || 0
                              }%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {onboardingProgress[employee._id]?.completed || 0} of{" "}
                          {onboardingProgress[employee._id]?.totalForms || 0}{" "}
                          forms completed
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;
