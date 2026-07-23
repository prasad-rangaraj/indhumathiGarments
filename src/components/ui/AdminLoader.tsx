import React from 'react';

/* ── Compact admin table skeleton loader ─────────────────────────────
   Shows animated shimmer rows that mimic a table/list,
   matching the admin panel's card-white background.
────────────────────────────────────────────────────────────────────── */

const ShimmerRow = ({ cols = 4, widths }: { cols?: number; widths?: string[] }) => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 last:border-0">
    {Array.from({ length: cols }).map((_, i) => (
      <div
        key={i}
        className="relative h-4 rounded-md bg-gray-100 overflow-hidden flex-1"
        style={{ maxWidth: widths?.[i] ?? '100%' }}
      >
        <div className="admin-shimmer absolute inset-0" />
      </div>
    ))}
  </div>
);

export const AdminLoader = ({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="w-full">
    {/* Header row */}
    <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-gray-50/60">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="relative h-3 rounded-md bg-gray-200 overflow-hidden flex-1">
          <div className="admin-shimmer absolute inset-0" />
        </div>
      ))}
    </div>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <ShimmerRow key={i} cols={cols} />
    ))}

    <style>{`
      @keyframes admin-shimmer-move {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      .admin-shimmer {
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(236, 72, 153, 0.10) 40%,
          rgba(244, 114, 182, 0.16) 50%,
          rgba(236, 72, 153, 0.10) 60%,
          transparent 100%
        );
        animation: admin-shimmer-move 1.5s ease-in-out infinite;
      }
    `}</style>
  </div>
);

/* ── Full-page admin loader (for page-level loading states) ────────── */
export const AdminPageLoader = () => (
  <div className="flex flex-col gap-6 p-6 animate-fade-in">
    {/* Stat cards skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-xs">
          <div className="relative h-3 w-1/2 rounded-md bg-gray-100 overflow-hidden">
            <div className="admin-shimmer absolute inset-0" />
          </div>
          <div className="relative h-7 w-3/4 rounded-md bg-gray-100 overflow-hidden">
            <div className="admin-shimmer absolute inset-0" />
          </div>
        </div>
      ))}
    </div>
    {/* Table skeleton */}
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      <AdminLoader rows={8} cols={5} />
    </div>
    <style>{`
      @keyframes admin-shimmer-move {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      .admin-shimmer {
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(236, 72, 153, 0.10) 40%,
          rgba(244, 114, 182, 0.16) 50%,
          rgba(236, 72, 153, 0.10) 60%,
          transparent 100%
        );
        animation: admin-shimmer-move 1.5s ease-in-out infinite;
      }
    `}</style>
  </div>
);
