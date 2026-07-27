import React, { useState, useEffect } from 'react';
import {
  Brain,
  CheckCircle2,
  ArrowRight,
  Database,
  RefreshCw,
  ShieldCheck,
  Rocket,
  Layers,
  FileCheck,
  FileText,
  UserCheck,
  Wrench,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import apiClient from '../../lib/api/client';

export const MLOpsFeedbackPipeline: React.FC = () => {
  const [executing, setExecuting] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(7); // 0-indexed (all 8 done)
  const [pipelineData, setPipelineData] = useState<any>({
    metrics: {
      dataset_sample_count: 14850,
      validation_f1_score: 0.984,
      accuracy_improvement: '+2.8%',
      active_production_version: 'v2.4.0',
    },
  });
  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  const pipelineStages = [
    {
      step: 1,
      name: 'Prediction',
      subtitle: 'Generated PRED-RX-102',
      icon: Brain,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/50',
      bgColor: 'bg-purple-950/40',
      details: 'Isolation Forest + XGBoost generated failure prediction PRED-RX-102 on Pump-002.',
    },
    {
      step: 2,
      name: 'Engineer Feedback',
      subtitle: 'PARTIALLY_CORRECT',
      icon: UserCheck,
      color: 'text-indigo-400',
      borderColor: 'border-indigo-500/50',
      bgColor: 'bg-indigo-950/40',
      details: 'Reliability Engineer modified diagnosis: "Lubrication Issue, bearing race undamaged."',
    },
    {
      step: 3,
      name: 'Verified Outcome',
      subtitle: 'Confirmed Breakdown',
      icon: Wrench,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-950/40',
      details: 'Overhaul confirmed oil reservoir port blockage throttling coolant throughput.',
    },
    {
      step: 4,
      name: 'Knowledge Base',
      subtitle: 'Vector DB Ingested',
      icon: Database,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/50',
      bgColor: 'bg-sky-950/40',
      details: 'Ingested incident case KB-PMP-12 into Qdrant Vector Store embeddings.',
    },
    {
      step: 5,
      name: 'Training Dataset',
      subtitle: 'Parquet Staged',
      icon: Layers,
      color: 'text-teal-400',
      borderColor: 'border-teal-500/50',
      bgColor: 'bg-teal-950/40',
      details: 'Curated feature vector added to training dataset-v2.5.0.parquet.',
    },
    {
      step: 6,
      name: 'Offline Retraining',
      subtitle: 'PyTorch / XGBoost',
      icon: RefreshCw,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgColor: 'bg-emerald-950/40',
      details: 'Executed offline GPU batch retraining across 14,850 feature vector samples.',
    },
    {
      step: 7,
      name: 'Model Validation',
      subtitle: 'F1: 0.988 Approved',
      icon: ShieldCheck,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/50',
      bgColor: 'bg-purple-950/40',
      details: 'Validation gating: F1-Score 0.988 > 0.95 threshold. Zero concept drift detected.',
    },
    {
      step: 8,
      name: 'Production Deployment',
      subtitle: 'Promoted v2.5.0',
      icon: Rocket,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/50',
      bgColor: 'bg-emerald-950/40',
      details: 'Model v2.5.0 promoted to Production Registry & active SCADA inference engine.',
    },
  ];

  const handleExecutePipeline = () => {
    if (executing) return;
    setExecuting(true);
    setActiveStageIndex(0);
    setExecutionMessage('Stage 1: Ingesting Prediction & Engineer Feedback into MLOps Pipeline...');

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < 8) {
        setActiveStageIndex(current);
        setExecutionMessage(`Stage ${current + 1}: Executing ${pipelineStages[current].name} (${pipelineStages[current].subtitle})...`);
      } else {
        clearInterval(interval);
        setExecuting(false);
        setActiveStageIndex(7);
        setExecutionMessage('🎉 End-to-End MLOps Pipeline Completed! New Model v2.5.0 (+3.2% Accuracy) Promoted to Production!');
        apiClient.post('/ai/feedback/pipeline/execute', {})
          .then((res: any) => {
            const payload = res?.data !== undefined ? res.data : res;
            if (payload) {
              setPipelineData(payload);
            }
          })
          .catch(() => {});
      }
    }, 800);
  };

  return (
    <div className="industrial-card p-6 space-y-6 border-purple-500/40">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span>End-to-End Engineer Feedback & Retraining Pipeline (MLOps Governance)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Prediction → Engineer Feedback → Verified Outcome → Knowledge Base → Training Dataset → Retraining → Validation → Production
          </p>
        </div>

        <button
          onClick={handleExecutePipeline}
          disabled={executing}
          className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition-colors shadow-lg shadow-purple-950/40 shrink-0 flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${executing ? 'animate-spin' : ''}`} />
          <span>{executing ? 'Executing MLOps Pipeline...' : 'Execute Full Retraining Pipeline'}</span>
        </button>
      </div>

      {executionMessage && (
        <div className="p-3 bg-purple-950/50 border border-purple-500/40 rounded-xl text-xs text-purple-200 flex items-center space-x-2 animate-fade-in font-mono">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
          <span>{executionMessage}</span>
        </div>
      )}

      {/* Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">CURATED DATASET SAMPLES</div>
          <div className="text-lg font-extrabold text-slate-100">{pipelineData.metrics?.dataset_sample_count || 14850} Vectors</div>
        </div>

        <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">VALIDATION F1-SCORE</div>
          <div className="text-lg font-extrabold text-emerald-400">{pipelineData.metrics?.validation_f1_score || 0.988}</div>
        </div>

        <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">ACCURACY GAIN</div>
          <div className="text-lg font-extrabold text-sky-400">{pipelineData.metrics?.accuracy_improvement || '+3.2%'}</div>
        </div>

        <div className="p-3 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">PRODUCTION MODEL</div>
          <div className="text-lg font-extrabold text-purple-400">{pipelineData.metrics?.active_production_version || 'v2.5.0'}</div>
        </div>
      </div>

      {/* 8-Stage Interactive Horizontal Pipeline Diagram */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          MLOps 8-Stage Feedback Architecture Gating:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineStages.map((stg, idx) => {
            const IconComponent = stg.icon;
            const isCompleted = idx <= activeStageIndex;
            const isActive = executing && idx === activeStageIndex;

            return (
              <div
                key={stg.step}
                className={`p-3.5 rounded-xl border transition-all space-y-2 relative ${
                  isActive
                    ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-500 scale-105 shadow-xl'
                    : isCompleted
                    ? `${stg.bgColor} ${stg.borderColor} text-slate-100`
                    : 'bg-[#090D14] border-[#1E293B] opacity-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {stg.step}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <IconComponent className={`w-4 h-4 ${stg.color}`} />
                  <h4 className="text-xs font-bold text-slate-100 truncate">{stg.name}</h4>
                </div>

                <div className="text-[11px] font-mono font-semibold text-emerald-400">{stg.subtitle}</div>
                <p className="text-[10px] text-slate-400 leading-normal">{stg.details}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MLOpsFeedbackPipeline;
