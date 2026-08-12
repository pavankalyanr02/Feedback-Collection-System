import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-5 bg-slate-800 rounded w-1/3"></div>
        <div className="h-5 bg-slate-800 rounded-full w-20"></div>
      </div>
      <div className="h-4 bg-slate-800/60 rounded w-3/4"></div>
      <div className="h-4 bg-slate-800/40 rounded w-1/2"></div>
      <div className="pt-4 border-t border-slate-800/60 flex justify-between">
        <div className="h-4 bg-slate-800 rounded w-24"></div>
        <div className="h-4 bg-slate-800 rounded w-16"></div>
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="w-full glass-card rounded-2xl overflow-hidden animate-pulse border border-slate-800 p-4 space-y-3">
      <div className="h-8 bg-slate-800 rounded w-full"></div>
      <div className="h-12 bg-slate-900/60 rounded w-full"></div>
      <div className="h-12 bg-slate-900/60 rounded w-full"></div>
      <div className="h-12 bg-slate-900/60 rounded w-full"></div>
    </div>
  );
};
