import React from 'react';

interface PlantTwinLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const PlantTwinLogoIcon: React.FC<{ className?: string; sizePx?: number }> = ({ className = '', sizePx = 36 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {/* Ambient Pulsing Backlight Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-indigo-600 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

      {/* Main Container Glass Shield */}
      <div className="relative w-full h-full rounded-2xl bg-slate-950/90 border border-emerald-400/40 p-2 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:border-cyan-400/80 transition-all duration-300">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transform group-hover:scale-105 transition-transform duration-300"
        >
          <defs>
            <linearGradient id="ptLogoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            <linearGradient id="ptLogoGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            <filter id="ptGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Cybernetic Hexagon Frame */}
          <polygon
            points="20,2 35,10 35,30 20,38 5,30 5,10"
            stroke="url(#ptLogoGrad1)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90"
          />

          {/* Left Twin Node (Physical Asset - Emerald) */}
          <path
            d="M 12 15 C 12 11, 20 11, 20 18 C 20 25, 28 25, 28 21"
            stroke="url(#ptLogoGrad2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#ptGlow)"
          />

          {/* Right Twin Node (Digital Twin - Cyan) */}
          <path
            d="M 28 25 C 28 29, 20 29, 20 22 C 20 15, 12 15, 12 19"
            stroke="url(#ptLogoGrad1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#ptGlow)"
          />

          {/* Central Neural AI Core Node */}
          <circle cx="20" cy="20" r="3" fill="#10B981" filter="url(#ptGlow)">
            <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Telemetry Wave Signal Dots */}
          <circle cx="12" cy="15" r="1.8" fill="#06B6D4" />
          <circle cx="28" cy="25" r="1.8" fill="#3B82F6" />
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
  const sizePx = size === 'sm' ? 30 : size === 'md' ? 38 : size === 'lg' ? 48 : 60;
  const textSizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center space-x-3 cursor-pointer select-none ${className}`}>
      <PlantTwinLogoIcon sizePx={sizePx} />

      {showText && (
        <div className="flex flex-col">
          <div className={`font-extrabold tracking-tight flex items-center space-x-1.5 font-sans ${textSizeClass}`}>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-indigo-300 bg-clip-text text-transparent font-black drop-shadow-sm">
              PlantTwin
            </span>
            <span className="text-white font-black">AI</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              OS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase font-semibold">
            Industrial Digital Twin Platform
          </span>
        </div>
      )}
    </div>
  );
};

export default PlantTwinLogo;
