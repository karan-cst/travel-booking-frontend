'use client';

import React from 'react';
import { Calendar, Users, Zap, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

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
    <div className="flex flex-col bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-gray-100/50 hover:border-blue-100 transition-all duration-300 overflow-hidden relative group">
      {/* Flash Sale Tag */}
      {isFlashActive && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 bg-red-500 text-white font-bold text-xs rounded-full shadow-sm animate-pulse">
          <Zap className="h-3.5 w-3.5 fill-white" />
          <span>FLASH SALE</span>
        </div>
      )}

      {isFlashExpired && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 bg-gray-500 text-white font-semibold text-xs rounded-full shadow-sm">
          <span>EXPIRED DEAL</span>
        </div>
      )}

      {/* Main card body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Card title */}
          <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          
          {/* Card description */}
          <p className="mt-2 text-sm text-gray-500 line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {/* Allotment Inventory Progress Bar */}
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                Slots Remaining
              </span>
              <span className={isSoldOut ? 'text-red-500' : 'text-gray-900'}>
                {isSoldOut ? 'Sold Out' : `${availableInventory} / ${totalInventory}`}
              </span>
            </div>
            
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
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

          <div className="border-t border-gray-50 pt-4 flex items-end justify-between">
            {/* Price display */}
            <div>
              <span className="text-xs text-gray-400 font-medium block">Price per client</span>
              <span className="text-2xl font-extrabold text-gray-900">${price}</span>
            </div>

            {/* CTA action button */}
            {isSoldOut ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 px-3 py-2 rounded-xl">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Sold Out
              </div>
            ) : isFlashExpired ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 px-3 py-2 rounded-xl">
                Deal Over
              </div>
            ) : (
              <button
                onClick={() => onBook(_id)}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Book Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
