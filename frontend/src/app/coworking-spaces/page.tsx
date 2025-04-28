'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { FiMapPin, FiUsers, FiArrowRight, FiNavigation, FiMap } from 'react-icons/fi';
import { calculateDistance, getCurrentLocation } from '@/lib/googleMaps';
import Map from '@/components/Map';

interface CoworkingSpace {
  _id: string;
  name: string;
  location: string;
  availableSeats: number;
  coordinates: {
    type: string;
    coordinates: [number, number];
  };
  distance?: number; // Add distance property
}

const CoworkingSpacesPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<CoworkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [sortByNearest, setSortByNearest] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated) {
      fetchCoworkingSpaces();
    }
  }, [isAuthenticated, isLoading, router]);

  // Update filtered spaces whenever spaces or sorting changes
  useEffect(() => {
    let sorted = [...spaces];
    if (sortByNearest && userLocation) {
      sorted = sorted.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    setFilteredSpaces(sorted);
  }, [spaces, sortByNearest, userLocation]);

  const fetchCoworkingSpaces = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coworking-spaces');
      setSpaces(response.data.data);
      setFilteredSpaces(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching co-working spaces:', err);
      setError('Failed to load co-working spaces. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate coordinates
  const validateCoordinates = (space: CoworkingSpace) => {
    if (!space || !space.coordinates || !space.coordinates.coordinates) {
      return false;
    }
    
    const [lng, lat] = space.coordinates.coordinates;
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' && 
      !isNaN(lat) && 
      !isNaN(lng) && 
      lat >= -90 && 
      lat <= 90 && 
      lng >= -180 && 
      lng <= 180
    );
  };

  const handleFindNearest = async () => {
    try {
      setLocationError('');
      setSortByNearest(true);
      
      const position = await getCurrentLocation();
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      setUserLocation({ lat: userLat, lng: userLng });
      
      // Calculate distance for each space
      const spacesWithDistance = spaces.map(space => {
        // Skip spaces with invalid coordinates
        if (!validateCoordinates(space)) {
          return { ...space, distance: Infinity };
        }

        const spaceLat = space.coordinates.coordinates[1];
        const spaceLng = space.coordinates.coordinates[0];
        const distance = calculateDistance(userLat, userLng, spaceLat, spaceLng);
        return { ...space, distance };
      });
      
      // Sort by distance
      const sortedSpaces = spacesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      setSpaces(sortedSpaces);
    } catch (err) {
      console.error('Error getting user location:', err);
      setLocationError('Unable to access your location. Please enable location services and try again.');
    }
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Filter out spaces with invalid coordinates for the map view
  const validSpacesForMap = filteredSpaces.filter(validateCoordinates);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Co-Working Spaces
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Find and book your perfect workspace from our list of available locations.
            </p>
          </div>
          <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
            <button
              onClick={handleFindNearest}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={sortByNearest}
            >
              <FiNavigation className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              {sortByNearest ? 'Sorted by Nearest' : 'Find Nearest'}
            </button>
            <button
              onClick={toggleMapView}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiMap className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              {showMap ? 'List View' : 'Map View'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {locationError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{locationError}</div>
          </div>
        )}

        {showMap ? (
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg border border-gray-200 p-4">
              {validSpacesForMap.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No co-working spaces with valid coordinates available.</p>
                </div>
              ) : (
                <>
                  {validSpacesForMap.length < filteredSpaces.length && (
                    <div className="mb-4 text-sm text-amber-600">
                      <p>Some spaces are not shown on the map due to invalid coordinates.</p>
                    </div>
                  )}
                  <Map
                    center={userLocation || { lat: 13.7563, lng: 100.5018 }} // Default to Bangkok if no user location
                    markers={validSpacesForMap.map(space => ({
                      position: {
                        lat: space.coordinates.coordinates[1],
                        lng: space.coordinates.coordinates[0]
                      },
                      title: space.name,
                      onClick: () => router.push(`/coworking-spaces/${space._id}`)
                    }))}
                    height="600px"
                  />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpaces.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No co-working spaces available at the moment.</p>
              </div>
            ) : (
              filteredSpaces.map((space) => (
                <div
                  key={space._id}
                  className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 relative pb-16"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{space.name}</h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiMapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>{space.location}</p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FiUsers className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>{space.availableSeats} available seats</p>
                    </div>
                    {space.distance !== undefined && space.distance !== Infinity && (
                      <div className="mt-2 flex items-center text-sm text-indigo-600 font-medium">
                        <FiNavigation className="flex-shrink-0 mr-1.5 h-5 w-5 text-indigo-500" />
                        <p>{space.distance.toFixed(1)} km away</p>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <Link
                        href={`/coworking-spaces/${space._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        View Details <FiArrowRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoworkingSpacesPage;