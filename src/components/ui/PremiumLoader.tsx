import React from 'react';
import bgCotton1 from '@/assets/bg-cotton-1.jpg';

/* Flipkart-style: scrolling product skeleton cards + top progress bar */

const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="flex-shrink-0 w-36 rounded-2xl bg-white border border-pink-100 shadow-sm overflow-hidden"
    style={{ animationDelay: `${delay}s` }}
  >
    {/* Image placeholder */}
    <div className="relative h-36 bg-pink-50 overflow-hidden">
      <div className="shimmer absolute inset-0" />
    </div>
    {/* Text placeholders */}
    <div className="p-3 space-y-2">
      <div className="relative h-3 rounded-full bg-pink-50 overflow-hidden w-full">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="relative h-3 rounded-full bg-pink-50 overflow-hidden w-2/3">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="relative h-3 rounded-full bg-pink-100/70 overflow-hidden w-1/3 mt-1">
        <div className="shimmer absolute inset-0" />
      </div>
    </div>
  </div>
);

export const PremiumLoader = () => {
  const cards = Array.from({ length: 10 });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: 'hsl(340 30% 98%)' }}>
      {/* Subtle cotton texture overlay - very faint */}
      <img
        src={bgCotton1}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none select-none"
      />

      {/* Top loading bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-pink-100 overflow-hidden z-10">
        <div className="top-bar-progress h-full bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400" />
      </div>

      {/* Main content — centered */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-10 px-4">

        {/* Brand wordmark */}
        <div className="text-center space-y-1">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'hsl(340 70% 45%)' }}
          >
            Indhumathi
          </h1>
          <p className="text-xs tracking-widest uppercase font-medium" style={{ color: 'hsl(340 40% 60%)', letterSpacing: '0.22em' }}>
            Garments
          </p>
        </div>

        {/* Scrolling skeleton cards */}
        <div className="relative w-full max-w-xl overflow-hidden">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, hsl(340 30% 98%), transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, hsl(340 30% 98%), transparent)' }}
          />

          <div className="card-scroll-track flex gap-3">
            {[...cards, ...cards].map((_, i) => (
              <SkeletonCard key={i} delay={(i % 5) * 0.1} />
            ))}
          </div>
        </div>

      </div>

      {/* All animations in one style block */}
      <style>{`
        @keyframes shimmer-move {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(236, 72, 153, 0.12) 40%,
            rgba(244, 114, 182, 0.18) 50%,
            rgba(236, 72, 153, 0.12) 60%,
            transparent 100%
          );
          animation: shimmer-move 1.6s ease-in-out infinite;
        }

        @keyframes card-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .card-scroll-track {
          width: max-content;
          animation: card-scroll 14s linear infinite;
        }

        @keyframes top-bar {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .top-bar-progress {
          width: 40%;
          animation: top-bar 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
