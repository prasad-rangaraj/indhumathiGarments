import React from 'react';

const EMOJIS = ['👕', '👗', '👖', '👜', '👠', '🛍️', '🎀', '🕶️', '🧥'];

export const PremiumLoader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden relative mb-8 flex items-center h-24">
        {/* Left and Right fade gradients for smooth entering/exiting */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling container */}
        <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'fit-content' }}>
          {/* We duplicate the array multiple times to ensure continuous infinite scrolling */}
          {[...EMOJIS, ...EMOJIS, ...EMOJIS, ...EMOJIS].map((emoji, index) => (
            <div 
              key={index} 
              className="inline-flex items-center justify-center text-4xl mx-3 hover:scale-110 transition-transform duration-300"
              style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};
