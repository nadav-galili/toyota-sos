'use client';

import React from 'react';

export function KpiCard({
  title,
  value,
  secondary,
  loading,
  error,
  actionArea,
}: {
  title: string;
  value: React.ReactNode;
  secondary?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  actionArea?: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white p-5 shadow-sm transition-all duration-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent" />
        <div className="relative">
          <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
          <div className="h-8 w-36 rounded bg-gray-300" />
          <div className="mt-2 h-3 w-28 rounded bg-gray-200" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="relative overflow-hidden rounded-xl border-l-4 border-red-400 bg-gradient-to-br from-red-50/50 to-white p-5 shadow-sm">
        <div className="mb-2 text-sm font-medium text-red-700">{title}</div>
        <div className="text-sm text-red-700">שגיאה: {error}</div>
      </div>
    );
  }
  return (
    <div className="group relative rounded-xl p-[3px] bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 shadow-sm transition-all duration-300 hover:from-blue-500/30 hover:via-purple-500/30 hover:to-pink-500/30 hover:shadow-md">
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Inner card */}
      <div className="relative h-full rounded-[11px] bg-white p-5">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-gray-50/30 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <div className="relative">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-600">{title}</div>
            {actionArea}
          </div>
          <div className="text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </div>
          {secondary ? (
            <div className="mt-2 text-xs text-gray-500">{secondary}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
