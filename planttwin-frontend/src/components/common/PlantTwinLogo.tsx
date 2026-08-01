import React from 'react';

interface PlantTwinLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

// Transparent Metallic Rose Gold & Crystal Glass Mobius Infinity Loop Emblem
export const PlantTwinLogoIcon: React.FC<{ className?: string; sizePx?: number }> = ({ className = '', sizePx = 42 }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 group ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      {/* Soft Radial Ambient Backlight Glow on Hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500 pointer-events-none" />

      {/* Seamless Floating Emblem */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="/logo.png"
          alt="PlantTwin AI Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)] group-hover:scale-108 transition-all duration-300"
        />
      </div>
    </div>
  );
};

export const PlantTwinLogo: React.FC<PlantTwinLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const sizePx = size === 'sm' ? 36 : size === 'md' ? 46 : size === 'lg' ? 56 : 68;
  const textSizeClass = size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-2xl';

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-3 cursor-pointer select-none ${className}`}
    >
      <PlantTwinLogoIcon sizePx={sizePx} />

      {showText && (
        <div className="flex items-center space-x-1.5 font-sans font-black tracking-tight">
          <span className={`bg-gradient-to-r from-amber-300 via-rose-200 to-cyan-300 bg-clip-text text-transparent ${textSizeClass}`}>
            PlantTwin
          </span>
          <span className={`text-white ${textSizeClass}`}>AI</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            OS
          </span>
        </div>
      )}
    </div>
  );
};

export default PlantTwinLogo;
