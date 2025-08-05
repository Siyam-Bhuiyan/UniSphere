import { Image, List, MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getClubs } from '../api/club.js';
import { getEvents } from '../api/event.js';

const MyClubEvents = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);

  // Fetch all clubs
  const fetchClubs = async () => {
    setLoading(true);
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await getEvents();
      if (Array.isArray(response.data)) {
        setEvents(response.data);
        setFilteredEvents(response.data);
      } else {
        setError('Failed to load events data.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run fetchClubs and fetchEvents on component mount
  useEffect(() => {
    fetchClubs();
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
               Clubs and Events
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl">
              Here are the clubs you're affiliated with, along with their
              events.
            </p>
          </div>

          {/* Search */}
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <List className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search clubs or events..."
                className="block w-full md:w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="p-4 rounded-lg flex items-start bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      )}

      {/* Clubs Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">
           Clubs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.length > 0 ? (
            clubs.map(club => (
              <div
                key={club._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full max-w-sm mx-auto w-full"
              >
                {/* Club Header with Image */}
                <div className="relative h-56 flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  {club.logo && club.logo.trim() !== '' ? (
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full z-20">
                      <Image className="w-16 h-16 text-blue-600 dark:text-blue-400 opacity-60 mb-2" />
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg opacity-70">
                        {club.name}
                      </span>
                    </div>
                  )}

                  {/* Name and Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
                    <h3 className="text-xl font-bold text-white">
                      {club.name}
                    </h3>
                    <p className="text-blue-300 font-medium">{club.category}</p>
                  </div>
                </div>

                {/* Club Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Users className="mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span className="text-sm">
                        {club.members?.length} Members
                      </span>
                    </div>
                  </div>

                  {/* Club Description */}
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                    <p>
                      {club.description && club.description.trim() !== '' ? (
                        club.description.slice(0, 100) +
                        (club.description.length > 100 ? '...' : '')
                      ) : (
                        <span className="italic text-gray-400">
                          No description available.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* View Club Button */}
                  <div className="flex justify-center mt-4">
                    <button className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium px-4 py-2 rounded-lg transition-colors">
                      <List className="w-4 h-4 mr-2" />
                      View Club
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center col-span-full text-gray-500">
              No clubs available.
            </div>
          )}
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <h3 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-4">
          Upcoming Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <div
                key={event._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full max-w-sm mx-auto w-full"
              >
                {/* Event Header with Image */}
                <div className="relative h-56 flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                  {event.imageUrl && event.imageUrl.trim() !== '' ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full z-20">
                      <Image className="w-16 h-16 text-blue-600 dark:text-blue-400 opacity-60 mb-2" />
                      <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg opacity-70">
                        {event.title}
                      </span>
                    </div>
                  )}

                  {/* Name and Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
                    <h3 className="text-xl font-bold text-white">
                      {event.title}
                    </h3>
                    <p className="text-blue-300 font-medium">
                      {new Date(event.startDate).toLocaleDateString()} -{' '}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <MapPin className="mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Users className="mr-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span className="text-sm">
                        {event.attendees?.length} Attendees
                      </span>
                    </div>
                  </div>

                  {/* Event Description */}
                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                    <p>
                      {event.description && event.description.trim() !== '' ? (
                        event.description.slice(0, 100) +
                        (event.description.length > 100 ? '...' : '')
                      ) : (
                        <span className="italic text-gray-400">
                          No description available.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {event.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* View Event Button */}
                  <div className="flex justify-center mt-4">
                    <button className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium px-4 py-2 rounded-lg transition-colors">
                      <List className="w-4 h-4 mr-2" />
                      View Event
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center col-span-full text-gray-500">
              No events available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClubEvents;
