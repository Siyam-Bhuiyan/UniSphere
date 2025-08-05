import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  FaUtensils,
  FaBus,
  FaCalendarAlt,
  FaUserTie,
  FaMapMarkedAlt,
  FaBell,
  FaUsers,
  FaGraduationCap,
  FaClipboardList,
  FaCog,
  FaChartBar,
  FaLock,
  FaSearch,
  FaUserMinus,
  FaUserCog,
} from "react-icons/fa";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setUsers(response.data);
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const toggleAdminStatus = async (userId, makeAdmin) => {
    try {
      const endpoint = makeAdmin ? "make-admin" : "remove-admin";
      await axios.put(
        `${import.meta.env.VITE_SERVER_URL}/api/admin/${endpoint}/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchUsers();
      setError("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update admin status"
      );
    }
  };

  const adminFeatures = [
    {
      id: 1,
      title: "Cafeteria Management",
      icon: <FaUtensils className="text-3xl text-yellow-600" />,
      description:
        "Manage menu items, prices, and meal nutritional information",
      path: "/Admin/CafeteriaManagement",
      color: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      borderColor: "border-yellow-200",
    },
    {
      id: 2,
      title: "Transportation Admin",
      icon: <FaBus className="text-3xl text-blue-600" />,
      description:
        "Configure bus routes, schedules, and manage transportation updates",
      path: "/Admin/BusManagement",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      id: 3,
      title: "Class Management",
      icon: <FaCalendarAlt className="text-3xl text-green-600" />,
      description: "Manage course schedules, classrooms, and academic calendar",
      path: "/Admin/ClassManagement",
      color: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      borderColor: "border-green-200",
    },
    {
      id: 4,
      title: "Faculty Directory",
      icon: <FaUserTie className="text-3xl text-purple-600" />,
      description:
        "Manage faculty profiles, contact information and departments",
      path: "/Admin/FacultyEntry",
      color: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      borderColor: "border-purple-200",
    },
    {
      id: 5,
      title: "Campus Facilities",
      icon: <FaMapMarkedAlt className="text-3xl text-red-600" />,
      description: "Update campus map data, buildings, and navigation points",
      path: "/admin/facilities",
      color: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      borderColor: "border-red-200",
    },
    {
      id: 6,
      title: "Announcements",
      icon: <FaBell className="text-3xl text-orange-600" />,
      description: "Create and manage university-wide notifications and alerts",
      path: "/Admin/AlertManagement",
      color: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      borderColor: "border-orange-200",
    },
    {
      id: 7,
      title: "Events Administration",
      icon: <FaUsers className="text-3xl text-indigo-600" />,
      description: "Approve club events, manage venues, and monitor attendance",
      path: "/Admin/Events",
      color: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-100",
      borderColor: "border-indigo-200",
    },
    {
      id: 8,
      title: "Learning Resources",
      icon: <FaGraduationCap className="text-3xl text-teal-600" />,
      description:
        "Manage e-learning tools, virtual classrooms and course materials",
      path: "/admin/learning",
      color: "bg-teal-50",
      hoverColor: "hover:bg-teal-100",
      borderColor: "border-teal-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            University management system administration panel
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Students
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              33
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Faculty Members
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
            4
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Active Courses
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              6
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pending Approvals
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              0
            </p>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {adminFeatures.map((feature) => (
            <Link
              to={feature.path}
              key={feature.id}
              className={`block ${feature.color} dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 transform hover:scale-105 ${feature.hoverColor} dark:hover:bg-gray-700 border ${feature.borderColor} dark:border-gray-700`}
            >
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-white dark:bg-gray-700 mx-auto mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* System Management Card */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaCog className="mr-3 text-gray-600" /> System Management
            </h2>

            

            {/* Rest of system management cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  User Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Manage user accounts and permissions
                </p>
                <Link
                  to="./UserManagement"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Manage Users →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Role Permissions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Configure access control and permission settings
                </p>
                <Link
                  to="/admin/system/roles"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Manage Roles →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  System Logs
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  View system logs, errors, and activity history
                </p>
                <Link
                  to="/admin/system/logs"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  View Logs →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Backup & Restore
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Database backup, restoration and scheduled tasks
                </p>
                <Link
                  to="/admin/system/backup"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Backup Options →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  API Configuration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Manage API keys, endpoints and integration settings
                </p>
                <Link
                  to="/admin/system/api"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Manage API →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Email Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Customize system email notifications and templates
                </p>
                <Link
                  to="/admin/system/email-templates"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Edit Templates →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  System Health
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Monitor system performance and server status
                </p>
                <Link
                  to="/admin/system/health"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Check Status →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Security Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Configure security policies and authentication options
                </p>
                <Link
                  to="/admin/system/security"
                  className="text-gray-600 dark:text-gray-400 text-sm hover:underline"
                >
                  Security Options →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="px-6 py-4 bg-indigo-500 dark:bg-indigo-700">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Updated Transportation Schedule
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                March 1, 2025 • Admin: Jennifer Clark
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Modified Spring 2025 bus schedule to accommodate new evening
                classes. Updated 3 routes and added 2 new stops.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Cafeteria Menu Updated
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                February 28, 2025 • Admin: Michael Rodriguez
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Added 12 new menu items for Spring season. Updated nutritional
                information and allergen listings for all items.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                System Maintenance Completed
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                February 25, 2025 • Admin: Robert Johnson
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Successfully completed database optimization and security patch
                updates. System performance improved by 15%.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <Link
              to="/admin/activity-log"
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
            >
              View all activity →
            </Link>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-500 dark:bg-blue-700">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaChartBar className="mr-2" /> Analytics
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Access system usage statistics and generate custom reports.
              </p>
              <Link
                to="/admin/analytics"
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                View Analytics
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-green-500 dark:bg-green-700">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaClipboardList className="mr-2" /> Batch Operations
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Perform bulk updates, imports, and exports for system data.
              </p>
              <Link
                to="/admin/batch-operations"
                className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Start Operation
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-red-500 dark:bg-red-700">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaLock className="mr-2" /> Admin Access
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Manage administrator accounts and access privileges.
              </p>
              <Link
                to="/admin/access-control"
                className="inline-block px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Manage Access
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-100 dark:bg-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Quick Links
            </h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/settings"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Global Settings
            </Link>
            <Link
              to="/admin/reports"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Generate Reports
            </Link>
            <Link
              to="/admin/help"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Admin Help Center
            </Link>
            <Link
              to="/admin/documentation"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Documentation
            </Link>
            <Link
              to="/admin/support"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Support Tickets
            </Link>
            <Link
              to="/admin/notifications"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Notification Center
            </Link>
            <Link
              to="/admin/audit"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Audit Logs
            </Link>
            <Link
              to="/logout"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
