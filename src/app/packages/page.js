'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { hydrateAuth } from '@/store/slices/authSlice';
import { getReq } from '@/services/axios';
import Navbar from '@/components/ui/Navbar';
import PackageCard from '@/components/ui/PackageCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Search, Compass, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function PackagesPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActiveFlash, setFilterActiveFlash] = useState(false);
  const [filterOnlyAvailable, setFilterOnlyAvailable] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
    fetchPackages();
  }, [dispatch]);

  const fetchPackages = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getReq('/packages');
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        setPackages(response.data);
      } else {
        setError('Failed to load packages details.');
      }
    } catch (err) {
      setError(err?.message || 'Error fetching travel packages.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPackage = (packageId) => {
    if (!isAuthenticated) {
      router.push(`/login`);
    } else {
      router.push(`/bookings/create?packageId=${packageId}`);
    }
  };

  // Filter packages logic
  const filteredPackages = packages.filter((pkg) => {
    const titleMatch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const now = new Date();
    const isFlashActive =
      pkg.flashSale?.isActive &&
      (!pkg.flashSale.startTime || new Date(pkg.flashSale.startTime) <= now) &&
      (!pkg.flashSale.endTime || new Date(pkg.flashSale.endTime) >= now);

    const flashMatch = !filterActiveFlash || isFlashActive;
    const availableMatch = !filterOnlyAvailable || pkg.availableInventory > 0;

    return titleMatch && flashMatch && availableMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      {/* Main hero showcase header */}
      <header className="bg-white border-b border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full shadow-sm">
            <Compass className="h-4 w-4" />
            <span>DISCOVER YOUR PARADISE</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            RoamSync Travel Deals
          </h1>
          <p className="max-w-2xl mx-auto text-base text-gray-500">
            Secure premium travel packages and atomic flash-sale allotments. Grab your holds before they expire!
          </p>
        </div>
      </header>

      {/* Filters & Listing panel */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-white p-4 border border-gray-100 rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destinations, resorts..."
              className="block w-full pl-9 pr-4 py-2 border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm focus:outline-none placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filter By:
            </div>
            
            <button
              onClick={() => setFilterActiveFlash(!filterActiveFlash)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterActiveFlash
                  ? 'bg-red-500 border-red-500 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              Active Flash Sales 🔥
            </button>

            <button
              onClick={() => setFilterOnlyAvailable(!filterOnlyAvailable)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                filterOnlyAvailable
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              In Stock Only
            </button>
          </div>
        </div>

        {/* Dynamic packages views */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto">
            <EmptyState
              title="Failed to Load"
              description={error}
              actionText="Retry"
              onAction={fetchPackages}
            />
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="max-w-md mx-auto">
            <EmptyState
              title="No packages found"
              description="No destinations match your active queries. Try adjusting your filters."
              onAction={() => {
                setSearchQuery('');
                setFilterActiveFlash(false);
                setFilterOnlyAvailable(false);
              }}
              actionText="Clear Filters"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onBook={handleBookPackage}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
