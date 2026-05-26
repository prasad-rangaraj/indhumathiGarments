import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = document.getElementById('root'); // Our scroll container on mobile
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull if we are at the very top of the scroll container
      if (container.scrollTop > 0) return;
      startYRef.current = e.touches[0].clientY;
      currentYRef.current = startYRef.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop > 0) return;
      if (startYRef.current === 0) return;

      currentYRef.current = e.touches[0].clientY;
      const pull = currentYRef.current - startYRef.current;

      // Only care about pulling down
      if (pull > 0) {
        // Add resistance
        const distance = Math.min(pull * 0.4, PULL_THRESHOLD + 20);
        setPullDistance(distance);
        setIsPulling(true);
      }
    };

    const handleTouchEnd = () => {
      if (isPulling) {
        if (pullDistance >= PULL_THRESHOLD) {
          // Trigger reload
          window.location.reload();
        } else {
          // Cancel
          setPullDistance(0);
          setIsPulling(false);
        }
      }
      startYRef.current = 0;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance]);

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-full flex justify-center z-50 pointer-events-none transition-transform"
        style={{
          transform: `translateY(${isPulling ? pullDistance - 40 : -50}px)`,
          opacity: isPulling ? pullDistance / PULL_THRESHOLD : 0,
        }}
      >
        <div className="bg-background rounded-full shadow-lg p-2 border border-border">
          <Loader2 
            className="w-5 h-5 text-primary"
            style={{
              transform: `rotate(${pullDistance * 3}deg)`,
              transition: isPulling ? 'none' : 'transform 0.3s ease-out'
            }}
          />
        </div>
      </div>
      {children}
    </>
  );
};
