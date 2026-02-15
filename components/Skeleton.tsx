import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div
    className={`animate-pulse rounded-lg bg-zinc-800/80 ${className}`}
    aria-hidden
  />
);

export const ResultSkeleton: React.FC = () => (
  <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
    <div className="h-1 bg-zinc-800" />
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-4 w-12 rounded" />
    </div>
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);
