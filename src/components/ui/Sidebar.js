'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarCollapsed } from '@/store/slices/appSlice';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, BookOpen, Sparkles, LayoutDashboard, Database, X, ShieldAlert } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state) => state.app);
  const { role, user } = useSelector((state) => state.auth);

  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'All Bookings', href: '/admin/bookings', icon: Database },
    { name: 'Browse Packages', href: '/packages', icon: Compass },
  ];

  const userLinks = [
    { name: 'My Bookings', href: '/my-bookings', icon: BookOpen },
    { name: 'AI Itinerary', href: '/itinerary', icon: Sparkles },
    { name: 'Browse Packages', href: '/packages', icon: Compass },
  ];

  const links = role === 'admin' ? adminLinks : userLinks;

  return (
    <>
      {/* Mobile Sidebar overlay backdrop */}
      {!sidebarCollapsed && (
        <div
          onClick={() => dispatch(setSidebarCollapsed(true))}
          className="fixed inset-0 z-30 bg-gray-900/40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-35 flex w-64 flex-col bg-white border-r border-gray-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Header container */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100 lg:hidden">
          <span className="text-lg font-bold text-gray-950">RoamSync Menu</span>
          <button
            onClick={() => dispatch(setSidebarCollapsed(true))}
            className="p-1 text-gray-400 hover:text-gray-950 hover:bg-gray-50 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User context badge */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
            <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-950 truncate leading-4">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate capitalize mt-0.5">{role}</p>
            </div>
          </div>
        </div>

        {/* Links Panel */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => dispatch(setSidebarCollapsed(true))}
                className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-50/50 text-blue-600 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-950'
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-6 border-t border-gray-50 text-[10px] text-gray-400 text-center">
          &copy; 2026 RoamSync Booking.
        </div>
      </aside>
    </>
  );
}
