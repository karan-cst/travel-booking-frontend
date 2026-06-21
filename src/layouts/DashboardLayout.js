'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { hydrateAuth } from '@/store/slices/authSlice';
import Navbar from '@/components/ui/Navbar';
import Sidebar from '@/components/ui/Sidebar';

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Drawer Navigation Panel */}
        <Sidebar />

        {/* Right Scrollable Content Block */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
