'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiCalendar, 
  FiMapPin, 
  FiUser, 
  FiLogOut, 
  FiCoffee, 
  FiShoppingBag,
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/reservations', label: 'My Reservations', icon: FiCalendar },
    { href: '/coworking-spaces', label: 'Spaces', icon: FiMapPin },
    { href: '/menu', label: 'Food Menu', icon: FiCoffee },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Home', icon: FiSettings },
    { href: '/admin/menu', label: 'Menu Management', icon: FiCoffee },
    { href: '/admin/orders', label: 'Manage Orders', icon: FiShoppingBag },
    { href: '/admin/reservations', label: 'Manage Reservations', icon: FiCalendar },
  ];

  return (
    <nav className="bg-white shadow-lg shadow-indigo-500/25 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200">
                CoWork Space
              </Link>
            </div>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${
                      isActive(link.href)
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <div className="relative group">
                    <button className="inline-flex items-center px-3 py-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200">
                      <FiSettings className="mr-2 h-4 w-4" />
                      Admin
                    </button>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`${
                            pathname.startsWith(link.href)
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          } block px-4 py-2 text-sm transition-colors duration-200`}
                        >
                          <link.icon className="inline-block mr-2 h-4 w-4" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/cart"
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 relative"
                  title="View Cart"
                >
                  <FiShoppingBag className="h-5 w-5" />
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <FiUser className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${
                      isActive(link.href)
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                  >
                    <link.icon className="inline-block mr-2 h-5 w-5" />
                    {link.label}
                  </Link>
                ))}
                {user?.role === 'admin' && (
                  <>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Admin
                      </div>
                      {adminLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`${
                            pathname.startsWith(link.href)
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                          } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                        >
                          <link.icon className="inline-block mr-2 h-5 w-5" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <Link
                    href="/profile"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FiUser className="inline-block mr-2 h-5 w-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <FiLogOut className="inline-block mr-2 h-5 w-5" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;