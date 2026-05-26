import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '@/assets/logo-new.png';

type Hovered = 'women' | 'men' | null;

// Stable random positions — computed once, not every render
const womenParticles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 10 + Math.sin(i * 137.5) * 40,
  top: 5 + Math.cos(i * 97.3) * 45,
  size: 3 + (i % 4),
  dur: 3 + (i % 3),
  delay: (i * 0.35) % 4,
}));

const menParticles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: 10 + Math.cos(i * 137.5) * 40,
  top: 5 + Math.sin(i * 97.3) * 45,
  size: 3 + (i % 4),
  dur: 3 + (i % 3),
  delay: (i * 0.35) % 4,
}));

const GenderSelect = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<Hovered>(null);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState<Hovered>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const t = setTimeout(() => setMounted(true), 80);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSelect = (gender: 'women' | 'men') => {
    setLeaving(gender);
    setTimeout(() => navigate(`/shop?gender=${gender}`), 600);
  };

  const W = hovered === 'women';
  const M = hovered === 'men';

  return (
    <div
      className={`fixed inset-0 flex flex-col md:flex-row overflow-hidden select-none transition-opacity duration-700 z-10 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ fontFamily: "'Outfit', 'Inter', sans-serif", background: '#f8f3f0' }}
    >
      {/* ─── WOMEN HALF ─────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center cursor-pointer overflow-hidden w-full md:w-auto pt-16 md:pt-16"
        style={{
          flex: W ? '1.5 1 0%' : '1 1 0%',
          transition: 'flex 0.75s cubic-bezier(0.77,0,0.175,1)',
          background: W
            ? 'linear-gradient(145deg, #ffe4f0 0%, #fbc7e0 30%, #f48fb1 65%, #e91e8c 100%)'
            : 'linear-gradient(145deg, #fff0f6 0%, #fde2ef 60%, #f9b8d4 100%)',
        }}
        onMouseEnter={() => setHovered('women')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => handleSelect('women')}
        role="button"
        aria-label="Shop Women"
      >
        {/* Soft radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: W
              ? 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,255,255,0.55) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.35) 0%, transparent 70%)',
            transition: 'all 0.7s ease',
          }}
        />

        {/* Floating petals / particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {womenParticles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left + 10}%`,
                top: `${p.top + 10}%`,
                background: 'rgba(233, 30, 140, 0.35)',
                boxShadow: '0 0 6px rgba(233,30,140,0.5)',
                animation: `petal ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                opacity: (W || isMobile) ? 1 : 0,
                transition: 'opacity 0.5s ease',
              }}
            />
          ))}
        </div>

        {/* Decorative arch lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: W ? 0.18 : 0.07, transition: 'opacity 0.6s ease' }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-pink-500"
              style={{
                width: `${320 + i * 120}px`,
                height: `${320 + i * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          className="absolute top-1/2 left-1/2 z-10 flex flex-col items-center gap-5 w-full px-4"
          style={{
            transform: W ? 'translate(-50%, calc(-50% - 14px))' : 'translate(-50%, -50%)',
            transition: 'transform 0.65s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Icon ring */}
          <div
            style={{
              width: W ? 'clamp(70px, 8vw, 100px)' : 'clamp(56px, 6vw, 78px)',
              height: W ? 'clamp(70px, 8vw, 100px)' : 'clamp(56px, 6vw, 78px)',
              borderRadius: '50%',
              border: `2px solid ${W ? 'rgba(233,30,140,0.7)' : 'rgba(233,30,140,0.3)'}`,
              boxShadow: W ? '0 8px 40px rgba(233,30,140,0.35)' : 'none',
              background: W ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: W ? 'clamp(32px, 4vw, 46px)' : 'clamp(24px, 3vw, 34px)', transition: 'width 0.6s ease' }}>
              <circle cx="12" cy="8" r="4.5" stroke="#e91e8c" strokeWidth="1.8" />
              <path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="#e91e8c" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M12 16v5M9.5 19h5" stroke="#e91e8c" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Text block */}
          <div className="text-center">
            <p
              className="uppercase tracking-[0.45em] text-pink-700 font-medium mb-2"
              style={{ fontSize: '11px', opacity: W ? 1 : 0.65, transition: 'opacity 0.4s ease' }}
            >
              For Her
            </p>
            <h2
              style={{
                fontSize: W ? 'clamp(2.5rem, 6.5vw, 5.5rem)' : 'clamp(1.8rem, 4.5vw, 3.8rem)',
                fontWeight: 300,
                color: W ? '#9c0a52' : '#c2185b',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: W ? '0 4px 20px rgba(233,30,140,0.25)' : 'none',
                transition: 'all 0.65s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              She
            </h2>
            <div style={{
              height: '2px',
              background: 'linear-gradient(to right, transparent, #e91e8c, transparent)',
              marginTop: '10px',
              width: W ? 'clamp(70px, 10vw, 110px)' : 'clamp(40px, 5vw, 50px)',
              transition: 'width 0.65s cubic-bezier(0.34,1.56,0.64,1)',
              opacity: W ? 1 : 0.35,
            }} />
          </div>

          {/* Hover CTA */}
          <div className="absolute top-[100%] pt-6 left-1/2 -translate-x-1/2 flex justify-center w-full" style={{
            opacity: W ? 1 : 0,
            transform: W ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.45s ease 0.1s',
            pointerEvents: W ? 'auto' : 'none',
          }}>
            <span style={{
              color: '#c2185b',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              Explore Collection
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path d="M0 5h18M14 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Bottom tag */}
        <p
          className="absolute bottom-20 md:bottom-8 text-[10px] md:text-xs tracking-widest uppercase"
          style={{ color: 'rgba(194,24,91,0.45)', opacity: (W || isMobile) ? 0 : 0.8, transition: 'opacity 0.4s ease' }}
        >
          Women's Collection
        </p>
      </div>

      {/* ─── CENTER DIVIDER BADGE ─────────────────────────────── */}
      <div
        ref={dividerRef}
        className="relative z-30 flex-shrink-0 pointer-events-none flex items-center justify-center w-full h-[72px] -my-[36px] md:w-[72px] md:h-full md:my-0 md:-mx-[36px]"
      >
        {/* Line top / left */}
        <div className="absolute top-1/2 left-0 w-1/2 h-[1.5px] md:top-0 md:left-1/2 md:w-[1.5px] md:h-1/2 -translate-y-1/2 md:-translate-y-0 md:-translate-x-1/2 bg-gradient-to-r md:bg-gradient-to-b from-transparent to-[#8c507840]" />

        {/* Center Container */}
        <div className="relative flex items-center justify-center flex-shrink-0 z-10">
          {/* Diamond badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              transform: 'rotate(45deg)',
              background: hovered === null
                ? 'linear-gradient(135deg, #fff 0%, #fce4ec 100%)'
                : hovered === 'women'
                ? 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)'
                : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 1.5px rgba(255,255,255,0.8)',
              transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Un-rotate contents */}
            <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
              <img
                src={logoImg}
                alt="Indhumathi"
                style={{
                  width: '42px',
                  height: '42px',
                  objectFit: 'contain',
                  filter: 'saturate(1.4)',
                  opacity: 0.85,
                }}
              />
            </div>
          </div>

          {/* OR label */}
          <p
            className="absolute -bottom-6"
            style={{
              fontSize: '9px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'rgba(100,60,80,0.45)',
              opacity: hovered ? 0 : 1,
              transition: 'opacity 0.35s ease',
              whiteSpace: 'nowrap',
            }}
          >
            Choose
          </p>
        </div>

        {/* Line bottom / right */}
        <div className="absolute top-1/2 right-0 w-1/2 h-[1.5px] md:bottom-0 md:left-1/2 md:w-[1.5px] md:h-1/2 -translate-y-1/2 md:-translate-y-0 md:-translate-x-1/2 bg-gradient-to-r md:bg-gradient-to-b from-[#648cb440] to-transparent" />
      </div>

      {/* ─── MEN HALF ─────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center cursor-pointer overflow-hidden w-full md:w-auto pb-16 md:pb-0 md:pt-16"
        style={{
          flex: M ? '1.5 1 0%' : '1 1 0%',
          transition: 'flex 0.75s cubic-bezier(0.77,0,0.175,1)',
          background: M
            ? 'linear-gradient(145deg, #dff3ff 0%, #b3e0f7 30%, #64b5f6 65%, #1565c0 100%)'
            : 'linear-gradient(145deg, #eef7ff 0%, #d9edf9 60%, #aad4f0 100%)',
        }}
        onMouseEnter={() => setHovered('men')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => handleSelect('men')}
        role="button"
        aria-label="Shop Men"
      >
        {/* Soft radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: M
              ? 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)',
            transition: 'all 0.7s ease',
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {menParticles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left + 10}%`,
                top: `${p.top + 10}%`,
                background: 'rgba(21, 101, 192, 0.3)',
                boxShadow: '0 0 6px rgba(21,101,192,0.5)',
                animation: `petal ${p.dur}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                opacity: (M || isMobile) ? 1 : 0,
                transition: 'opacity 0.5s ease',
              }}
            />
          ))}
        </div>

        {/* Decorative arch lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: M ? 0.15 : 0.06, transition: 'opacity 0.6s ease' }}
        >
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute rounded-full border border-blue-600"
              style={{
                width: `${320 + i * 120}px`,
                height: `${320 + i * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div
          className="absolute top-1/2 left-1/2 z-10 flex flex-col items-center gap-5 w-full px-4"
          style={{
            transform: M ? 'translate(-50%, calc(-50% - 14px))' : 'translate(-50%, -50%)',
            transition: 'transform 0.65s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Icon ring */}
          <div
            style={{
              width: M ? 'clamp(70px, 8vw, 100px)' : 'clamp(56px, 6vw, 78px)',
              height: M ? 'clamp(70px, 8vw, 100px)' : 'clamp(56px, 6vw, 78px)',
              borderRadius: '50%',
              border: `2px solid ${M ? 'rgba(21,101,192,0.7)' : 'rgba(21,101,192,0.3)'}`,
              boxShadow: M ? '0 8px 40px rgba(21,101,192,0.3)' : 'none',
              background: M ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" style={{ width: M ? 'clamp(32px, 4vw, 46px)' : 'clamp(24px, 3vw, 34px)', transition: 'width 0.6s ease' }}>
              <circle cx="12" cy="8" r="4.5" stroke="#1565c0" strokeWidth="1.8" />
              <path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8" stroke="#1565c0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* Text block */}
          <div className="text-center">
            <p
              className="uppercase tracking-[0.45em] text-blue-800 font-medium mb-2"
              style={{ fontSize: '11px', opacity: M ? 1 : 0.65, transition: 'opacity 0.4s ease' }}
            >
              For Him
            </p>
            <h2
              style={{
                fontSize: M ? 'clamp(2.5rem, 6.5vw, 5.5rem)' : 'clamp(1.8rem, 4.5vw, 3.8rem)',
                fontWeight: 300,
                color: M ? '#0d3b7a' : '#1565c0',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                textShadow: M ? '0 4px 20px rgba(21,101,192,0.2)' : 'none',
                transition: 'all 0.65s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              He
            </h2>
            <div style={{
              height: '2px',
              background: 'linear-gradient(to right, transparent, #1565c0, transparent)',
              marginTop: '10px',
              width: M ? 'clamp(70px, 10vw, 110px)' : 'clamp(40px, 5vw, 50px)',
              transition: 'width 0.65s cubic-bezier(0.34,1.56,0.64,1)',
              opacity: M ? 1 : 0.35,
            }} />
          </div>

          {/* Hover CTA */}
          <div className="absolute top-[100%] pt-6 left-1/2 -translate-x-1/2 flex justify-center w-full" style={{
            opacity: M ? 1 : 0,
            transform: M ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.45s ease 0.1s',
            pointerEvents: M ? 'auto' : 'none',
          }}>
            <span style={{
              color: '#1565c0',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              Explore Collection
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                <path d="M0 5h18M14 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
          </div>
        </div>

        {/* Bottom tag */}
        <p
          className="absolute bottom-6 md:bottom-8 text-[10px] md:text-xs tracking-widest uppercase"
          style={{ color: 'rgba(21,101,192,0.4)', opacity: (M || isMobile) ? 0 : 0.8, transition: 'opacity 0.4s ease' }}
        >
          Men's Collection
        </p>
      </div>

      {/* ─── EXIT FLASH ───────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: leaving === 'women'
            ? 'rgba(233,30,140,0.12)'
            : leaving === 'men'
            ? 'rgba(21,101,192,0.12)'
            : 'transparent',
          opacity: leaving ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      <style>{`
        @keyframes petal {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          33% { transform: translateY(-18px) scale(1.25) rotate(60deg); }
          66% { transform: translateY(-8px) scale(0.85) rotate(-30deg); }
        }
      `}</style>
    </div>
  );
};

export default GenderSelect;
