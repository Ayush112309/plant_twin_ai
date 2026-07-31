import React from 'react';

interface PlantTwinLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// Option 3: The Neural Infinity Loop (Physical Factory + Cloud AI Model)
export const PlantTwinLogoIcon: React.FC<{ className?: string; sizePx?: number }> = ({ className = '', sizePx = 42 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {/* Ambient Backlight Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-400 to-purple-600 opacity-50 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

      {/* Glass Container Shield */}
      <div className="relative w-full h-full rounded-2xl bg-slate-950/90 border border-emerald-400/40 p-1 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:border-cyan-400/80 transition-all duration-300">
        <svg viewBox="0 0 50 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="ptInfGradFinal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>

            <filter id="ptInfGlowFinal" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Cybernetic Mobius Infinity Loop */}
          <path
            d="M 16 18 C 16 10, 25 10, 25 18 C 25 26, 34 26, 34 18 C 34 10, 25 10, 25 18 C 25 26, 16 26, 16 18 Z"
            stroke="url(#ptInfGradFinal)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#ptInfGlowFinal)"
          />

          {/* Left Loop: Physical Plant & Gear (Neon Emerald) */}
          <g transform="translate(11, 12) scale(0.32)">
            <path d="M 4 24 L 4 10 L 12 15 L 12 10 L 20 15 L 20 24 Z" stroke="#10B981" strokeWidth="2.5" fill="none" />
            <line x1="8" y1="4" x2="8" y2="10" stroke="#10B981" strokeWidth="2.5" />
            <circle cx="16" cy="19" r="3" stroke="#10B981" strokeWidth="2" fill="none" />
          </g>

          {/* Right Loop: Cloud AI Neural Cluster (Neon Purple) */}
          <g transform="translate(29, 12) scale(0.32)">
            <path d="M 8 18 C 4 18, 4 10, 10 10 C 12 4, 22 4, 24 10 C 30 10, 30 18, 24 18 Z" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
            <circle cx="16" cy="14" r="2.5" fill="#8B5CF6" />
          </g>

          {/* Orbiting Pulsing Data Nodes */}
          <circle cx="16" cy="18" r="2" fill="#10B981" filter="url(#ptInfGlowFinal)">
            <animate attributeName="r" values="1.8;3;1.8" dur="2s" repeatCount="indefinite" />
          </circle>

          <circle cx="34" cy="18" r="2" fill="#8B5CF6" filter="url(#ptInfGlowFinal)">
            <animate attributeName="r" values="2.2;1.5;2.2" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
};

export const PlantTwinLogo: React.FC<PlantTwinLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizePx = size === 'sm' ? 32 : size === 'md' ? 42 : size === 'lg' ? 52 : 64;
  const textSizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center space-x-3 cursor-pointer select-none ${className}`}>
      <PlantTwinLogoIcon sizePx={sizePx} />

      {showText && (
        <div className="flex items-center space-x-1.5 font-sans font-black tracking-tight">
          <span className={`bg-gradient-to-r from-cyan-400 via-emerald-300 to-indigo-300 bg-clip-text text-transparent ${textSizeClass}`}>
            PlantTwin
          </span>
          <span className={`text-white ${textSizeClass}`}>AI</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            OS
          </span>
        </div>
      )}
    </div>
  );
};

export default PlantTwinLogo;
