'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { toggleSidebar } from '@/store/slices/appSlice';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, User, Compass, BookOpen, Sparkles, Shield, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navLinks = [
    { name: 'Browse Packages', href: '/packages', icon: Compass, show: true },
    { name: 'My Bookings', href: '/my-bookings', icon: BookOpen, show: isAuthenticated && role === 'user' },
    { name: 'AI Itinerary', href: '/itinerary', icon: Sparkles, show: isAuthenticated && role === 'user' },
    { name: 'Admin Hub', href: '/admin', icon: Shield, show: isAuthenticated && role === 'admin' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg lg:hidden focus:outline-none mr-2"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link href="/packages" className="flex items-center gap-2 group">
              <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 transition-transform group-hover:scale-105">
                RS
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                RoamSync
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks
              .filter((link) => link.show)
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
          </div>

          {/* User Section / CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left"
                >
                  <div className="h-8 w-8 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm rounded-lg shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 leading-3">{user?.name}</div>
                    <div className="text-[10px] text-gray-400 capitalize mt-0.5">{role}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-400">
                      Signed in as <span className="font-semibold text-gray-700">{user?.email}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 py-3 px-4 flex flex-col gap-2">
          {navLinks
            .filter((link) => link.show)
            .map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}

          {isAuthenticated ? (
            <div className="border-t border-gray-100 pt-3 mt-1 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-9 w-9 bg-blue-600 text-white flex items-center justify-center font-bold rounded-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium block"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
