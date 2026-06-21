'use client';

import React, { useState, useEffect } from 'react';
import { getReq } from '@/services/axios';
import { RoleGuard } from '@/components/guards/guards';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Database, Search, SlidersHorizontal, Ticket, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch bookings from backend
      let list = [];
      try {
        const response = await getReq('/bookings');
        list = response?.data || [];
      } catch (apiErr) {
        // LocalStorage fallback sync
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('local_bookings') || '[]';
          list = JSON.parse(raw);
        }
      }

      // Fetch packages to resolve titles and prices
      const pkgResponse = await getReq('/packages');
      const packages = pkgResponse?.data || [];

      // Append package metadata
      const hydrated = list.map((b) => {
        const pkg = packages.find((p) => p._id === b.packageId);
        return {
          ...b,
          packageDetails: pkg || { title: 'Unknown Package', price: 0 },
        };
      });

      setBookings(hydrated);
    } catch (err) {
      setError('Error loading bookings dataset.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING_HOLD: {
        text: 'Hold active',
        classes: 'bg-amber-50 text-amber-700 border-amber-100',
        icon: Clock,
      },
      PAID: {
        text: 'Confirmed paid',
        classes: 'bg-green-50 text-green-700 border-green-100',
        icon: CheckCircle2,
      },
      EXPIRED: {
        text: 'Hold expired',
        classes: 'bg-gray-100 text-gray-500 border-gray-200',
        icon: ShieldAlert,
      },
      FAILED: {
        text: 'Failed',
        classes: 'bg-red-50 text-red-700 border-red-100',
        icon: ShieldAlert,
      },
    };

    const config = configs[status] || {
      text: status,
      classes: 'bg-gray-50 text-gray-700 border-gray-200',
      icon: Clock,
    };

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[11px] font-semibold rounded-full ${config.classes}`}>
        <Icon className="h-3 w-3 shrink-0" />
        {config.text}
      </span>
    );
  };

  // Filter Bookings logic
  const filteredBookings = bookings.filter((b) => {
    const idString = b._id || '';
    const pkgTitle = b.packageDetails?.title || '';
    const queryMatch =
      idString.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkgTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter === 'ALL' || b.status === statusFilter;

    return queryMatch && statusMatch;
  });

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Database className="h-8 w-8 text-blue-600" />
                Bookings Database Ledger
              </h1>
              <p className="text-sm text-gray-400 mt-1">Review checkout holds and payment transactions across the system.</p>
            </div>
          </div>

          {/* Filters workspace panel */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
            {/* Search filter input */}
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Booking ID or Package..."
                className="block w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm focus:outline-none placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Quick dropdown filters */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <SlidersHorizontal className="h-4 w-4" />
                Status:
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-40 px-3.5 py-1.5 bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-xs font-semibold focus:outline-none transition-colors cursor-pointer"
              >
                <option value="ALL">All States</option>
                <option value="PAID">Confirmed Paid</option>
                <option value="PENDING_HOLD">Active Holds</option>
                <option value="EXPIRED">Expired Deals</option>
              </select>
            </div>
          </div>

          {/* Tables layout representation */}
          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : error ? (
            <div className="max-w-md mx-auto">
              <EmptyState
                title="Error Loading Ledger"
                description={error}
                actionText="Retry"
                onAction={fetchBookings}
              />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="max-w-md mx-auto py-10">
              <EmptyState
                title="No matching bookings found"
                description="Adjust your search query or status dropdown filters."
                actionText="Clear Search"
                onAction={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
              />
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Travel Package</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Price Allotment</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Hold Expiration</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-500 font-semibold">
                          #{booking._id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {booking.packageDetails?.title || 'Unknown Package'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-extrabold text-gray-900">
                          ${booking.packageDetails?.price || 0}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                          {booking.holdExpiresAt
                            ? new Date(booking.holdExpiresAt).toLocaleTimeString()
                            : 'N/A (Paid/Expired)'}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-semibold">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
