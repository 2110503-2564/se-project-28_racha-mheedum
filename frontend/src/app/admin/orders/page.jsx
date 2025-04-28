'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client'; // Import socket.io client
import { useAuth } from '@/contexts/AuthContext';
import { getAllOrdersAdmin, updateOrder, deleteOrder } from '@/lib/orderApi';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';

// Helper to format price (consider moving to utils)
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

function AdminOrdersPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    // Wait for auth state to load
    if (authLoading) {
      return; 
    }

    // Redirect if not logged in or not an admin
    if (!user || user.role !== 'admin') {
      router.push('/'); // Or to a login page / unauthorized page
      return;
    }

    // Fetch orders if user is admin
    if (token) {
      const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getAllOrdersAdmin(token);
          if (response.success && Array.isArray(response.data)) {
            setOrders(response.data);
          } else {
            throw new Error(response.error || 'Failed to fetch orders or invalid data format');
          }
        } catch (err) {
          console.error("Error fetching all orders:", err);
          setError(err.message || 'Could not fetch orders.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user, token, authLoading, router]);

  // Effect for Socket.IO connection and real-time updates
  useEffect(() => {
    // Only establish connection if user is an admin
    if (user?.role !== 'admin' || !token) {
      return; // Don't connect if not admin or no token
    }

    // Connect to the Socket.IO server
    // IMPORTANT: Use the correct URL for your backend
    const socket = io('http://localhost:5003', {
       withCredentials: true // Important if your backend CORS requires it
    });

    socket.on('connect', () => {
      console.log('Socket connected to server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      // Optionally update UI state to show connection error
    });

    // Listen for new orders emitted from the backend
    socket.on('new_order', (newOrder) => {
      console.log('Received new order via socket:', newOrder);
      // Add the new order to the beginning of the list
      // Ensure data format matches initial fetch if needed
      // Consider adding population on backend emission if needed here
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
    });

    socket.on('order_updated', (updatedOrder) => {
      console.log('Received order update via socket:', updatedOrder);
      setOrders((prevOrders) => 
        prevOrders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    socket.on('order_deleted', (deletedOrderId) => {
      console.log('Received order deletion via socket:', deletedOrderId);
      setOrders((prevOrders) => 
        prevOrders.filter(order => order._id !== deletedOrderId)
      );
    });

    // Cleanup function: Disconnect socket when component unmounts
    return () => {
      console.log('Disconnecting socket...');
      socket.disconnect();
    };

  }, [user, token]); // Re-run effect if user or token changes

  const handleUpdateClick = (order) => {
    setSelectedOrder(order);
    // Initialize quantities with current values
    const initialQuantities = {};
    order.items.forEach(item => {
      initialQuantities[`${order._id}-${item.menuItem._id}`] = item.quantity;
    });
    setItemQuantities(initialQuantities);
    setShowUpdateModal(true);
  };

  const handleQuantityChange = (orderId, itemId, change) => {
    setItemQuantities(prev => {
      const key = `${orderId}-${itemId}`;
      const currentQuantity = prev[key] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [key]: newQuantity };
    });
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      const order = orders.find(o => o._id === orderId);
      const updatedItems = order.items.map(item => ({
        menuItem: item.menuItem._id,
        quantity: itemQuantities[`${orderId}-${item.menuItem._id}`] || 0
      })).filter(item => item.quantity > 0); // Filter out items with zero quantity

      const response = await updateOrder(orderId, { items: updatedItems }, token);
      
      if (response.success) {
        if (response.message === 'Order deleted as it has no items') {
          // Remove the order from the list
          setOrders(prevOrders => prevOrders.filter(o => o._id !== orderId));
          alert('Order deleted as it has no items.');
        } else {
          // Update the local state with the new order data
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order._id === orderId ? response.data : order
            )
          );
          alert('Order updated successfully!');
        }
        setShowUpdateModal(false);
      }
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.message || 'Could not update order.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }
    try {
      await deleteOrder(orderId, token);
      // Refresh orders list
      const response = await getAllOrdersAdmin(token);
      if (response.success && Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      setError(err.message || 'Could not delete order.');
    }
  };

  if (authLoading || loading) {
    return <div className="p-4 text-center">Loading orders...</div>;
  }

  // This check might be redundant due to redirect, but good practice
  if (!user || user.role !== 'admin') {
    return <div className="p-4 text-center text-red-600">Access Denied.</div>; 
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin - All Food Orders</h1>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title={order._id}>{order._id.slice(-6)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>{item.menuItem?.name || 'Unknown Item'} x {item.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPrice(order.totalPrice)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleUpdateClick(order)}
                      className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
                      title="Update Order"
                    >
                      <FiEdit2 className="h-5 w-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      title="Delete Order"
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

      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Update Order #{selectedOrder._id}</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Order Details</h3>
              <p className="text-gray-600">Customer: {selectedOrder.user?.name || 'N/A'} ({selectedOrder.user?.email || 'N/A'})</p>
              <p className="text-gray-600">Order Date: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              <p className="text-gray-600 font-medium">Total: {formatPrice(selectedOrder.totalPrice)}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Menu Items</h3>
              <ul className="space-y-4">
                {selectedOrder.items.map((item, index) => {
                  const currentQuantity = itemQuantities[`${selectedOrder._id}-${item.menuItem._id}`] || item.quantity;
                  const itemTotalPrice = (item.menuItem?.price || 0) * currentQuantity;
                  return (
                    <li key={index} className="border-b py-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{item.menuItem?.name || 'Item unavailable'}</span>
                          <span className="text-sm text-gray-600 block">
                            Original Quantity: {item.quantity}
                          </span>
                          <span className="text-sm text-gray-600 block">
                            Price: {formatPrice(item.menuItem?.price || 0)} each
                          </span>
                          <span className="text-sm font-medium text-blue-600 block">
                            Total: {formatPrice(itemTotalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(selectedOrder._id, item.menuItem._id, -1)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {currentQuantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(selectedOrder._id, item.menuItem._id, 1)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateOrder(selectedOrder._id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage; 