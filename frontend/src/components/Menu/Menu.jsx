'use client'; // This is a Client Component

import React, { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';

// Helper for formatting price
const formatPrice = (price) => {
  if (price == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function Menu({ onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/menu');
        if (!response.ok) {
          let msg = `HTTP error! status: ${response.status}`;
          try {
            const errData = await response.json();
            msg = errData.error || errData.message || msg;
          } catch {};
          throw new Error(msg);
        }
        const data = await response.json();
        setMenuItems(Array.isArray(data) ? data : []);
        // Initialize quantities
        const initQ = {};
        data.forEach(item => { initQ[item._id] = 0; });
        setItemQuantities(initQ);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(`Error fetching menu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleQuantityChange = (itemId, change) => {
    setItemQuantities(prev => {
      const newQ = Math.max(0, (prev[itemId] || 0) + change);
      return { ...prev, [itemId]: newQ };
    });
  };

  const handleAdd = (item) => {
    if (!item.isAvailable) return;            // Block if unavailable
    if (itemQuantities[item._id] > 0) {
      onAddToCart({ ...item, quantity: itemQuantities[item._id] });
      setItemQuantities(prev => ({ ...prev, [item._id]: 0 }));
    }
  };

  if (loading) return <div role="status" aria-live="polite">Loading menu...</div>;
  if (error)   return <div role="alert" className="text-red-600">{error}</div>;
  if (!menuItems.length) return <div>No menu items currently available.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {menuItems.map(item => (
        <div key={item._id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-xl transition-shadow">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-2 text-gray-800">{item.name}</h3>
            <p className="text-gray-600 mb-4 text-lg">{item.description}</p>

            {/* Status badge */}
            <div className="mb-4">
              <span className={`px-2 inline-flex text-sm font-semibold rounded-full ${
                item.isAvailable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-blue-600">{formatPrice(item.price)}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item._id, -1)}
                  disabled={!item.isAvailable}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-12 text-center text-xl font-medium">{itemQuantities[item._id] || 0}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, 1)}
                  disabled={!item.isAvailable}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => handleAdd(item)}
              disabled={!item.isAvailable || !itemQuantities[item._id]}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {item.isAvailable ? 'Add to Order' : 'Unavailable'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
