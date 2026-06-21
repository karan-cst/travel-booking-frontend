'use client';

import React, { useState, useEffect } from 'react';
import { getReq } from '@/services/axios';
import { AuthGuard } from '@/components/guards/guards';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { BookOpen, Ticket, ShieldAlert, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Attempt to fetch bookings from backend API
      const response = await getReq('/bookings');
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        setBookings(response.data);
      } else {
        throw new Error('Unsupported response format');
      }
    } catch (err) {
      console.warn('Backend API /bookings failed or not implemented. Loading from LocalStorage sync fallback...');
      
      // 2. LocalStorage Fallback for frontend demonstration compatibility
      if (typeof window !== 'undefined') {
        try {
          const localBookingsRaw = localStorage.getItem('local_bookings') || '[]';
          const localBookings = JSON.parse(localBookingsRaw);
          
          // Also fetch package details to append titles and prices
          const pkgResponse = await getReq('/packages');
          const packages = pkgResponse?.data || [];

          const hydratedBookings = localBookings.map((b) => {
            const pkg = packages.find((p) => p._id === b.packageId);
            return {
              ...b,
              packageDetails: pkg || { title: 'Unknown Package', price: 0 },
            };
          });

          setBookings(hydratedBookings);
        } catch (storageErr) {
          setError('Failed to load bookings database.');
        }
      } else {
        setError('Environment not supported.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING_HOLD: {
        text: 'Pending Payment',
        classes: 'bg-amber-50 text-amber-700 border-amber-100',
        icon: Clock,
      },
      PAID: {
        text: 'Confirmed Paid',
        classes: 'bg-green-50 text-green-700 border-green-100',
        icon: CheckCircle2,
      },
      EXPIRED: {
        text: 'Hold Expired',
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-semibold rounded-full ${config.classes}`}>
        <Icon className="h-3 w-3 shrink-0" />
        {config.text}
      </span>
    );
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
              <p className="text-sm text-gray-400 mt-1">Review your travel checkout transactions and active inventory holds.</p>
            </div>
            <div className="p-3 bg-blue-50/50 text-blue-600 rounded-2xl flex items-center gap-2 border border-blue-100/30 text-xs font-semibold w-fit">
              <Calendar className="h-4 w-4" />
              Auto-expiration holds check-out cycle: 10 mins
            </div>
          </div>

          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : error ? (
            <EmptyState
              title="Error loading bookings"
              description={error}
              actionText="Retry"
              onAction={fetchBookings}
            />
          ) : bookings.length === 0 ? (
            <div className="max-w-md mx-auto py-10">
              <EmptyState
                title="No bookings placed yet"
                description="Browse our packages catalog to book a flash-sale paradise vacation."
                icon={BookOpen}
                actionText="Explore Packages"
                onAction={() => window.location.href = '/packages'}
              />
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500 font-medium">
                          #{booking._id.substr(-8)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">
                            {booking.packageDetails?.title || 'Loading package...'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-extrabold text-gray-900">
                          ${booking.packageDetails?.price || 0}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 font-semibold">
                          {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                          {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </AuthGuard>
  );
}
