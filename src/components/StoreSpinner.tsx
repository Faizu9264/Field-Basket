import React from "react";

export default function StoreSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-lime-100 via-green-50 to-yellow-100">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full border-8 border-green-400 border-t-lime-400 border-b-yellow-300 h-24 w-24 mb-4 shadow-lg">
          <svg className="h-full w-full" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="40" stroke="#bef264" strokeWidth="8" fill="#f7fee7" />
            <ellipse cx="48" cy="38" rx="12" ry="18" fill="#bbf7d0" />
            <ellipse cx="48" cy="58" rx="18" ry="10" fill="#fef9c3" />
            <circle cx="48" cy="48" r="6" fill="#22c55e" />
          </svg>
        </div>
        <span className="text-green-700 font-extrabold text-xl tracking-wide drop-shadow">Loading Field Basket...</span>
      </div>
    </div>
  );
}
