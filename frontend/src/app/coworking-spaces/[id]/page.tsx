'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { FiMapPin, FiUsers, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
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
}

interface BookedSlot {
  timeSlot: string;
  count: number;
}

const timeSlots = [
  '09:00 - 12:00',
  '12:00 - 15:00',
  '15:00 - 18:00',
  '18:00 - 21:00',
];

const CoworkingSpaceDetailPage = ({ params }: { params: { id: string } }) => {
  // Access params directly
  const spaceId = params.id;
  
  const { isAuthenticated, isLoading } = useAuth();
  const [space, setSpace] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (isAuthenticated && spaceId) {
      fetchCoworkingSpace();
    }
  }, [isAuthenticated, isLoading, spaceId, router]);

  useEffect(() => {
    if (selectedDate && space) {
      fetchBookedSlots();
    }
  }, [selectedDate, space, spaceId]);

  const fetchCoworkingSpace = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/coworking-spaces/${spaceId}`);
      setSpace(response.data.data);
      
      // Set default selected date to today
      const today = new Date();
      setSelectedDate(today.toISOString().split('T')[0]);
      
      setError('');
    } catch (err) {
      console.error('Error fetching co-working space:', err);
      setError('Failed to load co-working space details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    if (!spaceId || !selectedDate) return;
    
    try {
      const response = await api.get(`/reservations/booked/${spaceId}/${selectedDate}`);
      setBookedSlots(response.data.data);
    } catch (err) {
      console.error('Error fetching booked slots:', err);
      setError('Failed to load availability. Please try again later.');
    }
  };

  const isSlotAvailable = (timeSlot: string) => {
    if (!space) return false;
    
    // Check if bookedSlots is defined before using .find()
    if (!bookedSlots || !Array.isArray(bookedSlots)) return true;
    
    const bookedSlot = bookedSlots.find(slot => slot.timeSlot === timeSlot);
    return !bookedSlot || bookedSlot.count < space.availableSeats;
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setSelectedTimeSlot('');
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleReservation = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select both date and time slot');
      return;
    }

    try {
      await api.post('/reservations', {
        coworkingSpace: spaceId,
        date: selectedDate,
        timeSlot: selectedTimeSlot
      });
      
      // Show success message
      setReservationSuccess(true);
      setSelectedTimeSlot('');
      
      // Refresh booked slots
      fetchBookedSlots();
    } catch (err: Error | unknown) {
      console.error('Error making reservation:', err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to make reservation. Please try again.');
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

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">Co-working space not found.</p>
          </div>
        </div>
      </div>
    );
  }

  // Default to Bangkok coordinates if invalid
  const hasValidCoordinates = validateCoordinates(space);
  const mapCenter = hasValidCoordinates 
    ? { lat: space.coordinates.coordinates[1], lng: space.coordinates.coordinates[0] }
    : { lat: 13.7563, lng: 100.5018 }; // Default to Bangkok

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-semibold text-gray-900">{space.name}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FiMapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <p>{space.location}</p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <FiUsers className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <p>{space.availableSeats} available seats</p>
            </div>
          </div>
          
          {/* Map section */}
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Location</h2>
              {!hasValidCoordinates && (
                <div className="mb-3 text-sm text-amber-600">
                  <p>Could not display exact location on map</p>
                </div>
              )}
              <Map 
                center={mapCenter}
                markers={hasValidCoordinates ? [{
                  position: mapCenter,
                  title: space.name
                }] : []}
                height="300px"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <FiCalendar className="mr-2" /> Make a Reservation
            </h2>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-sm text-red-600">{error}</div>
              </div>
            )}

            {reservationSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-sm text-green-600">
                  Your reservation has been successfully made! You can view it in your dashboard.
                </div>
              </div>
            )}

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="mt-1 block w-full sm:w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Time Slot
                  </label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {timeSlots.map((timeSlot) => {
                      const isAvailable = isSlotAvailable(timeSlot);
                      return (
                        <button
                          key={timeSlot}
                          type="button"
                          onClick={() => isAvailable && handleTimeSlotSelect(timeSlot)}
                          disabled={!isAvailable}
                          className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium
                            ${
                              selectedTimeSlot === timeSlot
                                ? 'bg-indigo-600 text-white border-transparent'
                                : isAvailable
                                ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            }
                          `}
                        >
                          <FiClock className="mr-2" />
                          {timeSlot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedDate && selectedTimeSlot && (
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleReservation}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Confirm Reservation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoworkingSpaceDetailPage; 