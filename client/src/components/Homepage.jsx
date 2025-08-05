// src/components/HomePage.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaUtensils,
  FaBus,
  FaCalendarAlt,
  FaUserTie,
  FaMapMarkedAlt,
  FaSearch,
  FaBell,
  FaUsers,
  FaGraduationCap,
  FaBook,
  FaRobot,
  FaQuestion,
} from "react-icons/fa";

export default function HomePage() {
  const mainFeatures = [
    {
      id: 1,
      title: "Cafeteria Menu",
      icon: <FaUtensils className="text-3xl text-yellow-600" />,
      description:
        "View today's meals, pre-order food, and check nutritional information",
      path: "/CafeteriaMenu",
      color: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-100",
      borderColor: "border-yellow-200",
    },
    {
      id: 2,
      title: "Bus Schedule",
      icon: <FaBus className="text-3xl text-blue-600" />,
      description:
        "Check university bus timings, routes, and real-time updates",
      path: "/BusSchedule",
      color: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      borderColor: "border-blue-200",
    },
    {
      id: 3,
      title: "Class Timetable",
      icon: <FaCalendarAlt className="text-3xl text-green-600" />,
      description:
        "View your personalized class schedule and academic calendar",
      path: "/ClassSchedule",
      color: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      borderColor: "border-green-200",
    },
    {
      id: 4,
      title: "Faculty Contact",
      icon: <FaUserTie className="text-3xl text-purple-600" />,
      description: "Find contact information for all faculty members and staff",
      path: "/FacultyContact",
      color: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      borderColor: "border-purple-200",
    },
    {
      id: 5,
      title: "Campus Navigation",
      icon: <FaMapMarkedAlt className="text-3xl text-red-600" />,
      description: "Interactive campus map with AR navigation features",
      path: "/CampusNavigation",
      color: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      borderColor: "border-red-200",
    },
    {
      id: 6,
      title: "Alerts & Notifications",
      icon: <FaBell className="text-3xl text-orange-600" />,
      description: "Important announcements and personalized notifications",
      path: "/Alert",
      color: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      borderColor: "border-orange-200",
    },
    {
      id: 7,
      title: "Clubs & Events",
      icon: <FaUsers className="text-3xl text-indigo-600" />,
      description: "Join clubs, RSVP to events, and get event recommendations",
      path: "/MyClubEvents",
      color: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-100",
      borderColor: "border-indigo-200",
    },
    {
      id: 8,
      title: "LostFound",
      icon: <FaSearch className="text-3xl text-indigo-600" />,
      description: "Lost and found items on campus",
      path: "/LostFound",
      color: "bg-teal-50",
      hoverColor: "hover:bg-teal-100",
      borderColor: "border-teal-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Student Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Welcome back! Here's everything you need for your campus life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Today's Classes
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              3
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Assignments Due
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              2
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upcoming Events
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              5
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              New Announcements
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              7
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mainFeatures.map((feature) => (
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

        <div className="bg-teal-50 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-teal-200 dark:border-gray-700 mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaGraduationCap className="mr-3 text-teal-600" /> Learning Hub
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Access all your learning tools and resources in one place
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Virtual Classroom
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Video calling, online whiteboard, and real-time chat
                </p>
                <Link
                  to="/Collab"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  Enter Classroom →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Learning Roadmaps
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Personalized learning paths for your academic journey
                </p>
                <Link
                  to="/Roadmap"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  View Roadmaps →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Discussion Forums
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Ask questions, share knowledge, and collaborate with peers
                </p>
                <Link
                  to="/Forums"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  Join Discussions →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Class Routine
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Personalized class routines with automatic reminders and
                  assignment tracking
                </p>
                <Link
                  to="/ClassRoutine"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  View Routine →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Quiz Test
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Practice tests and assessments for all your courses
                </p>
                <Link
                  to="/QuizTest"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  Take Quiz →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Read Articles
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Specialized courses to enhance your professional skills
                </p>
                <Link
                  to="/NewsPortal"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  Browse Courses →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Your Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  All your notes in one place!
                </p>
                <Link
                  to="/virtualQuiz"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  Read your notes →
                </Link>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  AI Learning Assistant
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Voice-enabled chatbot for learning assistance and notes
                </p>
                <Link
                  to="/Chatbot"
                  className="text-teal-600 dark:text-teal-400 text-sm hover:underline"
                >
                  Talk to Assistant →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-12">
          <div className="px-6 py-4 bg-indigo-500 dark:bg-indigo-700">
            <h2 className="text-xl font-bold text-white">
              Recent Announcements
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Midterm Exam Schedule Posted
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                March 1, 2025 • Academic Affairs
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                The midterm examination schedule for Spring 2025 has been
                posted. Please check your student portal for specific dates and
                times.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Campus Wi-Fi Maintenance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                February 28, 2025 • IT Services
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Network maintenance will be conducted this weekend. Expect
                intermittent Wi-Fi service in dormitories from 11 PM to 4 AM.
              </p>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Spring Festival Registration Open
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                February 25, 2025 • Student Activities
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Registration for the Annual Spring Festival is now open. Clubs
                and individual students can sign up to participate in various
                events and performances.
              </p>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
            <Link
              to="/announcements"
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
            >
              View all announcements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
