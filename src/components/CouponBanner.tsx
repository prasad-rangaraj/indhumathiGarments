import { useEffect, useState, useRef, useMemo } from 'react';
import { Tag, Clock, X, Copy, Check, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { couponsAPI } from '@/lib/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  minAmount: number | null;
  validUntil: string | null;
}

const CouponBanner = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    couponsAPI.getActive()
      .then(data => setCoupons(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (coupons.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % coupons.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [coupons.length, isPaused]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Code Copied!",
      description: `${code} has been copied.`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (coupons.length === 0 || dismissed) return null;

  return (
    <div 
      className="relative w-full group overflow-hidden border-y border-white/20 shadow-2xl z-20 animate-in fade-in slide-in-from-top duration-700 backdrop-blur-xl bg-white/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. MOVING MESH GRADIENT LAYER */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Blob */}
        <div className="absolute -inset-[10%] bg-gradient-to-r from-primary/40 to-secondary/40 animate-mesh-move opacity-70 blur-3xl"></div>
        {/* Secondary Blob */}
        <div className="absolute top-0 left-[-20%] w-[140%] h-full bg-[radial-gradient(circle_at_20%_50%,rgba(219,39,119,0.3)_0%,transparent_50%)] animate-mesh-slide"></div>
        {/* Accent Blob */}
        <div className="absolute top-0 right-[-20%] w-[140%] h-full bg-[radial-gradient(circle_at_80%_50%,rgba(147,51,234,0.3)_0%,transparent_50%)] animate-mesh-slide-reverse"></div>
      </div>
      
      {/* 2. SPARKLING STARS EFFECT */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="stars-container w-[200%] h-full flex animate-stars-scroll">
          {sparkles.map((s, i) => (
             <Sparkles key={i} className="text-white/40 w-2 h-2 absolute" style={{ 
               top: `${s.top}%`, 
               left: `${s.left}%`,
               animation: `pulse ${s.duration}s infinite ${s.delay}s`
             }} />
          ))}
          {sparkles.map((s, i) => (
             <Sparkles key={`clone-${i}`} className="text-white/40 w-2 h-2 absolute" style={{ 
               top: `${s.top}%`, 
               left: `${100 + s.left}%`,
               animation: `pulse ${s.duration}s infinite ${s.delay}s`
             }} />
          ))}
        </div>
      </div>

      {/* 3. GLASS SHINE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-black/10 hover:bg-black/40 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
        aria-label="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Main Content Area */}
      <div className="container mx-auto relative px-4 py-3 flex items-center justify-center min-h-[56px]">
        {/* Navigation Indicator (Left) */}
        <div className="hidden md:flex items-center gap-1.5 absolute left-10">
          <div className="text-white/40 text-[10px] uppercase font-bold tracking-tighter w-8">
            0{currentIndex + 1} / 0{coupons.length}
          </div>
          <div className="flex gap-1">
            {coupons.map((_, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "w-1 h-1 rounded-full transition-all duration-500",
                  currentIndex === idx ? "bg-white w-3 scale-110" : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Sliding Card Wrapper */}
        <div className="relative w-full max-w-xl h-9 overflow-hidden">
          {coupons.map((coupon, idx) => (
            <div
              key={coupon.id}
              className={cn(
                "absolute inset-0 w-full flex items-center justify-center gap-6 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)",
                currentIndex === idx 
                  ? "translate-y-0 opacity-100 scale-100 rotate-0" 
                  : idx < currentIndex 
                    ? "-translate-y-full opacity-0 scale-95 -rotate-1" 
                    : "translate-y-full opacity-0 scale-95 rotate-1"
              )}
            >
              {/* Premium Coupon Tag */}
              <div 
                onClick={() => handleCopy(coupon.code)}
                className="group/tag flex items-center gap-2.5 px-4 py-1.5 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all cursor-pointer active:scale-95 shadow-lg backdrop-blur-md"
              >
                <Tag className="w-3.5 h-3.5 text-white/90" />
                <span className="text-white font-black text-xs tracking-[0.2em] font-mono leading-none">
                  {coupon.code}
                </span>
                <div className="w-px h-4 bg-white/20 mx-1"></div>
                {copiedCode === coupon.code ? (
                  <Check className="w-4 h-4 text-green-300 animate-in zoom-in" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-white/30 group-hover/tag:text-white transition-colors" />
                )}
              </div>

              {/* Offer Text */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-center sm:text-left">
                <span className="text-white font-black text-sm sm:text-lg tracking-tight drop-shadow-md">
                  {coupon.discount}% FLAT OFF
                </span>
                {coupon.minAmount && (
                  <span className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest border-l border-white/20 pl-4 hidden sm:block">
                    Min ₹{coupon.minAmount}
                  </span>
                )}
              </div>

              {/* Countdown/Expiry (Hidden on mobile) */}
              {coupon.validUntil && (
                <div className="hidden xl:flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-widest leading-none">
                  <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></div>
                  Ends {format(new Date(coupon.validUntil), 'MMM dd')}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls (Right) */}
        {coupons.length > 1 && (
          <div className="hidden md:flex items-center gap-2 absolute right-12 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button 
              onClick={() => setCurrentIndex((prev) => (prev - 1 + coupons.length) % coupons.length)}
              className="p-1.5 hover:bg-white/15 rounded-lg text-white/40 hover:text-white transition-all active:scale-90"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % coupons.length)}
              className="p-1.5 hover:bg-white/15 rounded-lg text-white/40 hover:text-white transition-all active:scale-90"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Segmented Progress bar */}
      {coupons.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-[3px] flex gap-1 px-1">
          {coupons.map((_, idx) => (
            <div key={idx} className="flex-1 bg-white/10 rounded-full overflow-hidden">
               {currentIndex === idx && !isPaused && (
                 <div className="h-full bg-primary/80 animate-progress-segment" />
               )}
               {currentIndex > idx && (
                 <div className="h-full bg-white/20" />
               )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes mesh-move {
          0%, 100% { transform: scale(1) translate(0%, 0%); }
          33% { transform: scale(1.1) translate(-5%, 5%); }
          66% { transform: scale(1.05) translate(5%, -2%); }
        }
        @keyframes mesh-slide {
          0% { transform: translateX(-30%); }
          100% { transform: translateX(30%); }
        }
        @keyframes mesh-slide-reverse {
          0% { transform: translateX(30%); }
          100% { transform: translateX(-30%); }
        }
        @keyframes stars-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes progress-segment {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-mesh-move { animation: mesh-move 20s ease-in-out infinite; }
        .animate-mesh-slide { animation: mesh-slide 15s ease-in-out infinite alternate; }
        .animate-mesh-slide-reverse { animation: mesh-slide-reverse 18s ease-in-out infinite alternate; }
        .animate-stars-scroll { animation: stars-scroll 40s linear infinite; }
        .animate-progress-segment { animation: progress-segment 5s linear forwards; }
      `}</style>
    </div>
  );
};

export default CouponBanner;
