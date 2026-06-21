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
import { Search, Compass, SlidersHorizontal, Zap, Sparkles } from 'lucide-react';

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
      router.push(`/login?redirectTo=${encodeURIComponent(`/bookings/create?packageId=${packageId}`)}`);
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Navbar />

      {/* Hero Showcase with background video */}
      <header className="relative h-[420px] w-full overflow-hidden flex items-center justify-center">
        {/* Background hero image */}
        <img
          src="/hero_section_2.jpg"
          alt="Caribbean Maldives Vacation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Glassmorphic dark overlay */}
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 space-y-3">
          <span className="font-script text-orange-400 text-2xl block tracking-wide lowercase">
            amazing tour
          </span>
          
          <h1 className="text-4xl font-black text-white sm:text-6xl tracking-tight leading-none font-serif-elegant">
            Caribbean & Maldives
          </h1>
          
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-gray-200/80 font-medium leading-relaxed uppercase tracking-wider">
            Explore atomic flash deals and vacation packages
          </p>
        </div>
      </header>

      {/* FLOATING SEARCH WIDGET: Overlaps the hero boundary (reference UI style) */}
      <div className="relative -mt-14 z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 sm:p-6 border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/60 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Destination Search Field */}
          <div className="relative w-full md:flex-1">
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
              Where to? (Destination)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Maldives, Swiss Alps, Ubud Bali..."
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 focus:border-orange-500 rounded-2xl text-xs font-bold focus:outline-none placeholder-gray-400 bg-gray-50/10 transition-colors"
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 pt-4 md:pt-0">
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                Deals Filter
              </label>
              <button
                onClick={() => setFilterActiveFlash(!filterActiveFlash)}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterActiveFlash
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                Active Flash Sales
              </button>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5 pl-1">
                Stock Status
              </label>
              <button
                onClick={() => setFilterOnlyAvailable(!filterOnlyAvailable)}
                className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  filterOnlyAvailable
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Available Packages
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Catalogue */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center gap-2 mb-6 pl-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight font-serif-elegant">
            Popular Tour Catalogs
          </h2>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
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
              description="No destinations match your search. Try resetting your filter inputs."
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
