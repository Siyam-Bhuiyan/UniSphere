import {
  Award,
  Book,
  Bookmark,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getClasses } from '../api/class'; // Assuming the classes API functions are imported
import { getDepartments } from '../api/department'; // Assuming the departments API functions are imported

export default function ClassSchedule() {
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('details');
  const [selectedDepartment, setSelectedDepartment] = useState(''); // State to hold selected department
  const [classes, setClasses] = useState([]); // State to hold classes data
  const [departments, setDepartments] = useState([]); // State to hold departments data
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesData = await getClasses();
        const departmentsData = await getDepartments();
        setClasses(classesData); // Update state with fetched classes
        setDepartments(departmentsData); // Update state with fetched departments
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = id => {
    setExpandedId(expandedId === id ? null : id);
    setActiveTab('details');
  };

  const filterClasses = () => {
    if (!selectedDepartment) return classes; // If no department is selected, return all classes
    return classes.filter(cls => cls.department === selectedDepartment); // Filter classes by selected department
  };

  const filteredClasses = filterClasses();

  // Get all upcoming assignments across selected department's classes
  const upcomingAssignments = filteredClasses
    .flatMap(cls =>
      cls.assignments
        .filter(assignment => assignment.status === 'upcoming')
        .map(assignment => ({
          ...assignment,
          courseCode: cls.courseCode,
          courseName: cls.name,
          courseColor: cls.color,
          courseTextColor: cls.textColor,
          courseBorderColor: cls.borderColor,
        })),
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2">My Academic Schedule</h2>
            <p className="opacity-90">Fall Semester 2024</p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                    filter === 'all'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setFilter('all')}
                >
                  All Days
                </button>
                {daysOfWeek.map(day => (
                  <button
                    key={day} // Add key prop
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                      filter === day
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setFilter(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <Calendar size={16} />
                <span>Current Term: Fall 2024</span>
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="flex mb-8">
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 text-sm font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department._id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Calendar size={20} />
                  <span>Class Overview</span>
                </h3>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 overflow-hidden">
                  <div className="overflow-x-auto">
                    {selectedDepartment === '' ? (
                      // Message shown when no department is selected
                      <div className="text-center text-gray-600 dark:text-gray-400 py-4">
                        Please select a department to view the class schedule.
                      </div>
                    ) : (
                      // Table shown when a department is selected
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-tl-lg">
                              Time
                            </th>
                            {daysOfWeek.map((day, index) => (
                              <th
                                key={day}
                                className={`px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                                  index === daysOfWeek.length - 1
                                    ? 'rounded-tr-lg'
                                    : ''
                                }`}
                              >
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            '9:00 AM',
                            '10:00 AM',
                            '11:00 AM',
                            '12:00 PM',
                            '1:00 PM',
                            '2:00 PM',
                            '3:00 PM',
                          ].map((time, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? 'bg-white dark:bg-gray-800'
                                  : 'bg-gray-50 dark:bg-gray-900'
                              }
                            >
                              <td className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-900 dark:text-gray-100">
                                {time}
                              </td>
                              {daysOfWeek.map(day => {
                                const classForTimeAndDay = filteredClasses.find(
                                  cls =>
                                    cls.time.includes(time) &&
                                    cls.days.includes(day),
                                );

                                return (
                                  <td
                                    key={day}
                                    className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 text-sm"
                                  >
                                    {classForTimeAndDay && (
                                      <div
                                        className={`px-2 py-1 rounded ${classForTimeAndDay.color} ${classForTimeAndDay.textColor} text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity duration-200`}
                                        onClick={() =>
                                          toggleExpand(classForTimeAndDay.id)
                                        }
                                      >
                                        {classForTimeAndDay.courseCode} -{' '}
                                        {classForTimeAndDay.name.length > 15
                                          ? classForTimeAndDay.name.substring(
                                              0,
                                              15,
                                            ) + '...'
                                          : classForTimeAndDay.name}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto">
                {selectedDepartment === '' ? (
                  // Message shown when no department is selected
                  <div className="text-center text-gray-600 dark:text-gray-400 py-4 font-medium italic">
                    Please select a department to view the upcoming deadlines.
                  </div>
                ) : upcomingAssignments.length > 0 ? (
                  upcomingAssignments.slice(0, 5).map((assignment, index) => {
                    const dueDate = new Date(assignment.dueDate);
                    const today = new Date();
                    // Remove time part for accurate day comparison
                    dueDate.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );
                    const isPast = diffTime < 0;

                    let urgencyClass =
                      'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
                    let dotClass = 'bg-green-500';
                    let statusText = '';
                    let statusIcon = null;
                    let statusColor =
                      'text-green-700 dark:text-green-300 font-semibold';

                    if (isPast) {
                      statusText = 'Completed';
                      statusIcon = (
                        <Check className="inline-block w-4 h-4 mr-1 text-green-500" />
                      );
                      urgencyClass =
                        'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-70';
                      dotClass = 'bg-gray-400';
                      statusColor =
                        'text-gray-500 dark:text-gray-400 font-medium';
                    } else if (diffDays <= 2) {
                      urgencyClass =
                        'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800';
                      dotClass = 'bg-red-500';
                      statusText = `Due: ${dueDate.toLocaleDateString()} (${diffDays} day${
                        diffDays !== 1 ? 's' : ''
                      } left)`;
                      statusColor =
                        'text-red-700 dark:text-red-300 font-semibold';
                    } else if (diffDays <= 5) {
                      urgencyClass =
                        'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800';
                      dotClass = 'bg-amber-500';
                      statusText = `Due: ${dueDate.toLocaleDateString()} (${diffDays} days left)`;
                      statusColor =
                        'text-amber-700 dark:text-amber-300 font-semibold';
                    } else {
                      statusText = `Due: ${dueDate.toLocaleDateString()} (${diffDays} days left)`;
                    }

                    return (
                      <div
                        key={assignment._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${urgencyClass} shadow-sm`}
                      >
                        <span
                          className={`w-2 h-2 ${dotClass} rounded-full flex-shrink-0`}
                        ></span>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-semibold tracking-wide ${assignment.courseColor} ${assignment.courseTextColor} shadow-sm`}
                            >
                              {assignment.courseCode}
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                              {assignment.name}
                            </p>
                          </div>
                          <p className={`text-xs mt-1 ${statusColor}`}>
                            {statusIcon}
                            {statusText}
                          </p>
                        </div>
                        <div className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 font-bold tracking-wide shadow">
                          {assignment.points} pts
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4 font-medium">
                    No upcoming deadlines
                  </p>
                )}
                {/* Show the "View all" button only when a department is selected */}
                {selectedDepartment !== '' &&
                  upcomingAssignments.length > 5 && (
                    <button className="w-full text-center text-sm font-semibold text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 py-2 transition-colors">
                      View all {upcomingAssignments.length} assignments
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedDepartment === '' ? (
            // Message shown when no department is selected
            <div className="text-center text-gray-600 dark:text-gray-400 py-4">
              Please select a department to view the course.
            </div>
          ) : (
            filteredClasses.map(cls => (
              <div
                key={cls._id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 overflow-hidden ${
                  expandedId === cls.id
                    ? 'ring-2 ring-yellow-400 dark:ring-yellow-600'
                    : 'hover:shadow-xl'
                }`}
              >
                <div
                  className={`relative border-l-4 ${cls.borderColor} p-6 cursor-pointer`}
                  onClick={() => toggleExpand(cls.id)}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${cls.color} ${cls.textColor}`}
                        >
                          {cls.courseCode}
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          {cls.credits} Credits
                        </span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded">
                          Next: {cls.nextClass}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold ${cls.textColor} mb-2`}>
                        {cls.name}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="flex-shrink-0" />
                          <span>{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="flex-shrink-0" />
                          <span>{cls.days.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="flex-shrink-0" />
                          <span>{cls.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden md:block">
                        <div className="flex items-center mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="ml-auto text-xs font-medium text-gray-700 dark:text-gray-300">
                            {cls.classProgress}%
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${cls.accentColor}`}
                            style={{ width: `${cls.classProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        {expandedId === cls.id ? (
                          <ChevronUp className="text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <ChevronDown className="text-gray-400 dark:text-gray-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedId === cls.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex overflow-x-auto">
                        <button
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'details'
                              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500 dark:border-yellow-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                          onClick={() => setActiveTab('details')}
                        >
                          <span className="flex items-center gap-1">
                            <Book size={16} />
                            <span>Course Details</span>
                          </span>
                        </button>

                        <button
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'assignments'
                              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500 dark:border-yellow-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                          onClick={() => setActiveTab('assignments')}
                        >
                          <span className="flex items-center gap-1">
                            <FileText size={16} />
                            <span>Assignments</span>
                          </span>
                        </button>

                        <button
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'materials'
                              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500 dark:border-yellow-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                          onClick={() => setActiveTab('materials')}
                        >
                          <span className="flex items-center gap-1">
                            <BookOpen size={16} />
                            <span>Materials</span>
                          </span>
                        </button>

                        <button
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === 'grading'
                              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500 dark:border-yellow-400'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
                          onClick={() => setActiveTab('grading')}
                        >
                          <span className="flex items-center gap-1">
                            <Award size={16} />
                            <span>Grading</span>
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              <Book size={18} />
                              <span>Course Description</span>
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                              {cls.description}
                            </p>

                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                              <Check size={18} />
                              <span>Learning Outcomes</span>
                            </h4>
                            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                              {cls.learningOutcomes.map((outcome, index) => (
                                <li key={index} className="pl-2">
                                  {outcome}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                              <User size={18} />
                              <span>Instructor</span>
                            </h4>
                            <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                  {cls.professor}
                                </span>
                                <span>{cls.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="flex-shrink-0" />
                                <span>Office Hours: {cls.officehours}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span>{cls.officeLocation}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'assignments' && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <FileText size={18} />
                            <span>Assignments & Assessments</span>
                          </h4>

                          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Due Date
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Points
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {cls.assignments.map((assignment, index) => (
                                  <tr
                                    key={assignment.id}
                                    className={
                                      index % 2 === 0
                                        ? 'bg-white dark:bg-gray-900'
                                        : 'bg-gray-50 dark:bg-gray-800'
                                    }
                                  >
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                      {assignment.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                      {new Date(
                                        assignment.dueDate,
                                      ).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                      {assignment.points} pts
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          assignment.status === 'completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : assignment.status === 'upcoming'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                        }`}
                                      >
                                        {assignment.status
                                          .charAt(0)
                                          .toUpperCase() +
                                          assignment.status.slice(1)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {activeTab === 'materials' && (
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <BookOpen size={18} />
                            <span>Required Materials</span>
                          </h4>

                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                              {cls.materials.length > 0 ? (
                                cls.materials.map((material, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                  >
                                    {material.material}
                                  </span>
                                ))
                              ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                  No materials available
                                </p>
                              )}
                            </div>
                          </div>

                          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                            <Bookmark size={18} />
                            <span>Textbooks</span>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cls.textbooks.length > 0 ? (
                              cls.textbooks.map((book, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                >
                                  <div
                                    className={`w-12 h-16 flex-shrink-0 ${cls.color} rounded flex items-center justify-center`}
                                  >
                                    <Book size={24} className={cls.textColor} />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                                      {book.title}
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      by {book.author}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded ${
                                          book.required
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}
                                      >
                                        {book.required
                                          ? 'Required'
                                          : 'Optional'}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                        ISBN: {book.isbn}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400">
                                No textbooks available
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'grading' && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2 text-lg tracking-tight">
                            <Award size={18} />
                            <span>Grade Breakdown</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="space-y-3">
                                {cls.gradeBreakdown &&
                                  Object.entries(cls.gradeBreakdown).map(
                                    ([category, percentage], index) => (
                                      <div
                                        key={index}
                                        className="flex items-center"
                                      >
                                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-grow capitalize font-medium">
                                          {category}
                                        </span>
                                        <span className="ml-auto text-sm font-bold text-gray-900 dark:text-gray-100">
                                          {percentage}
                                        </span>
                                        <div className="w-24 h-2 ml-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${cls.accentColor}`}
                                            style={{
                                              width: `${parseInt(percentage)}%`,
                                            }}
                                          ></div>
                                        </div>
                                      </div>
                                    ),
                                  )}
                              </div>
                            </div>
                            <div>
                              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center mb-4 gap-2">
                                  <CreditCard
                                    size={18}
                                    className="text-gray-400"
                                  />
                                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-base">
                                    Grading Scale
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center font-medium">
                                    <span className="text-gray-700 dark:text-gray-200">
                                      A:
                                    </span>
                                    <span className="ml-auto text-gray-900 dark:text-gray-100">
                                      90-100%
                                    </span>
                                  </div>
                                  <div className="flex items-center font-medium">
                                    <span className="text-gray-700 dark:text-gray-200">
                                      B:
                                    </span>
                                    <span className="ml-auto text-gray-900 dark:text-gray-100">
                                      80-89%
                                    </span>
                                  </div>
                                  <div className="flex items-center font-medium">
                                    <span className="text-gray-700 dark:text-gray-200">
                                      C:
                                    </span>
                                    <span className="ml-auto text-gray-900 dark:text-gray-100">
                                      70-79%
                                    </span>
                                  </div>
                                  <div className="flex items-center font-medium">
                                    <span className="text-gray-700 dark:text-gray-200">
                                      D:
                                    </span>
                                    <span className="ml-auto text-gray-900 dark:text-gray-100">
                                      60-69%
                                    </span>
                                  </div>
                                  <div className="flex items-center font-medium">
                                    <span className="text-gray-700 dark:text-gray-200">
                                      F:
                                    </span>
                                    <span className="ml-auto text-gray-900 dark:text-gray-100">
                                      Below 60%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
