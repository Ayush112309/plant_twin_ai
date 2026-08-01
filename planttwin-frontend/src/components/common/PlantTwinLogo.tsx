import React from 'react';

interface PlantTwinLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// Metallic Rose Gold & Crystal Glass Mobius Infinity Loop Emblem (From User Image)
export const PlantTwinLogoIcon: React.FC<{ className?: string; sizePx?: number }> = ({ className = '', sizePx = 42 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {/* Soft Backlight Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-600/40 via-cyan-500/20 to-purple-600/30 opacity-40 blur-md group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glass Container Shield */}
      <div className="relative w-full h-full rounded-2xl bg-slate-950/80 border border-amber-500/30 p-1 flex items-center justify-center shadow-xl backdrop-blur-xl group-hover:border-amber-400/70 transition-all duration-300 overflow-hidden">
        <img
          src="/logo.png"
          alt="PlantTwin AI Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300"
        />
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
          <span className={`bg-gradient-to-r from-amber-300 via-rose-200 to-cyan-300 bg-clip-text text-transparent ${textSizeClass}`}>
            PlantTwin
          </span>
          <span className={`text-white ${textSizeClass}`}>AI</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            OS
          </span>
        </div>
      )}
    </div>
  );
};

export default PlantTwinLogo;
