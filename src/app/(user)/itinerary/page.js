'use client';

import React, { useState, useEffect } from 'react';
import { getReq } from '@/services/axios';
import { AuthGuard } from '@/components/guards/guards';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Sparkles, Calendar, MapPin, Coffee, Home, Zap, RefreshCw } from 'lucide-react';

export default function ItineraryPage() {
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingItinerary, setFetchingItinerary] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfirmedBookings();
  }, []);

  const fetchConfirmedBookings = async () => {
    setLoading(true);
    setError('');
    try {
      let bookingsList = [];
      try {
        // Attempt backend API call
        const response = await getReq('/bookings');
        if (response?.status === 'success' && Array.isArray(response?.data)) {
          bookingsList = response.data;
        }
      } catch (apiErr) {
        // LocalStorage fallback sync
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('local_bookings') || '[]';
          bookingsList = JSON.parse(raw);
        }
      }

      // Fetch packages to resolve names
      const pkgResponse = await getReq('/packages');
      const packages = pkgResponse?.data || [];

      const hydrated = bookingsList
        .filter((b) => b.status === 'PAID')
        .map((b) => {
          const pkg = packages.find((p) => p._id === b.packageId);
          return {
            ...b,
            packageDetails: pkg || { title: 'Unknown Package' },
          };
        });

      setConfirmedBookings(hydrated);
      if (hydrated.length > 0) {
        setSelectedBooking(hydrated[0].packageId);
        fetchItinerary(hydrated[0].packageId);
      }
    } catch (err) {
      setError('Failed to load user booking profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItinerary = async (pkgId) => {
    if (!pkgId) return;
    setFetchingItinerary(true);
    setError('');
    try {
      const response = await getReq(`/itinerary/${pkgId}`);
      if (response?.status === 'success' && response?.data) {
        setItinerary(response.data);
      } else {
        setError('Failed to fetch AI Recommendation planner.');
      }
    } catch (err) {
      setError(err?.message || 'Error generating AI Itinerary.');
    } finally {
      setFetchingItinerary(false);
    }
  };

  const handlePackageChange = (e) => {
    const pkgId = e.target.value;
    setSelectedBooking(pkgId);
    setItinerary(null);
    fetchItinerary(pkgId);
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-600 fill-blue-50/50" />
                AI Itinerary Recommender
              </h1>
              <p className="text-sm text-gray-400 mt-1">Get customized, high-speed itinerary recommendations for your paid trips.</p>
            </div>

            {confirmedBookings.length > 0 && (
              <div className="w-full md:w-64">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Destination:</label>
                <select
                  value={selectedBooking}
                  onChange={handlePackageChange}
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-sm focus:outline-none transition-colors cursor-pointer"
                >
                  {confirmedBookings.map((b) => (
                    <option key={b._id} value={b.packageId}>
                      {b.packageDetails.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <LoadingSpinner size="lg" className="py-20" />
          ) : confirmedBookings.length === 0 ? (
            <div className="max-w-md mx-auto py-10">
              <EmptyState
                title="No paid packages detected"
                description="AI itineraries are unlocked only for confirmed, paid bookings. Complete your payment checklist first."
                icon={Sparkles}
                actionText="Go to My Bookings"
                onAction={() => window.location.href = '/my-bookings'}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {fetchingItinerary ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4">
                  <LoadingSpinner size="lg" />
                  <div>
                    <p className="font-bold text-gray-900">Synthesizing AI Itinerary planner...</p>
                    <p className="text-xs text-gray-400 mt-1">Querying downstreams and seeding caching tables...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="max-w-md mx-auto">
                  <EmptyState
                    title="Generation Failed"
                    description={error}
                    actionText="Retry Generation"
                    onAction={() => fetchItinerary(selectedBooking)}
                  />
                </div>
              ) : itinerary ? (
                <div className="space-y-6">
                  {/* Cache metrics banner */}
                  <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-semibold">Cache Performance Status:</span>
                      {itinerary.source === 'CACHE_HIT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 font-bold text-[10px] rounded-full border border-green-100">
                          <Zap className="h-3 w-3 fill-green-700" />
                          CACHE HIT (Instant)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full border border-blue-100">
                          🤖 AI GENERATED (Cache Miss)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => fetchItinerary(selectedBooking)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Regenerate
                    </button>
                  </div>

                  {/* Daily itineraries */}
                  <div className="space-y-6">
                    {itinerary.days.map((dayPlan) => (
                      <div
                        key={dayPlan.day}
                        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start"
                      >
                        <div className="h-12 w-12 bg-blue-600 text-white font-black text-lg rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-blue-100">
                          D{dayPlan.day}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                            <MapPin className="h-4.5 w-4.5 text-blue-600" />
                            Activity Outline
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{dayPlan.activity}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {dayPlan.meals.length > 0 && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                <Coffee className="h-4 w-4 text-gray-400" />
                                <span>Meals: {dayPlan.meals.join(', ')}</span>
                              </div>
                            )}

                            {dayPlan.accommodation && (
                              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                                <Home className="h-4 w-4 text-gray-400" />
                                <span>Resort: {dayPlan.accommodation}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
