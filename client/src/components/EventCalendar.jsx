import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Calendar as CalendarIcon, User, Tag, ChevronLeft, ChevronRight, Heart, Share, Bell } from 'lucide-react';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Categories with their respective colors
const categories = [
  { id: 1, name: "Academic", color: "#FCD34D" },  // Yellow
  { id: 2, name: "Cultural", color: "#F87171" },  // Red
  { id: 3, name: "Sports", color: "#60A5FA" },    // Blue
  { id: 4, name: "Workshop", color: "#34D399" },  // Green
  { id: 5, name: "Social", color: "#A78BFA" }     // Purple
];

// Sample events data
const eventsData = [
  {
    id: 1,
    title: "Coding Workshop",
    start: new Date(2024, 2, 1, 14, 0), // March 1st, 2024, 2:00 PM
    end: new Date(2024, 2, 1, 16, 0),   // March 1st, 2024, 4:00 PM
    location: "Computer Science Building, Room 202",
    description: "Learn the basics of React and build your first application. Bring your laptop!",
    category: 4, // Workshop
    organizer: "Computer Science Club",
    image: "/api/placeholder/400/200",
    attendees: 42,
    interested: 78
  },
  {
    id: 2,
    title: "Spring Festival",
    start: new Date(2024, 2, 5, 12, 0), // March 5th, 2024, 12:00 PM
    end: new Date(2024, 2, 5, 20, 0),   // March 5th, 2024, 8:00 PM
    location: "University Quad",
    description: "Annual spring celebration with music, food, and activities for all students.",
    category: 2, // Cultural
    organizer: "Student Activities Board",
    image: "/api/placeholder/400/200",
    attendees: 5,
    interested: 243
  },
  {
    id: 3,
    title: "Final Exam: Calculus II",
    start: new Date(2024, 2, 15, 9, 0),  // March 15th, 2024, 9:00 AM
    end: new Date(2024, 2, 15, 11, 0),   // March 15th, 2024, 11:00 AM
    location: "Mathematics Building, Hall 101",
    description: "Final examination for Calculus II. Bring your calculator and student ID.",
    category: 1, // Academic
    organizer: "Department of Mathematics",
    image: "/api/placeholder/400/200",
    attendees: 98,
    interested: 98
  },
  {
    id: 4,
    title: "Basketball Tournament",
    start: new Date(2024, 2, 10, 16, 0), // March 10th, 2024, 4:00 PM
    end: new Date(2024, 2, 10, 19, 0),   // March 10th, 2024, 7:00 PM
    location: "University Gymnasium",
    description: "Interdepartmental basketball tournament. Come cheer for your department!",
    category: 3, // Sports
    organizer: "Athletics Department",
    image: "/api/placeholder/400/200",
    attendees: 87,
    interested: 124
  },
  {
    id: 5,
    title: "Networking Mixer",
    start: new Date(2024, 2, 18, 17, 30), // March 18th, 2024, 5:30 PM
    end: new Date(2024, 2, 18, 19, 30),   // March 18th, 2024, 7:30 PM
    location: "Business School Atrium",
    description: "Connect with alumni and industry professionals in an informal setting.",
    category: 5, // Social
    organizer: "Career Services",
    image: "/api/placeholder/400/200",
    attendees: 64,
    interested: 112
  }
];

export default function EventCalendar() {
  const [events, setEvents] = useState(eventsData);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'featured'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [featuredEventIndex, setFeaturedEventIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userInterested, setUserInterested] = useState([]);

  // Filter events based on search query and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? event.category === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  // Format events for the react-big-calendar
  const calendarEvents = filteredEvents.map(event => ({
    ...event,
    title: event.title,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: false,
  }));

  // Get the featured events (could be based on attendance, recency, etc.)
  const featuredEvents = [...events].sort((a, b) => b.interested - a.interested).slice(0, 5);

  // Toggle interest in an event
  const toggleInterest = (eventId) => {
    if (userInterested.includes(eventId)) {
      setUserInterested(userInterested.filter(id => id !== eventId));
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, interested: event.interested - 1 } 
          : event
      ));
    } else {
      setUserInterested([...userInterested, eventId]);
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, interested: event.interested + 1 } 
          : event
      ));
    }
  };

  // Handle event click
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Navigate featured events
  const navigateFeatured = (direction) => {
    if (direction === 'next') {
      setFeaturedEventIndex((featuredEventIndex + 1) % featuredEvents.length);
    } else {
      setFeaturedEventIndex(featuredEventIndex === 0 ? featuredEvents.length - 1 : featuredEventIndex - 1);
    }
  };

  // Custom styling for calendar events
  const eventStyleGetter = (event) => {
    const category = categories.find(cat => cat.id === event.category);
    const style = {
      backgroundColor: category ? category.color : '#9CA3AF',
      borderRadius: '8px',
      opacity: 0.9,
      color: '#FFFFFF',
      border: 'none',
      display: 'block'
    };
    return {
      style
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-[#18181b] dark:to-[#27272a] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-700 dark:text-yellow-300 mb-3">
            University Events
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover, connect, and participate in exciting events happening across campus.
          </p>
        </header>

        {/* Search and Filter Bar */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:outline-none text-gray-600 dark:text-gray-300"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === null 
                  ? 'bg-yellow-500 text-white dark:bg-yellow-600' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCategory === category.id 
                    ? 'bg-yellow-500 text-white dark:bg-yellow-600' 
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                } hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors`}
                style={{ backgroundColor: selectedCategory === category.id ? category.color : '' }}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-yellow-500 text-white dark:bg-yellow-600' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg ${
                viewMode === 'calendar' 
                  ? 'bg-yellow-500 text-white dark:bg-yellow-600' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('featured')}
              className={`p-2 rounded-lg ${
                viewMode === 'featured' 
                  ? 'bg-yellow-500 text-white dark:bg-yellow-600' 
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              } hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors`}
            >
              Featured
            </button>
          </div>
        </div>

        {/* Featured Event Carousel (shown only in featured view) */}
        {viewMode === 'featured' && featuredEvents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 dark:from-yellow-800 dark:via-amber-700 dark:to-orange-800">
              <img 
                src={featuredEvents[featuredEventIndex].image}
                alt={featuredEvents[featuredEventIndex].title}
                className="w-full h-96 object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <span className="inline-block px-3 py-1 mb-4 text-sm font-medium rounded-full" 
                    style={{ backgroundColor: categories.find(cat => cat.id === featuredEvents[featuredEventIndex].category)?.color }}>
                    {categories.find(cat => cat.id === featuredEvents[featuredEventIndex].category)?.name}
                  </span>
                  <h2 className="text-4xl font-bold mb-2">{featuredEvents[featuredEventIndex].title}</h2>
                  <p className="text-gray-200 mb-4">{featuredEvents[featuredEventIndex].description}</p>
                  <div className="flex items-center gap-4 text-gray-300 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{moment(featuredEvents[featuredEventIndex].start).format('MMMM Do, h:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{featuredEvents[featuredEventIndex].location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      <span>{featuredEvents[featuredEventIndex].attendees} attending</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEventClick(featuredEvents[featuredEventIndex])}
                    className="px-6 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigateFeatured('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => navigateFeatured('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight size={24} />
            </button>
            <div className="flex justify-center mt-4 gap-2">
              {featuredEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setFeaturedEventIndex(index)}
                  className={`h-2 w-2 rounded-full ${
                    index === featuredEventIndex 
                      ? 'bg-yellow-500 w-8' 
                      : 'bg-gray-300 dark:bg-gray-700'
                  } transition-all`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="h-[600px]">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={handleEventClick}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                className="rounded-lg overflow-hidden"
              />
            </div>
          </motion.div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Found
            </h2>
            {filteredEvents.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No events found for your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                  className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow"
                >
                  <div className="md:w-1/3 relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white" 
                        style={{ backgroundColor: categories.find(cat => cat.id === event.category)?.color }}>
                        {categories.find(cat => cat.id === event.category)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">
                        {event.title}
                      </h3>
                      <button
                        onClick={() => toggleInterest(event.id)}
                        className={`p-2 rounded-full ${
                          userInterested.includes(event.id)
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-gray-400 dark:text-gray-500'
                        } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <Heart size={20} fill={userInterested.includes(event.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={16} />
                        <span>{moment(event.start).format('MMM Do, YYYY')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={16} />
                        <span>{event.organizer}</span>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-3 justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{event.attendees}</span> attending
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{event.interested}</span> interested
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEventClick(event)}
                          className="px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Event Detail Modal */}
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white" 
                    style={{ backgroundColor: categories.find(cat => cat.id === selectedEvent.category)?.color }}>
                    {categories.find(cat => cat.id === selectedEvent.category)?.name}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleInterest(selectedEvent.id)}
                      className={`p-2 rounded-full ${
                        userInterested.includes(selectedEvent.id)
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-gray-400 dark:text-gray-500'
                      } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <Heart size={20} fill={userInterested.includes(selectedEvent.id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Share size={20} />
                    </button>
                    <button
                      className="p-2 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Bell size={20} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon size={20} className="text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">Date & Time</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {moment(selectedEvent.start).format('MMMM Do, YYYY')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={20} className="text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">Location</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedEvent.location}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={20} className="text-yellow-600 dark:text-yellow-400" />
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">Organizer</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedEvent.organizer}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="font-medium text-xl text-gray-800 dark:text-gray-200 mb-3">About This Event</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {selectedEvent.description}
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{selectedEvent.attendees}</span> attending
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{selectedEvent.interested}</span> interested
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      className="px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors"
                    >
                      Register
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Upcoming Events Section (shown on all views) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.slice(0, 3).map(event => (
              <motion.div
                key={event.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span 
                      className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white" 
                      style={{ backgroundColor: categories.find(cat => cat.id === event.category)?.color }}
                    >
                      {categories.find(cat => cat.id === event.category)?.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-300 mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex flex-col gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
                    <div className="flex items-center gap-1">
                      <CalendarIcon size={14} />
                      <span>{moment(event.start).format('MMM Do, YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{moment(event.start).format('h:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleInterest(event.id)}
                      className={`flex items-center gap-1 text-sm ${
                        userInterested.includes(event.id)
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <Heart size={16} fill={userInterested.includes(event.id) ? "currentColor" : "none"} />
                      <span>{event.interested}</span>
                    </button>
                    <button
                      onClick={() => handleEventClick(event)}
                      className="px-3 py-1 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={() => setViewMode('list')}
              className="px-6 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors"
            >
              View All Events
            </button>
          </div>
        </div>

        {/* Add Event Button (fixed position) */}
        <button
          className="fixed bottom-8 right-8 p-4 bg-yellow-500 dark:bg-yellow-600 text-white rounded-full shadow-lg hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}
