"use client";

export default function SkeletonTask() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-6 h-6 rounded-md bg-gray-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
        </div>
      </div>

      <div className="flex gap-3 ml-4">
        <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
        <div className="w-8 h-8 rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}