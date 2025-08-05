import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
  FaAmbulance,
  FaBullhorn,
  FaCarCrash,
  FaCheckCircle,
  FaCloudShowersHeavy,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaFire,
  FaInfoCircle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaShieldAlt,
} from 'react-icons/fa';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { createAlert } from '../api/Alert';

// Custom marker icon - ensures the marker displays correctly
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Component to handle map clicks and events
function MapEventHandler({ onLocationUpdate }) {
  const map = useMapEvents({
    click: async e => {
      const { lat, lng } = e.latlng;
      onLocationUpdate({ lat, lng });

      // Fetch address for the clicked location
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();
        if (data.display_name) {
          onLocationUpdate({ lat, lng, address: data.display_name });
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      }
    },
  });

  return null;
}

// Add this helper component to programmatically move the map center
function FlyToLocation({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const Alert = () => {
  const [location, setLocation] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [message, setMessage] = useState('');
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  // New state for location search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.838282, 90.35723]);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef(null);

  const emergencyCategories = [
    {
      id: 'fire',
      label: 'Fire Emergency',
      color: 'bg-red-500',
      icon: <FaFire className="text-2xl mb-2" />,
    },
    {
      id: 'medical',
      label: 'Medical Emergency',
      color: 'bg-blue-500',
      icon: <FaAmbulance className="text-2xl mb-2" />,
    },
    {
      id: 'harassment',
      label: 'Harassment',
      color: 'bg-purple-500',
      icon: <FaShieldAlt className="text-2xl mb-2" />,
    },
    {
      id: 'accident',
      label: 'Accident',
      color: 'bg-yellow-500',
      icon: <FaCarCrash className="text-2xl mb-2" />,
    },
    {
      id: 'security',
      label: 'Security Threat',
      color: 'bg-orange-500',
      icon: <FaExclamationCircle className="text-2xl mb-2" />,
    },
    {
      id: 'natural',
      label: 'Natural Disaster',
      color: 'bg-teal-500',
      icon: <FaCloudShowersHeavy className="text-2xl mb-2" />,
    },
  ];

  const emergencyGuidelines = {
    fire: [
      'Evacuate the building immediately',
      'Pull the fire alarm',
      'Call campus security',
      'Do not use elevators',
    ],
    medical: [
      'Call emergency services',
      "Don't move the injured person",
      'Apply first aid if qualified',
      'Clear the area',
    ],
    harassment: [
      'Move to a safe location',
      'Document the incident',
      'Contact campus security',
      'Preserve any evidence',
    ],
    accident: [
      'Check for injuries',
      'Call emergency services',
      'Document the scene',
      'Exchange information if vehicle-related',
    ],
    security: [
      'Find safe shelter',
      'Lock doors and windows',
      'Stay quiet',
      'Follow authority instructions',
    ],
    natural: [
      'Move to designated shelter',
      'Stay away from windows',
      'Follow evacuation routes',
      'Monitor emergency broadcasts',
    ],
  };

  const emergencyContacts = [
    {
      title: 'Campus Security (24/7)',
      number: '080-2293-2400',
      icon: <FaShieldAlt className="text-2xl text-red-500" />,
    },
    {
      title: 'Medical Emergency',
      number: '080-2293-2501',
      icon: <FaAmbulance className="text-2xl text-blue-500" />,
    },
    {
      title: 'Fire Emergency',
      number: '080-2293-2333',
      icon: <FaFire className="text-2xl text-orange-500" />,
    },
    {
      title: 'Emergency Helpline',
      number: '112',
      icon: <FaPhone className="text-2xl text-green-500" />,
    },
  ];

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          setMapCenter([newLocation.lat, newLocation.lng]);
          setZoom(17);
          fetchAddressForCoordinates(newLocation.lat, newLocation.lng);
        },
        error => {
          console.error('Error getting location:', error);
        },
      );
    }
  }, []);

  // Fetch address for coordinates
  const fetchAddressForCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      );
      const data = await response.json();
      if (data.display_name) {
        setLocation(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Search for locations by name
  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}&limit=5`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = e => {
    e.preventDefault();
    searchLocations();
  };

  // Handle selecting a search result
  const handleSelectSearchResult = result => {
    const newLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name,
    };
    setLocation(newLocation);
    setMapCenter([newLocation.lat, newLocation.lng]);
    setZoom(17);
    setSearchResults([]);
  };

  // Handle location update from map click
  const handleLocationUpdate = newLocation => {
    setLocation(newLocation);
  };

  // Handler for green arrow button
  const handleGoToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
          setMapCenter([newLocation.lat, newLocation.lng]);
          setZoom(17);
          fetchAddressForCoordinates(newLocation.lat, newLocation.lng);
        },
        error => {
          console.error('Error getting location:', error);
        },
      );
    }
  };

  const startSOS = () => {
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          sendEmergencyAlert();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(null);
    setIsSOSActive(false);
    setMessage('');
    setSelectedCategory('');
    setLoading(false);
  };

  const sendEmergencyAlert = async () => {
    setIsSOSActive(true);
    setLoading(true);

    // Get the user ID from your auth context or local storage
    const userId = localStorage.getItem('userId'); // Adjust based on your auth setup

    const alertData = {
      category: selectedCategory,
      message: message || `Emergency alert: ${selectedCategory}`,
      location: location || { lat: 0, lng: 0 },
      address: location?.address,
      status: 'active',
      user: userId, // Add the user ID
    };

    try {
      const response = await createAlert(alertData);
      console.log('Alert created:', response);
      alert('Emergency alert has been sent to campus security.');
    } catch (error) {
      console.error('Error sending alert:', error);
      setIsSOSActive(false);
      alert(
        'Failed to send emergency alert. Please call emergency services directly.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Emergency Header - Modified */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-4xl mr-4" />
              <div>
                <h1 className="text-3xl font-bold">Emergency Alert System</h1>
                <p className="text-lg opacity-90">
                  Quick response system for campus emergencies
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm">Status: </span>
                <span className="font-semibold">System Active</span>
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full ml-2"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Map and Categories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Container with Search */}
            <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
              {/* Search Bar */}
              <div className="p-4 bg-gray-700">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search for a location..."
                      className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <div
                            key={`${result.place_id}-${index}`}
                            className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 text-white"
                            onClick={() => handleSelectSearchResult(result)}
                          >
                            <div className="flex items-start">
                              <FaMapMarkerAlt className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                              <span>{result.display_name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 flex items-center justify-center"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : <FaSearch />}
                  </button>
                  <button
                    type="button"
                    onClick={handleGoToCurrentLocation}
                    className="bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 flex items-center justify-center"
                  >
                    <FaLocationArrow />
                  </button>
                </form>
              </div>

              {/* Map Container */}
              <div className="h-[400px] w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={zoom}
                  ref={mapRef}
                  style={{ height: '100%', width: '100%' }}
                  className="dark-map"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <FlyToLocation center={mapCenter} zoom={zoom} />
                  <MapEventHandler onLocationUpdate={handleLocationUpdate} />
                  {location && (
                    <Marker
                      position={[location.lat, location.lng]}
                      icon={customIcon}
                    >
                      <Popup>{location.address || 'Selected location'}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>

              {/* Selected Location Display */}
              {location?.address && (
                <div className="p-4 bg-gray-700 border-t border-gray-600">
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-white mb-1">
                          Selected Location
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {location.address}
                        </p>
                        <div className="mt-2 text-xs text-gray-400">
                          Coordinates: {location.lat.toFixed(6)},{' '}
                          {location.lng.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Categories with Guidelines */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <FaBullhorn className="mr-2 text-red-500" />
                Select Emergency Type
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {emergencyCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-6 rounded-xl ${
                      category.color
                    } text-white transition-all transform hover:scale-105 
                      flex flex-col items-center justify-center text-center
                      ${
                        selectedCategory === category.id
                          ? 'ring-4 ring-offset-2'
                          : ''
                      }`}
                  >
                    {category.icon}
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Emergency Guidelines - Moved here */}
              {selectedCategory && (
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                    <FaInfoCircle className="mr-2 text-blue-500" />
                    Emergency Guidelines
                  </h3>
                  <ul className="space-y-3">
                    {emergencyGuidelines[selectedCategory].map(
                      (guideline, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-300"
                        >
                          <span className="w-6 h-6 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center mr-3 text-sm">
                            {index + 1}
                          </span>
                          {guideline}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Modified */}
          <div className="space-y-6">
            {/* Emergency Contacts - New Section */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-white">
                <FaPhone className="mr-2 text-red-500" />
                Emergency Contacts
              </h2>
              <div className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {contact.icon}
                      <h3 className="text-white font-medium">
                        {contact.title}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      {contact.description}
                    </p>
                    <a
                      href={`tel:${contact.number}`}
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                    >
                      <FaPhone className="text-sm" />
                      <span className="font-mono">{contact.number}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Additional Details
              </h2>
              <textarea
                className="w-full p-4 border rounded-lg bg-gray-700 text-white border-gray-600 
                  focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
                rows="4"
                placeholder="Provide specific details about the emergency..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />

              {/* SOS Button or Countdown with Cancel */}
              {!isSOSActive ? (
                countdown ? (
                  <div className="flex flex-col items-center">
                    <div className="text-5xl font-bold animate-pulse">
                      {countdown}
                    </div>
                    <button
                      onClick={cancelSOS}
                      className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startSOS}
                    disabled={!selectedCategory || loading || !location}
                    className={`w-full ${
                      loading || !location
                        ? 'bg-gray-500'
                        : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400'
                    } text-white rounded-lg py-4 flex items-center justify-center gap-3
                    transition-all transform hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg hover:shadow-red-500/50`}
                  >
                    {loading ? (
                      <span>Sending Alert...</span>
                    ) : !location ? (
                      <span>Select a location first</span>
                    ) : (
                      <>
                        <FaExclamationTriangle className="text-2xl" />
                        <span className="text-xl font-bold tracking-wider">
                          SOS
                        </span>
                      </>
                    )}
                  </button>
                )
              ) : (
                <div className="space-y-3">
                  <div className="bg-red-900/30 p-3 rounded-lg">
                    <p className="text-red-200 text-center font-medium">
                      Emergency Alert Active
                    </p>
                  </div>
                  <button
                    onClick={cancelSOS}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg 
                      flex items-center justify-center gap-2 font-bold transition-all"
                  >
                    Cancel Emergency Alert
                  </button>
                </div>
              )}

              {isSOSActive && (
                <div className="mt-4 p-4 bg-red-900/50 rounded-lg">
                  <p className="text-red-200 text-sm text-center">
                    Alert is active. Campus security has been notified.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
