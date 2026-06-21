'use client';

import React from 'react';
import { Users, Zap, AlertTriangle, ArrowRight, MapPin } from 'lucide-react';

const getPackageImage = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('maldives')) {
    return 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('swiss') || t.includes('alps')) {
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('bali')) {
    return 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('tokyo') || t.includes('japan')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('santorini') || t.includes('greece')) {
    return 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('paris') || t.includes('france')) {
    return 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('canyon') || t.includes('arizona')) {
    return 'https://images.unsplash.com/photo-1615551043360-33de8b5f410c?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('amalfi') || t.includes('positano')) {
    return 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('iceland')) {
    return 'https://images.unsplash.com/photo-1483168527879-c66136b56105?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('kyoto')) {
    return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('rome') || t.includes('italy')) {
    return 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('serengeti') || t.includes('safari') || t.includes('africa')) {
    return 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('new york') || t.includes('nyc') || t.includes('manhattan')) {
    return 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('fjord') || t.includes('norway')) {
    return 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=800&auto=format&fit=crop&q=60';
  }
  if (t.includes('sydney') || t.includes('australia')) {
    return 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=60';
};

export default function PackageCard({ pkg, onBook, isAuthenticated }) {
  const { _id, title, description, price, totalInventory, availableInventory, flashSale } = pkg;

  const now = new Date();
  const isFlashActive =
    flashSale?.isActive &&
    (!flashSale.startTime || new Date(flashSale.startTime) <= now) &&
    (!flashSale.endTime || new Date(flashSale.endTime) >= now);

  const isFlashExpired =
    flashSale?.isActive &&
    flashSale.endTime &&
    new Date(flashSale.endTime) < now;

  const isSoldOut = availableInventory <= 0;
  const remainingPercent = Math.max(0, Math.min(100, (availableInventory / totalInventory) * 100));

  return (
    <div className="flex flex-col bg-white border border-gray-100/80 rounded-3xl shadow-xs hover:shadow-xl hover:shadow-gray-200/40 hover:border-blue-200/60 transition-all duration-500 overflow-hidden relative group">
      
      {/* Top Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={getPackageImage(title)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        {/* Transparent glassmorphic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Location Indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-semibold drop-shadow-md">
          <MapPin className="h-3.5 w-3.5 text-blue-400 fill-blue-400/20" />
          <span className="tracking-wide">ROAMSYNC DESTINATION</span>
        </div>

        {/* Flash Sale Tag over Image */}
        {isFlashActive && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white font-black text-[10px] tracking-wider rounded-full shadow-lg border border-red-400/20 animate-pulse">
            <Zap className="h-3 w-3 fill-white" />
            <span>FLASH OFFER</span>
          </div>
        )}

        {isFlashExpired && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1.5 bg-gray-900/60 backdrop-blur-xs text-white font-semibold text-[10px] tracking-wider rounded-full border border-white/10 shadow-lg">
            <span>DEAL EXPIRED</span>
          </div>
        )}
      </div>

      {/* Main card body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Card title */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          {/* Card description */}
          <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <div className="space-y-4">
          {/* Allotment Inventory Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-gray-300" />
                Remaining Allotment
              </span>
              <span className={isSoldOut ? 'text-red-500' : 'text-gray-700'}>
                {isSoldOut ? 'Sold Out' : `${availableInventory} of ${totalInventory}`}
              </span>
            </div>
            
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-red-500'
                    : remainingPercent < 20
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${remainingPercent}%` }}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            {/* Price display */}
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Price per guest</span>
              <span className="text-xl font-black text-gray-900 tracking-tight">${price}</span>
            </div>

            {/* CTA action button */}
            {isSoldOut ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-red-500 bg-red-50/50 px-3 py-2 rounded-xl border border-red-100/50">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Sold Out
              </div>
            ) : isFlashExpired ? (
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                Closed
              </div>
            ) : (
              <button
                onClick={() => onBook(_id)}
                className="inline-flex items-center gap-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-100 hover:shadow-blue-200/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Book Package
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
