import React, { useState } from 'react';
import { Check, Sparkles, X, Shield, Cpu, Layers, Activity, Zap } from 'lucide-react';
import { LogoOptionA, LogoOptionB, LogoOptionC, LogoOptionD, LogoOptionE, LogoVariant } from './PlantTwinLogo';

interface LogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVariant: (variant: LogoVariant) => void;
  currentVariant: LogoVariant;
}

export const LOGO_OPTIONS: { id: LogoVariant; title: string; subtitle: string; description: string; tag: string; component: React.FC<{ sizePx: number }> }[] = [
  {
    id: 'optionA',
    title: 'Option 1: The Cybernetic Twin Shield',
    subtitle: 'Hexagon Frame + Dual Intertwined Sine Waves + Neural AI Core',
    description: '3D Cybernetic shield containing dual intertwining telemetry waves (Physical Asset & Digital Twin) with a central pulsing AI core node.',
    tag: 'DEFAULT / RECOMMENDED',
    component: LogoOptionA,
  },
  {
    id: 'optionB',
    title: 'Option 2: The Quantum Helix & Industrial Gear',
    subtitle: '8-Tooth Precision Gear + Quantum Telemetry Helix',
    description: 'Industrial precision gear intersected by a DNA/Quantum helix representing physical machinery fused with artificial intelligence.',
    tag: 'INDUSTRIAL HEAVY',
    component: LogoOptionB,
  },
  {
    id: 'optionC',
    title: 'Option 3: The Neural Infinity Loop',
    subtitle: 'Mobius Loop + Bidirectional Asset Synchronizer',
    description: 'Infinity loop connecting physical factory telemetry with cloud-hosted MLOps neural network for continuous learning.',
    tag: 'CONTINUOUS AI',
    component: LogoOptionC,
  },
  {
    id: 'optionD',
    title: 'Option 4: The Isometric Hex-Matrix Prism',
    subtitle: '3D SCADA Data Prism + Raytraced Node Hub',
    description: '3D isometric data cube representing multi-variate SCADA data streams and real-time hypertable ingestion.',
    tag: 'BIG DATA SCADA',
    component: LogoOptionD,
  },
  {
    id: 'optionE',
    title: 'Option 5: The Industrial Pulse Atom',
    subtitle: 'Orbital Process Ring + Refinery Tower Silhouette',
    description: 'Atomic orbital rings encapsulating a refinery tower silhouette for nuclear, chemical, and process safety operations.',
    tag: 'PROCESS SAFETY',
    component: LogoOptionE,
  },
];

export const LogoSelectorModal: React.FC<LogoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectVariant,
  currentVariant,
}) => {
  const [selected, setSelected] = useState<LogoVariant>(currentVariant);

  if (!isOpen) return null;

  const handleApply = (id: LogoVariant) => {
    setSelected(id);
    localStorage.setItem('planttwin_logo_variant', id);
    onSelectVariant(id);
    window.location.reload(); // Refresh to apply universally
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>PlantTwin AI Logo Selection Studio</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Choose your preferred brand identity emblem for PlantTwin AI OS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Logo Options List */}
        <div className="space-y-4">
          {LOGO_OPTIONS.map((option) => {
            const LogoComp = option.component;
            const isSelected = selected === option.id;

            return (
              <div
                key={option.id}
                onClick={() => handleApply(option.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border-cyan-400 shadow-xl shadow-cyan-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Logo Emblem Icon */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 shrink-0 shadow-lg">
                    <LogoComp sizePx={44} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">{option.title}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {option.tag}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-400">{option.subtitle}</div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-lg">{option.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {isSelected ? (
                    <span className="py-2 px-4 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg">
                      <Check className="w-4 h-4" />
                      <span>SELECTED</span>
                    </span>
                  ) : (
                    <span className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 font-bold text-xs text-slate-300 transition-all">
                      Select This Logo
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all"
          >
            Close Selection Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoSelectorModal;
