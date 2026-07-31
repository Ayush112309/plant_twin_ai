import React, { useState, useEffect } from 'react';

export type LogoVariant = 'optionA' | 'optionB' | 'optionC' | 'optionD' | 'optionE';

interface PlantTwinLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: LogoVariant;
}

// Option A: Cybernetic Twin Shield (Hexagon + Interlaced Waves + AI Core)
export const LogoOptionA: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="optAGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="50%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <filter id="optAGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <polygon points="20,2 35,10 35,30 20,38 5,30 5,10" stroke="url(#optAGrad1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 12 15 C 12 11, 20 11, 20 18 C 20 25, 28 25, 28 21" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" filter="url(#optAGlow)" />
    <path d="M 28 25 C 28 29, 20 29, 20 22 C 20 15, 12 15, 12 19" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" filter="url(#optAGlow)" />
    <circle cx="20" cy="20" r="3" fill="#10B981" filter="url(#optAGlow)">
      <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// Option B: Quantum Helix & Industrial Gear
export const LogoOptionB: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="optBGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    {/* Gear teeth */}
    <circle cx="20" cy="20" r="14" stroke="url(#optBGrad)" strokeWidth="2" strokeDasharray="4 3" />
    {/* Inner Helix */}
    <path d="M 10 20 Q 20 8, 30 20 Q 20 32, 10 20" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 10 20 Q 20 32, 30 20 Q 20 8, 10 20" stroke="#06B6D4" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="3.5" fill="#F59E0B" />
  </svg>
);

// Option C: Neural Infinity Loop (Mobius Twin)
export const LogoOptionC: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="optCGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
    </defs>
    {/* Infinity Loop */}
    <path
      d="M 13 20 C 13 13, 20 13, 20 20 C 20 27, 27 27, 27 20 C 27 13, 20 13, 20 20 C 20 27, 13 27, 13 20 Z"
      stroke="url(#optCGrad)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="13" cy="20" r="3" fill="#8B5CF6" />
    <circle cx="27" cy="20" r="3" fill="#34D399" />
  </svg>
);

// Option D: Isometric Hex-Matrix Prism
export const LogoOptionD: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="optDGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#14B8A6" />
      </linearGradient>
    </defs>
    {/* Isometric Cube */}
    <path d="M 20 4 L 34 12 L 34 28 L 20 36 L 6 28 L 6 12 Z" stroke="url(#optDGrad)" strokeWidth="2" />
    <path d="M 20 4 L 20 36" stroke="url(#optDGrad)" strokeWidth="1.5" opacity="0.6" />
    <path d="M 6 12 L 20 20 L 34 12" stroke="url(#optDGrad)" strokeWidth="1.5" opacity="0.6" />
    <circle cx="20" cy="20" r="4" fill="#3B82F6" />
  </svg>
);

// Option E: Industrial Pulse Atom
export const LogoOptionE: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="optEGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F43F5E" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
    {/* Orbital rings */}
    <ellipse cx="20" cy="20" rx="15" ry="6" stroke="url(#optEGrad)" strokeWidth="2" transform="rotate(-30 20 20)" />
    <ellipse cx="20" cy="20" rx="15" ry="6" stroke="url(#optEGrad)" strokeWidth="2" transform="rotate(30 20 20)" />
    {/* Factory Tower Silhouette */}
    <rect x="17" y="12" width="6" height="16" fill="#F43F5E" rx="1" />
    <circle cx="20" cy="20" r="2.5" fill="#06B6D4" />
  </svg>
);

export const PlantTwinLogoIcon: React.FC<{ className?: string; sizePx?: number; variant?: LogoVariant }> = ({
  className = '',
  sizePx = 38,
  variant = 'optionA',
}) => {
  const [activeVariant, setActiveVariant] = useState<LogoVariant>(variant);

  useEffect(() => {
    const saved = localStorage.getItem('planttwin_logo_variant') as LogoVariant;
    if (saved) {
      setActiveVariant(saved);
    }
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-indigo-600 opacity-40 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      <div className="relative w-full h-full rounded-2xl bg-slate-950/90 border border-emerald-400/40 p-1.5 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:border-cyan-400/80 transition-all duration-300">
        {activeVariant === 'optionA' && <LogoOptionA sizePx={sizePx - 10} />}
        {activeVariant === 'optionB' && <LogoOptionB sizePx={sizePx - 10} />}
        {activeVariant === 'optionC' && <LogoOptionC sizePx={sizePx - 10} />}
        {activeVariant === 'optionD' && <LogoOptionD sizePx={sizePx - 10} />}
        {activeVariant === 'optionE' && <LogoOptionE sizePx={sizePx - 10} />}
      </div>
    </div>
  );
};

export const PlantTwinLogo: React.FC<PlantTwinLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant,
}) => {
  const sizePx = size === 'sm' ? 30 : size === 'md' ? 38 : size === 'lg' ? 48 : 60;
  const textSizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-2xl';

  return (
    <div className={`flex items-center space-x-3 cursor-pointer select-none ${className}`}>
      <PlantTwinLogoIcon sizePx={sizePx} variant={variant} />

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
