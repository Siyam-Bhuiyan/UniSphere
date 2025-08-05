// src/components/CampusNavigation.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Search,
  Navigation,
  Map,
  Info,
  Compass,
  Layers,
  AlertTriangle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import MapboxMap from "./Map/MapboxMap";
import ARView from "./AR/ARView";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons
const buildingIcon = new L.Icon({
  iconUrl: "/building-icon.png", // Replace with actual path
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const libraryIcon = new L.Icon({
  iconUrl: "/library-icon.png", // Replace with actual path
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Sample campus data
const campusBuildings = [
  {
    id: 1,
    name: "Administrative Building",
    type: "administrative",
    coordinates: [23.948114973032546, 90.37925253472153],
    description:
      "The central hub for university administration and management.",
    facilities: ["Administrative Offices", "Meeting Rooms"],
    hours: "8:00 AM - 4:00 PM",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8e/Structure_of_the_administrative_building.jpg",
    accessibility: true,
    events: ["Administrative Meeting - 10:00 AM"],
  },
  {
    id: 2,
    name: "Central Library",
    type: "library",
    coordinates: [23.94814173569619, 90.37964298257778],
    description:
      "A comprehensive library offering extensive resources and study spaces.",
    facilities: ["Reading Rooms", "Digital Resources", "Archives"],
    hours: "8:00 AM - 10:00 PM",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/A_view_of_IUT.jpg",
    accessibility: true,
    events: ["Research Workshop - 2:00 PM"],
  },
  {
    id: 3,
    name: "First Academic Building",
    type: "academic",
    coordinates: [23.94848295916611, 90.37917932573376],
    description:
      "Houses classrooms and laboratories for various engineering departments.",
    facilities: ["Lecture Halls", "Laboratories", "Faculty Offices"],
    hours: "8:00 AM - 6:00 PM",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/A_view_of_IUT.jpg",
    accessibility: true,
    events: ["Physics Lecture (Room 101) - 9:00 AM"],
  },
  {
    id: 4,
    name: "CDS",
    type: "recreational",
    coordinates: [23.948175189019622, 90.38036531117172],
    description:
      "A place for student activities, dining, and social gatherings.",
    facilities: ["Cafeteria", "Lounges", "Game Room"],
    hours: "9:00 AM - 9:00 PM",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/A_view_of_IUT.jpg",
    accessibility: true,
    events: ["Debate Club Meeting - 5:00 PM"],
  },
  {
    id: 5,
    name: "Masjid E Zainab, IUT",
    type: "religious",
    coordinates: [23.9475316499381, 90.37927741662267],
    description: "A serene place for prayer and reflection within the campus.",
    facilities: ["Prayer Hall", "Ablution Area"],
    hours: "Open during prayer times",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwhmTOTfTjifLtc54zp4J4YxT2XKiIHHXI2UuUnvr3V9WSW3ZCG6pNQzHh7htqrk7V9MI&usqp=CAU",
    accessibility: true,
    events: ["Friday Sermon - 1:00 PM"],
  },
  {
    id: 6,
    name: "Second Academic Building",
    type: "academic",
    coordinates: [23.948937940662567, 90.37922477970379],
    description:
      "A modern facility equipped with advanced laboratories and lecture halls.",
    facilities: ["Laboratories", "Lecture Halls"],
    hours: "8:00 AM - 6:00 PM",
    image:
      "https://www.iutoic-dhaka.edu/assets/images/second_academic_building.jpg",
    accessibility: true,
    events: ["Chemistry Lab Session (Lab 3) - 2:00 PM"],
  },
  {
    id: 7,
    name: "Third Academic Building",
    type: "academic",
    coordinates: [23.949017989978323, 90.3777367955881],
    description:
      "Dedicated to research and postgraduate studies with specialized facilities.",
    facilities: ["Research Labs", "Postgraduate Study Rooms"],
    hours: "8:00 AM - 6:00 PM",
    image:
      "https://www.iutoic-dhaka.edu/assets/images/third_academic_building.jpg",
    accessibility: true,
    events: ["Research Seminar - 3:00 PM"],
  },
  {
    id: 9,
    name: "North Hall of Residence",
    type: "residential",
    coordinates: [23.94854241625172, 90.38013575271341],
    description:
      "Accommodation facility for male students with fully furnished rooms.",
    facilities: ["Dormitories", "Common Rooms", "Study Areas"],
    hours: "24/7",
    image: "https://www.iutoic-dhaka.edu/assets/images/north_hall.jpg",
    accessibility: true,
    events: ["Hall Meeting - 8:00 PM"],
  },
  {
    id: 10,
    name: "South Hall of Residence",
    type: "residential",
    coordinates: [23.94700090458333, 90.38009004610988],
    description:
      "Another accommodation facility for male students with modern amenities.",
    facilities: ["Dormitories", "Recreation Rooms", "Laundry Facilities"],
    hours: "24/7",
    image: "https://www.iutoic-dhaka.edu/assets/images/south_hall.jpg",
    accessibility: true,
    events: ["Movie Night - 9:00 PM"],
  },
  {
    id: 11,
    name: "Female Hall of Residence",
    type: "residential",
    coordinates: [23.947147274302093, 90.37726046429204],
    description:
      "Accommodation facility for female students with secure and comfortable living spaces.",
    facilities: ["Dormitories", "Common Rooms", "Study Areas"],
    hours: "24/7",
    image: "https://www.iutoic-dhaka.edu/assets/images/female_hall.jpg",
    accessibility: true,
    events: ["Yoga Session - 6:00 PM"],
  },
  {
    id: 12,
    name: "Central Cafeteria",
    type: "dining",
    coordinates: [23.94790088298137, 90.37982207811837],
    description:
      "Main dining facility offering a variety of meals for students and staff.",
    facilities: ["Dining Hall", "Food Stalls", "Seating Area"],
    hours: "7:00 AM - 10:00 PM",
    image: "https://www.iutoic-dhaka.edu/assets/images/central_cafeteria.jpg",
    accessibility: true,
    events: ["Special Dinner - 7:00 PM"],
  },
  {
    id: 13,
    name: "Auditorium",
    type: "event",
    coordinates: [23.947695819688935, 90.37903319079666],
    description:
      "A multi-purpose auditorium for seminars, cultural functions, and examinations.",
    facilities: ["Stage", "Seating for 600", "Projection Facilities"],
    hours: "8:00 AM - 8:00 PM",
    image: "https://www.iutoic-dhaka.edu/assets/images/auditorium.jpg",
    accessibility: true,
    events: ["Annual Cultural Fest - 5:00 PM"],
  },
];

// Component to recenter map on location change
function SetViewOnClick({ coords }) {
  const map = useMap();
  map.setView(coords, map.getZoom());
  return null;
}

// AR Mode helper component
function ARModeComponent() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Could not access camera: ", err);
        });
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div className="text-center bg-black bg-opacity-50 p-4 rounded-lg">
          <p className="text-white text-lg">
            Point your camera at campus buildings
          </p>
          <p className="text-yellow-300 text-sm mt-2">
            AR navigation currently in demo mode
          </p>
        </div>
      </div>
    </div>
  );
}

// Add new RouteSelector component
const RouteSelector = ({
  userLocation,
  buildings,
  onRouteSelect,
  startLocation,
  endLocation,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-medium text-yellow-600 mb-4">
        Plan Your Route
      </h3>

      <div className="space-y-4">
        {/* Start Location Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Location
          </label>
          <select
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            value={startLocation ? JSON.stringify(startLocation) : ""}
            onChange={(e) =>
              onRouteSelect(
                "start",
                e.target.value ? JSON.parse(e.target.value) : null
              )
            }
          >
            <option value="">Select start point...</option>
            <option value={JSON.stringify(userLocation)}>
              📍 My Current Location
            </option>
            {buildings.map((building) => (
              <option
                key={`start-${building.id}`}
                value={JSON.stringify(building.coordinates)}
              >
                🏢 {building.name}
              </option>
            ))}
          </select>
        </div>

        {/* End Location Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Destination
          </label>
          <select
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700"
            value={endLocation ? JSON.stringify(endLocation) : ""}
            onChange={(e) =>
              onRouteSelect(
                "end",
                e.target.value ? JSON.parse(e.target.value) : null
              )
            }
          >
            <option value="">Select destination...</option>
            {buildings.map((building) => (
              <option
                key={`end-${building.id}`}
                value={JSON.stringify(building.coordinates)}
              >
                🏢 {building.name}
              </option>
            ))}
          </select>
        </div>

        {startLocation && endLocation && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onRouteSelect("clear")}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg"
            >
              Clear Route
            </button>
            <button
              onClick={() => onRouteSelect("swap")}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
            >
              Swap Points
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CampusNavigation() {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBuildings, setFilteredBuildings] = useState(campusBuildings);
  const [mapCenter, setMapCenter] = useState([34.0522, -118.2437]);
  const [activeMode, setActiveMode] = useState("map"); // "map", "ar", "directions"
  const [activeFilter, setActiveFilter] = useState("all");
  const [showARWarning, setShowARWarning] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: 90.37925253472153,
    latitude: 23.948114973032546,
    zoom: 17,
  });
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [arPermissionGranted, setArPermissionGranted] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [routeStart, setRouteStart] = useState(null);
  const [routeEnd, setRouteEnd] = useState(null);

  // Filter buildings based on search query and type filter
  useEffect(() => {
    let results = campusBuildings;

    // Filter by search query
    if (searchQuery) {
      results = results.filter(
        (building) =>
          building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          building.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by building type
    if (activeFilter !== "all") {
      results = results.filter((building) => building.type === activeFilter);
    }

    setFilteredBuildings(results);
  }, [searchQuery, activeFilter]);

  // Get user location
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      setIsLocatingUser(true);

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      const success = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationAccuracy(position.coords.accuracy);

        setViewState((prev) => ({
          ...prev,
          latitude,
          longitude,
          zoom: 17,
        }));

        setIsLocatingUser(false);
      };

      const error = (err) => {
        setIsLocatingUser(false);
        console.warn(`ERROR(${err.code}): ${err.message}`);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            alert(
              "Please enable location access in your browser settings to use this feature."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            alert(
              "Location information is unavailable. Please check your device's GPS settings."
            );
            break;
          case err.TIMEOUT:
            alert("Location request timed out. Please try again.");
            break;
          default:
            alert("An unknown error occurred while getting your location.");
        }
      };

      // Get initial position
      navigator.geolocation.getCurrentPosition(success, error, options);

      // Watch position for updates
      const watchId = navigator.geolocation.watchPosition(
        success,
        error,
        options
      );

      // Cleanup
      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    };

    getLocation();
  }, []); // Empty dependency array means this runs once on mount

  // Update the location tracking function
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationAccuracy(position.coords.accuracy);

        setViewState({
          longitude,
          latitude,
          zoom: 17,
        });

        setIsLocatingUser(false);
      },
      (error) => {
        setIsLocatingUser(false);
        alert(
          "Could not get your location. Please check your device settings."
        );
        console.error("Error getting location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Add this function to check camera permissions
  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setArPermissionGranted(true);
      setActiveMode("ar");
    } catch (err) {
      console.error("Camera permission denied:", err);
      alert("Camera access is required for AR navigation");
    }
  };

  // Handle AR mode activation
  const handleARMode = () => {
    if (!arPermissionGranted) {
      checkCameraPermissions();
    } else {
      setShowARWarning(true);
      setTimeout(() => {
        setShowARWarning(false);
        setActiveMode("ar");
      }, 2000);
    }
  };

  // Handle building selection
  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building);
    setMapCenter(building.coordinates);
  };

  // Get icon based on building type
  const getBuildingIcon = (type) => {
    switch (type) {
      case "library":
        return libraryIcon;
      default:
        return buildingIcon;
    }
  };

  // Add this function to handle route selection
  const handleRouteSelect = (building) => {
    if (!routeStart) {
      setRouteStart(building ? building.coordinates : userLocation);
    } else if (!routeEnd) {
      setRouteEnd(building.coordinates);
    } else {
      // Reset and start new route
      setRouteStart(building.coordinates);
      setRouteEnd(null);
    }
  };

  // Add new route selection handler
  const handleRouteSelection = (type, value) => {
    switch (type) {
      case "start":
        setRouteStart(value);
        break;
      case "end":
        setRouteEnd(value);
        break;
      case "clear":
        setRouteStart(null);
        setRouteEnd(null);
        break;
      case "swap":
        const temp = routeStart;
        setRouteStart(routeEnd);
        setRouteEnd(temp);
        break;
    }
  };

  // Modify the renderMapView function
  const renderMapView = () => (
    <div className="h-[calc(100vh-12rem)] flex flex-col lg:flex-row gap-4">
      {/* Side Panel - Route Selection & Building List */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <RouteSelector
          userLocation={userLocation}
          buildings={campusBuildings}
          onRouteSelect={handleRouteSelection}
          startLocation={routeStart}
          endLocation={routeEnd}
        />

        {/* Building List */}
        <div className="flex-1 overflow-hidden">
          <div className="p-3 bg-yellow-500 dark:bg-yellow-600 text-white rounded-t-lg">
            <h3 className="text-lg font-semibold flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Campus Buildings
            </h3>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-36rem)]">
            {filteredBuildings.map((building) => (
              <motion.div
                key={building.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleBuildingSelect(building)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-yellow-50 dark:hover:bg-gray-700 ${
                  selectedBuilding?.id === building.id
                    ? "bg-yellow-100 dark:bg-gray-700"
                    : ""
                }`}
              >
                <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-300">
                  {building.name}
                </h3>
                <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-4">
                    <Info className="w-4 h-4 inline mr-1" />
                    {building.type.charAt(0).toUpperCase() +
                      building.type.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden shadow-lg min-h-[600px]">
        <MapboxMap
          buildings={filteredBuildings}
          selectedBuilding={selectedBuilding}
          userLocation={userLocation}
          onBuildingSelect={setSelectedBuilding}
          viewState={viewState}
          onViewStateChange={setViewState}
          routeStart={routeStart}
          routeEnd={routeEnd}
        />

        {/* Map Controls - Positioned absolutely over the map */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={getUserLocation}
            className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-3 rounded-lg shadow-lg transition-all"
            title="Center on my location"
          >
            <Navigation className="w-5 h-5 text-yellow-600" />
          </button>
          {routeStart && routeEnd && (
            <button
              onClick={() => {
                setRouteStart(null);
                setRouteEnd(null);
              }}
              className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 p-3 rounded-lg shadow-lg transition-all"
              title="Clear route"
            >
              <X className="w-5 h-5 text-red-500" />
            </button>
          )}
        </div>

        {/* Route Status Overlay */}
        {(routeStart || routeEnd) && (
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg max-w-sm">
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">
                  From: {getLocationName(routeStart)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-medium">
                  To: {getLocationName(routeEnd)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Add helper function to get location name
  const getLocationName = (coords) => {
    if (!coords) return "Not selected";
    if (
      userLocation &&
      coords[0] === userLocation[0] &&
      coords[1] === userLocation[1]
    ) {
      return "My Current Location";
    }
    const building = campusBuildings.find(
      (b) => b.coordinates[0] === coords[0] && b.coordinates[1] === coords[1]
    );
    return building ? building.name : "Custom Location";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-[1920px] mx-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <header className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg">
          <h1 className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
            Campus Navigation
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Explore the campus with our interactive map and AR navigation
          </p>
        </header>

        {/* Navigation Controls */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveMode("map")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeMode === "map"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              } transition-colors duration-200`}
            >
              <Map className="w-5 h-5 mr-2" />
              Map View
            </button>
            <button
              onClick={handleARMode}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeMode === "ar"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              } transition-colors duration-200`}
            >
              <Compass className="w-5 h-5 mr-2" />
              AR Navigation
            </button>
            <button
              onClick={() => setActiveMode("directions")}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeMode === "directions"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              } transition-colors duration-200`}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search buildings, facilities..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-2 rounded-lg ${
                  activeFilter === "all"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                } transition-colors duration-200`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("academic")}
                className={`px-3 py-2 rounded-lg ${
                  activeFilter === "academic"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                } transition-colors duration-200`}
              >
                Academic
              </button>
              <button
                onClick={() => setActiveFilter("library")}
                className={`px-3 py-2 rounded-lg ${
                  activeFilter === "library"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                } transition-colors duration-200`}
              >
                Library
              </button>
              <button
                onClick={() => setActiveFilter("recreational")}
                className={`px-3 py-2 rounded-lg ${
                  activeFilter === "recreational"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                } transition-colors duration-200`}
              >
                Recreational
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {activeMode === "map" && renderMapView()}
        {activeMode === "ar" && (
          <div className="h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <ARView buildings={filteredBuildings} userLocation={userLocation} />
          </div>
        )}
        {activeMode === "directions" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-[600px]">
            <div className="p-4 bg-yellow-500 dark:bg-yellow-600 text-white">
              <h3 className="text-xl font-semibold flex items-center"></h3>
              <Navigation className="w-5 h-5 mr-2" />
              Directions
            </div>

            <div className="p-6">
              {selectedBuilding ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-medium text-yellow-700 dark:text-yellow-300">
                      Directions to {selectedBuilding.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {!userLocation
                        ? "Please enable location services to get directions."
                        : "Directions from your current location:"}
                    </p>
                  </div>

                  {userLocation && (
                    <div className="mt-4">
                      <div className="flex items-start p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                        <div className="mr-4 mt-1">
                          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                            1
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                            Start at your current location
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Head east toward University Avenue
                          </p>
                        </div>
                      </div>

                      <div className="h-10 w-1 bg-yellow-200 dark:bg-gray-600 ml-8"></div>

                      <div className="flex items-start p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                        <div className="mr-4 mt-1">
                          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                            2
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                            Continue straight for 200 meters
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Pass the Student Union on your right
                          </p>
                        </div>
                      </div>

                      <div className="h-10 w-1 bg-yellow-200 dark:bg-gray-600 ml-8"></div>

                      <div className="flex items-start p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                        <div className="mr-4 mt-1">
                          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                            3
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                            Turn left at the fountain
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Walk 150 meters toward the quad
                          </p>
                        </div>
                      </div>

                      <div className="h-10 w-1 bg-yellow-200 dark:bg-gray-600 ml-8"></div>

                      <div className="flex items-start p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                        <div className="mr-4 mt-1">
                          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <Check className="h-5 w-5" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-600 dark:text-green-400">
                            Arrive at {selectedBuilding.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Your destination is on the right
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setActiveMode("map")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded flex items-center"
                    >
                      <Map className="w-5 h-5 mr-2" />
                      View on Map
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Map className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                    Select a building to get directions
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                    Choose a location from the list on the left to view detailed
                    walking directions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Building Details (when selected) */}
        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-4 bg-yellow-500 dark:bg-yellow-600 text-white flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {selectedBuilding.name} Details
              </h3>
              <button
                onClick={() => setSelectedBuilding(null)}
                className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* About Section */}
              <div>
                <h3 className="text-xl font-medium text-yellow-700 dark:text-yellow-300">
                  About {selectedBuilding.name}
                </h3>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  {selectedBuilding.description}
                </p>
              </div>

              {/* Facilities Section */}
              <div>
                <h4 className="text-lg font-medium text-yellow-700 dark:text-yellow-300 mb-3">
                  Available Facilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBuilding.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-yellow-50 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveMode("directions")}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </button>

                <button
                  // onClick={handleARMode}
                  onClick={() => setActiveMode("directions")}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </button>

                <button
                  onClick={handleARMode}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Compass className="w-5 h-5" />
                  AR View
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* AR Warning Modal */}
        {showARWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-lg">
              <div className="flex items-center mb-4 text-yellow-500">
                <AlertTriangle className="w-8 h-8 mr-3" />
                <h3 className="text-xl font-bold">AR Mode Activating</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                AR mode uses your camera to provide navigation assistance.
                Please allow camera access and point your device at campus
                buildings to see information overlaid on your view.
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                  className="h-full bg-yellow-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Campus Legend and Help Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-semibold text-yellow-700 dark:text-yellow-300 mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2" />
            Campus Navigation Guide
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 mb-3">
                Map Legend
              </h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Your Current Location
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Academic Buildings
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Library
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-gray-700 dark:text-gray-300">
                    Recreational Facilities
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-yellow-600 dark:text-yellow-400 mb-3">
                Navigation Tips
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 w-6 h-6 rounded-full flex items-center justify-center mr-2 shrink-0">
                    1
                  </span>
                  <span>
                    Use the search bar to quickly find specific buildings or
                    facilities.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 w-6 h-6 rounded-full flex items-center justify-center mr-2 shrink-0">
                    2
                  </span>
                  <span>
                    Filter buildings by type using the category buttons.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 w-6 h-6 rounded-full flex items-center justify-center mr-2 shrink-0">
                    3
                  </span>
                  <span>
                    Click on a building marker to view detailed information.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 w-6 h-6 rounded-full flex items-center justify-center mr-2 shrink-0">
                    4
                  </span>
                  <span>
                    Try AR mode for an immersive navigation experience.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components for missing imports
function Check(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function Clock(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
}

function Eye(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function Headphones(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
  );
}

function SearchX(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      <line x1="17" y1="17" x2="21" y2="21"></line>
    </svg>
  );
}

function Wheelchair(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="14" cy="6" r="2"></circle>
      <path d="M10 9h4l-3 6"></path>
      <circle cx="8" cy="17" r="5"></circle>
      <path d="m17 15-2 4"></path>
      <path d="m22 18-5-3"></path>
    </svg>
  );
}

function X(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function Loader(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}
