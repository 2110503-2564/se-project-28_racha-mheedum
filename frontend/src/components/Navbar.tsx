'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import type { IconType } from 'react-icons';
import {
  FiHome,
  FiCalendar,
  FiMapPin,
  FiCoffee,
  FiShoppingBag,
  FiSettings,
  FiUser,
  FiLogOut,
  FiUsers
} from 'react-icons/fi';
import { getAllOrdersAdmin } from '@/lib/orderApi';

interface NavLink {
  href: string;
  label: string;
  icon: IconType;
}

const navLinks: NavLink[] = [
  { href: '/dashboard',        label: 'Dashboard',        icon: FiHome       },
  { href: '/reservations',     label: 'My Reservations',  icon: FiCalendar   },
  { href: '/coworking-spaces', label: 'Spaces',           icon: FiMapPin     },
  { href: '/menu',             label: 'Food Menu',        icon: FiCoffee     },
];

const adminLinks: NavLink[] = [
  { href: '/admin',               label: 'Admin Home',          icon: FiSettings    },
  { href: '/admin/menu',          label: 'Menu Management',     icon: FiCoffee      },
  { href: '/admin/orders',        label: 'Manage Orders',       icon: FiShoppingBag },
  { href: '/admin/reservations',  label: 'Manage Reservations', icon: FiCalendar    },
  { href: '/admin/membership-programs', label: 'Manage Membership', icon: FiUsers },
];

export default function Navbar() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch pending count and subscribe to real-time updates
  useEffect(() => {
    if (user?.role === 'admin' && token) {
      const fetchPending = async () => {
        try {
          const res = await getAllOrdersAdmin(token);
          if (res.success && Array.isArray(res.data)) {
            setPendingCount(res.data.filter((o: any) => o.status === 'pending').length);
          }
        } catch (err) {
          console.error('Error fetching pending orders:', err);
        }
      };
      fetchPending();

      const socket: Socket = io('http://localhost:5003', { withCredentials: true });
      socket.on('new_order', fetchPending);
      socket.on('order_updated', fetchPending);
      socket.on('order_deleted', fetchPending);

      return () => {
        socket.disconnect();
      };
    }
  }, [user, token]);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="hidden sm:flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700">
            CoWork Space
          </Link>

          {isAuthenticated && navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                isActive(href)
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Icon className="mr-1 h-5 w-5" /> {label}
            </Link>
          ))}

          {user?.role === 'admin' && (
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium ${
                  isActive('/admin') || isActive('/admin/orders')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FiSettings className="mr-1 h-5 w-5" />
                Admin/Manager
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-red-600 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              {isAdminMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                  {adminLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                        isActive(href) ? 'font-semibold' : ''
                      }`}
                    >
                      <Icon className="mr-2 h-4 w-4" /> {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User/Auth */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <FiUser className="h-5 w-5" />
                  <span>{user?.name}</span>
                </Link>

                <button
                  onClick={() => logout()}
                  className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
                >
                  <FiLogOut className="mr-1 h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-2 py-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded"
              >
                <FiUser className="mr-1 h-5 w-5" />
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile (unchanged) */}
        <div className="sm:hidden flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            CoWork Space
          </Link>
          <button className="p-2 rounded-md focus:outline-none focus:ring-2">
            {/* Mobile menu toggle icon here */}
          </button>
        </div>
      </div>
    </nav>
  );
}
