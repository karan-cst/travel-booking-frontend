import React from 'react';

export default function EmptyState({
  title = 'No data available',
  description = 'There are no records to display at this moment.',
  icon: Icon,
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
      {Icon && (
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mb-4">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
