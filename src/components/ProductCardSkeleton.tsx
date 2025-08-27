import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-lime-100 p-0 flex flex-col animate-pulse overflow-hidden">
      <div className="w-full h-48 bg-gradient-to-br from-lime-50 via-yellow-50 to-green-100 flex items-center justify-center">
        <div className="w-32 h-32 bg-lime-200 rounded-full" />
      </div>
      <div className="flex flex-col flex-1 px-5 pt-4 pb-6">
        <div className="h-6 bg-lime-200 rounded w-2/3 mb-2" />
        <div className="h-4 bg-yellow-100 rounded w-full mb-4" />
        <div className="flex items-center justify-between mt-auto mb-3">
          <div className="h-6 bg-lime-200 rounded w-1/3" />
          <div className="h-6 bg-yellow-100 rounded w-1/4" />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="w-1/2 h-10 bg-lime-200 rounded-xl" />
          <div className="w-1/2 h-10 bg-yellow-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
