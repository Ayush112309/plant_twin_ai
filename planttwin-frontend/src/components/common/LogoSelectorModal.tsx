import React, { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { LogoOption3, LogoOption6, LogoVariant } from './PlantTwinLogo';

interface LogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVariant: (variant: LogoVariant) => void;
  currentVariant: LogoVariant;
}

export const LOGO_OPTIONS: { id: LogoVariant; title: string; subtitle: string; description: string; tag: string; component: React.FC<{ sizePx: number }> }[] = [
  {
    id: 'option3',
    title: 'Option 3: The Neural Infinity Loop',
    subtitle: 'Mobius Loop + Bidirectional Asset Synchronizer',
    description: 'A continuous Möbius infinity loop connecting physical asset telemetry (Emerald Node) with cloud-hosted MLOps neural models (Purple Node). Clean, modern & high-tech.',
    tag: 'RECOMMENDED / CONTINUOUS AI',
    component: LogoOption3,
  },
  {
    id: 'option6',
    title: 'Option 6: The SCADA Circuit Tree',
    subtitle: 'Bio-Industrial Sensor Canopy + PCB Circuit Traces',
    description: 'A futuristic PCB circuit tree where SCADA sensor roots connect to golden neural AI canopy nodes. Unique bio-industrial fusion for smart manufacturing.',
    tag: 'SMART MANUFACTURING',
    component: LogoOption6,
  },
];

export const LogoSelectorModal: React.FC<LogoSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectVariant,
  currentVariant,
}) => {
  const [selected, setSelected] = useState<LogoVariant>(currentVariant || 'option3');

  if (!isOpen) return null;

  const handleApply = (id: LogoVariant) => {
    setSelected(id);
    localStorage.setItem('planttwin_logo_variant', id);
    onSelectVariant(id);
    window.location.reload(); // Apply changes universally across header, landing & login
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>PlantTwin AI Logo Selection Studio</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Select between Option 3 (Neural Infinity Loop) and Option 6 (SCADA Circuit Tree)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Featured Options */}
        <div className="space-y-4">
          {LOGO_OPTIONS.map((option) => {
            const LogoComp = option.component;
            const isSelected = selected === option.id;

            return (
              <div
                key={option.id}
                onClick={() => handleApply(option.id)}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-emerald-950/90 border-cyan-400 shadow-xl shadow-cyan-950/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/90'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Logo Emblem Icon */}
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700 shrink-0 shadow-lg">
                    <LogoComp sizePx={48} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-white">{option.title}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        {option.tag}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-400">{option.subtitle}</div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-md">{option.description}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {isSelected ? (
                    <span className="py-2 px-4 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg">
                      <Check className="w-4 h-4" />
                      <span>ACTIVE</span>
                    </span>
                  ) : (
                    <span className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-cyan-600 hover:text-slate-950 font-bold text-xs text-slate-300 transition-all">
                      Select Logo
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
            Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoSelectorModal;
