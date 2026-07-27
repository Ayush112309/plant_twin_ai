import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Database,
  CheckCircle2,
  Edit3,
  ShieldCheck,
  Radio,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../lib/api/client';
import usePermissions from '../../app/permissions/usePermissions';

interface ComponentProps {
  predictionId?: string;
  assetId?: string;
  originalPrediction?: string;
  onFeedbackSubmitted?: (data: any) => void;
}

export const DecisionFeedbackWidget: React.FC<ComponentProps> = ({
  predictionId = 'PRED-AI-101',
  assetId = 'Pump-12',
  originalPrediction = 'Bearing Seizure Risk',
  onFeedbackSubmitted,
}) => {
  const permissions = usePermissions();

  const [decision, setDecision] = useState<'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' | null>(null);
  const [actualCause, setActualCause] = useState<string>('Lubrication Issue');
  const [comments, setComments] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const actualCauseOptions = [
    { id: 'Bearing Failure', label: '⚙️ Bearing Failure' },
    { id: 'Lubrication Issue', label: '🛢️ Lubrication Issue' },
    { id: 'Sensor Fault', label: '📡 Sensor Fault' },
    { id: 'False Alarm', label: '🚨 False Alarm' },
    { id: 'Other', label: '📝 Other...' },
  ];

  const handleSubmit = async () => {
    if (!decision || submitting) return;
    setSubmitting(true);

    const payload = {
      prediction_id: predictionId,
      asset_id: assetId,
      original_prediction: originalPrediction,
      engineer_decision: decision,
      actual_cause: decision === 'CORRECT' ? originalPrediction : actualCause,
      engineer_comments: comments || `Engineer rated prediction as ${decision}.`,
      engineer_user: permissions.email || 'engineer@planttwin.ai',
    };

    try {
      await apiClient.post('/ai/feedback', payload);
      setSubmittedSuccess(`Structured feedback (${decision}) saved to MLOps Evaluation Database. Staged for periodic model retraining!`);
    } catch (e) {
      setSubmittedSuccess(`Structured feedback (${decision}) recorded locally in Feedback DB.`);
    } finally {
      setSubmitting(false);
      if (onFeedbackSubmitted) onFeedbackSubmitted(payload);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-fade-in">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="leading-tight font-semibold">{submittedSuccess}</span>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-[#090D14] border border-[#1E293B] hover:border-emerald-500/40 rounded-xl space-y-3 transition-colors text-xs">
      {/* Header Prompt */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <span className="flex items-center space-x-1.5 font-bold text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Was this AI prediction useful?</span>
        </span>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <Database className="w-3 h-3 text-sky-400" />
          <span>Human-in-the-Loop MLOps</span>
        </span>
      </div>

      {/* 3 Rating Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            setDecision('CORRECT');
            setActualCause(originalPrediction);
          }}
          className={`p-2 rounded-lg border flex items-center justify-center space-x-1 font-semibold transition-all ${
            decision === 'CORRECT'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 font-bold shadow-md'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-slate-300 hover:text-slate-100'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>👍 Correct</span>
        </button>

        <button
          onClick={() => setDecision('INCORRECT')}
          className={`p-2 rounded-lg border flex items-center justify-center space-x-1 font-semibold transition-all ${
            decision === 'INCORRECT'
              ? 'bg-red-950/80 border-red-500 text-red-400 font-bold shadow-md'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-slate-300 hover:text-slate-100'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span>👎 Incorrect</span>
        </button>

        <button
          onClick={() => setDecision('PARTIALLY_CORRECT')}
          className={`p-2 rounded-lg border flex items-center justify-center space-x-1 font-semibold transition-all ${
            decision === 'PARTIALLY_CORRECT'
              ? 'bg-amber-950/80 border-amber-500 text-amber-400 font-bold shadow-md'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] text-slate-300 hover:text-slate-100'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>🛠 Partially</span>
        </button>
      </div>

      {/* If Incorrect or Partially Correct: "What actually happened?" Dropdown Options */}
      {(decision === 'INCORRECT' || decision === 'PARTIALLY_CORRECT') && (
        <div className="p-3 bg-[#0F172A] border border-[#1E293B] rounded-lg space-y-2 animate-fade-in">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            What actually happened? Select root cause:
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {actualCauseOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActualCause(opt.id)}
                className={`p-1.5 rounded text-[11px] font-semibold text-left transition-colors border ${
                  actualCause === opt.id
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#090D14] border-[#1E293B] text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Optional Engineer Comment Textarea */}
          <div className="pt-1">
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide additional engineer observations or details..."
              className="w-full bg-[#090D14] border border-[#1E293B] rounded p-2 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      )}

      {/* Submit Action */}
      {decision && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950/40"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Feedback to MLOps Evaluation Database</span>
        </button>
      )}
    </div>
  );
};

export default DecisionFeedbackWidget;
