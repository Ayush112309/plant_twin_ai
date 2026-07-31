import React, { useState, useEffect } from 'react';

export type LogoVariant = 'option3' | 'option6';

interface PlantTwinLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: LogoVariant;
}

// Option 3: The Neural Infinity Loop (Mobius Twin)
export const LogoOption3: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="opt3Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>

      <filter id="opt3Glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Glowing Outer Mobius / Infinity Loop */}
    <path
      d="M 14 22 C 14 14, 22 14, 22 22 C 22 30, 30 30, 30 22 C 30 14, 22 14, 22 22 C 22 30, 14 30, 14 22 Z"
      stroke="url(#opt3Grad)"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#opt3Glow)"
    />

    {/* Physical Asset Node (Left - Emerald) */}
    <circle cx="14" cy="22" r="3.5" fill="#10B981" filter="url(#opt3Glow)">
      <animate attributeName="r" values="3;4.5;3" dur="2.4s" repeatCount="indefinite" />
    </circle>

    {/* Cloud AI Model Node (Right - Purple) */}
    <circle cx="30" cy="22" r="3.5" fill="#8B5CF6" filter="url(#opt3Glow)">
      <animate attributeName="r" values="3.5;2.5;3.5" dur="2.4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

// Option 6: The SCADA Circuit Tree (Bio-Industrial Sensor Canopy)
export const LogoOption6: React.FC<{ sizePx: number }> = ({ sizePx }) => (
  <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: sizePx, height: sizePx }}>
    <defs>
      <linearGradient id="opt6Grad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="60%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#F59E0B" />
      </linearGradient>

      <filter id="opt6Glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Tree Root Circuit Traces */}
    <path d="M 22 38 L 22 24" stroke="url(#opt6Grad)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 22 34 L 14 38" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
    <path d="M 22 34 L 30 38" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />

    {/* Canopy Branch Traces */}
    <path d="M 22 24 L 12 14" stroke="url(#opt6Grad)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 22 24 L 32 14" stroke="url(#opt6Grad)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 22 24 L 22 10" stroke="url(#opt6Grad)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M 17 19 L 10 22" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
    <path d="M 27 19 L 34 22" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />

    {/* SCADA Sensor Root Nodes */}
    <circle cx="14" cy="38" r="2.2" fill="#06B6D4" />
    <circle cx="30" cy="38" r="2.2" fill="#06B6D4" />

    {/* AI Neural Canopy Nodes */}
    <circle cx="12" cy="14" r="3" fill="#F59E0B" filter="url(#opt6Glow)" />
    <circle cx="32" cy="14" r="3" fill="#F59E0B" filter="url(#opt6Glow)" />
    <circle cx="22" cy="10" r="3.5" fill="#10B981" filter="url(#opt6Glow)">
      <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="10" cy="22" r="2" fill="#10B981" />
    <circle cx="34" cy="22" r="2" fill="#10B981" />
  </svg>
);

export const PlantTwinLogoIcon: React.FC<{ className?: string; sizePx?: number; variant?: LogoVariant }> = ({
  className = '',
  sizePx = 38,
  variant,
}) => {
  const [activeVariant, setActiveVariant] = useState<LogoVariant>(variant || 'option3');

  useEffect(() => {
    if (variant) {
      setActiveVariant(variant);
      return;
    }
    const saved = localStorage.getItem('planttwin_logo_variant') as LogoVariant;
    if (saved === 'option3' || saved === 'option6') {
      setActiveVariant(saved);
    } else {
      setActiveVariant('option3'); // Default to Option 3
    }
  }, [variant]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {/* Ambient Pulsing Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-400 to-purple-600 opacity-40 blur-md group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
      
      {/* Glass Container Shield */}
      <div className="relative w-full h-full rounded-2xl bg-slate-950/90 border border-emerald-400/40 p-1.5 flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:border-cyan-400/80 transition-all duration-300">
        {activeVariant === 'option6' ? (
          <LogoOption6 sizePx={sizePx - 8} />
        ) : (
          <LogoOption3 sizePx={sizePx - 8} />
        )}
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
