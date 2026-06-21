'use client';

import React, { useState, useEffect } from 'react';
import { getReq } from '@/services/axios';
import { RoleGuard } from '@/components/guards/guards';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Shield, Layers, Ticket, Zap, Database } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalBookings: 0,
    totalAllotmentHolds: 0,
    activeFlashSales: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Packages catalog
      const packagesResponse = await getReq('/packages');
      const packages = packagesResponse?.data || [];

      // 2. Fetch Bookings list (with localStorage fallback if not implemented)
      let bookings = [];
      try {
        const bookingsResponse = await getReq('/bookings');
        bookings = bookingsResponse?.data || [];
      } catch (apiErr) {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('local_bookings') || '[]';
          bookings = JSON.parse(raw);
        }
      }

      // 3. Compute Metrics
      const totalPackages = packages.length;
      const totalBookings = bookings.filter((b) => b.status === 'PAID').length;
      const totalAllotmentHolds = bookings.filter((b) => b.status === 'PENDING_HOLD').length;

      const now = new Date();
      const activeFlashSales = packages.filter(
        (p) =>
          p.flashSale?.isActive &&
          (!p.flashSale.startTime || new Date(p.flashSale.startTime) <= now) &&
          (!p.flashSale.endTime || new Date(p.flashSale.endTime) >= now)
      ).length;

      setStats({
        totalPackages,
        totalBookings,
        totalAllotmentHolds,
        activeFlashSales,
      });
    } catch (err) {
      setError('Error loading administration dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Tour Packages',
      value: stats.totalPackages,
      icon: Layers,
      color: 'text-orange-600 bg-orange-50 border-orange-100',
    },
    {
      name: 'Confirmed Bookings',
      value: stats.totalBookings,
      icon: Ticket,
      color: 'text-green-600 bg-green-50 border-green-100',
    },
    {
      name: 'Active Hold Lock Holds',
      value: stats.totalAllotmentHolds,
      icon: Database,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      name: 'Active Flash Deals',
      value: stats.activeFlashSales,
      icon: Zap,
      color: 'text-red-600 bg-red-50 border-red-100',
    },
  ];

  return (
    <RoleGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 font-serif-elegant">
                <Shield className="h-8 w-8 text-orange-500" />
                Admin Operations Control
              </h1>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Real-time status counters for inventory releases and booking allotments.</p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : error ? (
            <div className="max-w-md mx-auto">
              <EmptyState
                title="Error Loading Stats"
                description={error}
                actionText="Retry"
                onAction={fetchStats}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Statistic widgets grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.name}
                      className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          {card.name}
                        </span>
                        <span className="text-3xl font-black text-gray-900 block font-serif-elegant">
                          {card.value}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl border ${card.color} shrink-0`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Admin Welcome panel */}
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-955 mb-2 font-serif-elegant">Operations Alert Warning</h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed mb-4">
                  All active flash sales allotments are mapped synchronously to memory caches inside the Redis clusters. Ensure local worker threads are listening for expiry keyspaces to safely return allocation holds that fail to pay inside the 10-minute hold lock window.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.href = '/admin/bookings'}
                    className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-100 transition-all cursor-pointer"
                  >
                    Manage Database Bookings
                  </button>
                  <button
                    onClick={fetchStats}
                    className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Refresh Counters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
