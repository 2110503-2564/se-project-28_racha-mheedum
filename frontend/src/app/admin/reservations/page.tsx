'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { FiArrowLeft, FiUsers, FiMapPin, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Reservation {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  coworkingSpace: {
    _id: string;
    name: string;
    location: string;
  };
  date: string;
  timeSlot: string;
  status: string;
}

const AdminReservationsPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const timeSlots = [
    "09:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
    "18:00 - 21:00"
  ];

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
        return;
      }
      
      if (user && user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      fetchReservations();
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    filterReservations();
  }, [reservations, statusFilter, searchTerm]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservations');
      setReservations(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }
    
    // Apply search filter (case insensitive)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        reservation =>
          reservation.user.name.toLowerCase().includes(term) ||
          reservation.user.email.toLowerCase().includes(term) ||
          reservation.coworkingSpace.name.toLowerCase().includes(term) ||
          reservation.coworkingSpace.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredReservations(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setNewDate(reservation.date.split('T')[0]);
    setNewTimeSlot(reservation.timeSlot);
  };

  const handleUpdate = async () => {
    if (!editingReservation) return;

    try {
      await api.put(`/reservations/${editingReservation._id}`, {
        date: newDate,
        timeSlot: newTimeSlot
      });

      // Update local state
      setFilteredReservations(prevReservations =>
        prevReservations.map(res =>
          res._id === editingReservation._id
            ? { ...res, date: newDate, timeSlot: newTimeSlot }
            : res
        )
      );
      setReservations(prevReservations =>
        prevReservations.map(res =>
          res._id === editingReservation._id
            ? { ...res, date: newDate, timeSlot: newTimeSlot }
            : res
        )
      );

      setEditingReservation(null);
      setSuccessMessage('Reservation updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating reservation:', err);
      setUpdateError('Failed to update reservation. Please try again.');
      setTimeout(() => setUpdateError(''), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) {
      return;
    }

    try {
      await api.delete(`/reservations/${id}`);
      setSuccessMessage('Reservation deleted successfully');
      
      // Update local state
      setFilteredReservations(prev => prev.filter(res => res._id !== id));
      setReservations(prev => prev.filter(res => res._id !== id));
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting reservation:', err);
      setError('Failed to delete reservation. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (editingReservation) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Reservation</h3>
            <div className="mt-2 px-7 py-3">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Time Slot</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              {updateError && (
                <div className="mb-4 text-red-500 text-sm">{updateError}</div>
              )}
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Update
              </button>
              <button
                onClick={() => setEditingReservation(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft className="mr-1" /> Back to Admin Dashboard
          </Link>
        </div>
        
        <div className="lg:flex lg:items-center lg:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              All Reservations
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and manage all reservations in the system
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-sm text-green-600">{successMessage}</div>
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'cancelled')}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border-gray-300 rounded-md"
            >
              <option value="all">All Reservations</option>
              <option value="active">Active Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by user, email, or space..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Reservations</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {filteredReservations.length} reservation(s) found
            </p>
          </div>
          
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">No reservations found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Co-working Space
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date & Time
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiUsers className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reservation.user.name}</div>
                            <div className="text-sm text-gray-500">{reservation.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FiMapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reservation.coworkingSpace.name}</div>
                            <div className="text-sm text-gray-500">{reservation.coworkingSpace.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiCalendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{formatDate(reservation.date)}</div>
                            <div className="text-sm text-gray-500">{reservation.timeSlot}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            reservation.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reservation.status === 'active' ? 'Active' : 'Cancelled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleEdit(reservation)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <FiEdit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reservation._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReservationsPage;