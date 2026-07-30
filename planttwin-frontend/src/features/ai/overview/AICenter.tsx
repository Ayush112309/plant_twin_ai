import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Clock,
  BookOpen,
  Database,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Filter,
  FileText,
  ArrowRight,
  TrendingUp,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  BarChart2,
  Layers,
  UserCheck,
  Plus
} from 'lucide-react';
import { usePlantTelemetry } from '../../../app/contexts/PlantTelemetryContext';
import { AICaseLibraryWorkspace } from '../case_library/AICaseLibraryWorkspace';
import { MLOpsFeedbackPipeline } from '../../../components/ai/MLOpsFeedbackPipeline';

interface FeedbackItem {
  id: string;
  timestamp: string;
  assetTag: string;
  assetName: string;
  modelName: string;
  predictedAnomaly: string;
  confidence: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  verdict: 'PENDING' | 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'NEEDS_DATA';
  engineerNotes: string;
  reviewedBy?: string;
}

export const AICenter: React.FC = () => {
  const { systemHealthScore, rulDays, activeAlerts, equipmentList: contextEquipmentList } = usePlantTelemetry();
  const [activeTab, setActiveTab] = useState<'health' | 'anomaly' | 'rul' | 'rca' | 'xai' | 'cases' | 'registry' | 'feedback'>('feedback');
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainMsg, setRetrainMsg] = useState<string | null>(null);

  // Active Learning & Engineer Feedback State
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | 'PENDING' | 'TRUE_POSITIVE' | 'FALSE_POSITIVE'>('ALL');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([
    {
      id: 'ANO-9082',
      timestamp: '2026-07-30 11:42:10',
      assetTag: 'Reactor-001',
      assetName: 'Reactor-001 Vessel',
      modelName: 'Isolation Forest v2.4.0',
      predictedAnomaly: 'Thermal Drift & High Inlet Temperature Excursion',
      confidence: 96.2,
      severity: 'CRITICAL',
      verdict: 'PENDING',
      engineerNotes: 'Awaiting reliability engineer validation after thermal cycle.',
    },
    {
      id: 'ANO-9079',
      timestamp: '2026-07-30 10:15:44',
      assetTag: 'Pump-002',
      assetName: 'Pump-002 Centrifugal',
      modelName: 'XGBoost Failure Predictor v2.4.0',
      predictedAnomaly: 'Bearing Cavitation & High Frequency Vibration Drift',
      confidence: 91.8,
      severity: 'WARNING',
      verdict: 'TRUE_POSITIVE',
      engineerNotes: 'Confirmed bearing wear during physical inspection. Replaced SKF seal.',
      reviewedBy: 'admin@apex.com',
    },
    {
      id: 'ANO-9071',
      timestamp: '2026-07-30 08:30:12',
      assetTag: 'Compressor-001',
      assetName: 'Compressor-001 Gas',
      modelName: 'Multi-Variate Autoencoder v2.1.2',
      predictedAnomaly: 'Transient Discharge Valve Differential Spikes',
      confidence: 84.5,
      severity: 'INFO',
      verdict: 'FALSE_POSITIVE',
      engineerNotes: 'Normal valve switching behavior during scheduled pressure equalization.',
      reviewedBy: 'admin@apex.com',
    },
    {
      id: 'ANO-9065',
      timestamp: '2026-07-29 22:11:05',
      assetTag: 'Exchanger-101',
      assetName: 'Heat Exchanger-101',
      modelName: 'Isolation Forest v2.4.0',
      predictedAnomaly: 'Fouling Thermal Resistance Impedance',
      confidence: 93.4,
      severity: 'WARNING',
      verdict: 'TRUE_POSITIVE',
      engineerNotes: 'Clean-in-place (CIP) cycle scheduled based on validation.',
      reviewedBy: 'admin@apex.com',
    },
  ]);

  const [showNewFeedbackModal, setShowNewFeedbackModal] = useState(false);
  const [newFeedbackForm, setNewFeedbackForm] = useState({
    assetTag: 'Reactor-001',
    predictedAnomaly: 'Unscheduled Mechanical Resonance',
    verdict: 'TRUE_POSITIVE' as 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'NEEDS_DATA',
    engineerNotes: '',
  });

  const handleUpdateVerdict = (id: string, newVerdict: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'NEEDS_DATA', notes?: string) => {
    setFeedbackList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              verdict: newVerdict,
              reviewedBy: 'admin@apex.com',
              engineerNotes: notes !== undefined ? notes : item.engineerNotes,
            }
          : item
      )
    );
    setRetrainMsg(`Feedback logged for ${id}: Marked as ${newVerdict.replace('_', ' ')}.`);
    setTimeout(() => setRetrainMsg(null), 4000);
  };

  const handleAddCustomFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: FeedbackItem = {
      id: `ANO-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      assetTag: newFeedbackForm.assetTag,
      assetName: equipmentList.find(e => e.tag === newFeedbackForm.assetTag)?.name || newFeedbackForm.assetTag,
      modelName: 'Active Learning Feedback Engine',
      predictedAnomaly: newFeedbackForm.predictedAnomaly,
      confidence: 95.0,
      severity: 'WARNING',
      verdict: newFeedbackForm.verdict,
      engineerNotes: newFeedbackForm.engineerNotes || 'Engineer manual active learning entry.',
      reviewedBy: 'admin@apex.com',
    };
    setFeedbackList([newItem, ...feedbackList]);
    setShowNewFeedbackModal(false);
    setNewFeedbackForm({
      assetTag: 'Reactor-001',
      predictedAnomaly: 'Unscheduled Mechanical Resonance',
      verdict: 'TRUE_POSITIVE',
      engineerNotes: '',
    });
    setRetrainMsg(`New Human-in-the-loop Active Learning feedback submitted for ${newItem.assetTag}!`);
    setTimeout(() => setRetrainMsg(null), 4000);
  };

  const handleRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setRetrainMsg('AI RUL XGBoost Model & Isolation Forest Retrained Successfully on 45,000 SCADA Telemetry Points & Verified Engineer Feedback!');
      setTimeout(() => setRetrainMsg(null), 5000);
    }, 1500);
  };

  const equipmentList = contextEquipmentList && contextEquipmentList.length > 0
    ? contextEquipmentList.map(eq => ({
        tag: eq.asset_tag,
        name: eq.name,
        score: eq.health_score,
        rul: `${eq.health_score < 50 ? 14 : eq.health_score < 70 ? 45 : 142} Days`,
        status: eq.status === 'Critical' ? 'CRITICAL' : eq.status === 'Warning' ? 'WARNING' : 'HEALTHY',
      }))
    : [
        { tag: 'Reactor-001', name: 'Reactor-001 Vessel', score: systemHealthScore, rul: `${rulDays} Days`, status: systemHealthScore < 70 ? 'WARNING' : 'HEALTHY' },
        { tag: 'Pump-002', name: 'Pump-002 Centrifugal', score: 88.5, rul: '142 Days', status: 'HEALTHY' },
        { tag: 'Compressor-001', name: 'Compressor-001 Gas', score: 94.1, rul: '210 Days', status: 'HEALTHY' },
      ];

  // Calculate feedback metrics
  const totalReviewed = feedbackList.filter(f => f.verdict !== 'PENDING').length;
  const truePositives = feedbackList.filter(f => f.verdict === 'TRUE_POSITIVE').length;
  const falsePositives = feedbackList.filter(f => f.verdict === 'FALSE_POSITIVE').length;
  const agreementRate = totalReviewed > 0 ? ((truePositives / totalReviewed) * 100).toFixed(1) : '94.8';
  const pendingCount = feedbackList.filter(f => f.verdict === 'PENDING').length;

  const filteredFeedback = feedbackList.filter(item => {
    if (feedbackFilter === 'PENDING') return item.verdict === 'PENDING';
    if (feedbackFilter === 'TRUE_POSITIVE') return item.verdict === 'TRUE_POSITIVE';
    if (feedbackFilter === 'FALSE_POSITIVE') return item.verdict === 'FALSE_POSITIVE';
    return true;
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                AI Platform & Predictive Intelligence
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 shrink-0 leading-none">
                AI ENGINES ONLINE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Industrial ML Models, Equipment Health Scores, Anomaly Detection & RUL Forecasting
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRetrain}
            disabled={isRetraining}
            className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl shrink-0 font-mono shadow-md transition-all"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isRetraining ? 'animate-spin' : ''}`} />
            <span>{isRetraining ? 'Retraining ML Models...' : 'Retrain AI Models'}</span>
          </button>
        </div>
      </div>

      {retrainMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center space-x-2 font-mono shadow-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{retrainMsg}</span>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs font-mono font-bold shadow-sm">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'health'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0" />
          <span>Equipment Health Score ({systemHealthScore}%)</span>
        </button>

        <button
          onClick={() => setActiveTab('anomaly')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'anomaly'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Anomaly Detection</span>
        </button>

        <button
          onClick={() => setActiveTab('rul')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'rul'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>RUL Forecasting</span>
        </button>

        <button
          onClick={() => setActiveTab('rca')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'rca'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>Root Cause Analysis (RCA)</span>
        </button>

        <button
          onClick={() => setActiveTab('xai')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'xai'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>Explainable AI (XAI)</span>
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'cases'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>AI Case Library</span>
        </button>

        <button
          onClick={() => setActiveTab('registry')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'registry'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>Model Registry & Feature Store</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'feedback'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Engineer Feedback & MLOps</span>
        </button>
      </div>

      {/* Tab 1: Equipment Health Score */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                OVERALL HEALTH SCORE
              </div>
              <div className={`text-3xl font-extrabold font-mono ${systemHealthScore < 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {systemHealthScore}%
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Weighted Average across {equipmentList.length} assets</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                ESTIMATED RUL
              </div>
              <div className={`text-3xl font-extrabold font-mono ${rulDays < 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {rulDays} Days
              </div>
              <div className="text-xs text-[var(--text-secondary)]">XGBoost & SHAP Curve Model</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                ACTIVE AI ANOMALIES
              </div>
              <div className="text-3xl font-extrabold font-mono text-amber-500">{activeAlerts.length || 2} Detected</div>
              <div className="text-xs text-[var(--text-secondary)]">Isolation Forest Algorithm</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                MODEL ACCURACY
              </div>
              <div className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">98.4%</div>
              <div className="text-xs text-emerald-500 font-bold">Validated against 10k Records</div>
            </div>
          </div>

          {/* Asset Health Roster with Live Sensor Parameter Gauges */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Multi-Asset Equipment Health Score Roster</h3>
                <p className="text-[var(--text-secondary)] text-[11px]">Real-time weighted health score computed from multi-variate telemetry streams</p>
              </div>

              <button
                onClick={() => {
                  setRetrainMsg('⚡ Multi-Asset Real-Time Diagnostics Scan Completed across all 3 refinery units!');
                  setTimeout(() => setRetrainMsg(null), 4000);
                }}
                className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition-all shadow-md shrink-0 flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Run AI Health Scan</span>
              </button>
            </div>

            <div className="space-y-4">
              {equipmentList.map((item) => (
                <div key={item.tag} className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md hover:border-[var(--brand-primary)]/50 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)]/50 pb-2">
                    <div>
                      <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans">{item.name} ({item.tag})</div>
                      <div className="text-[var(--text-secondary)] text-[11px]">Estimated Remaining Useful Life: <strong className="text-amber-400">{item.rul}</strong></div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-xs text-[var(--text-secondary)]">Health Index</div>
                        <div className={`text-xl font-extrabold ${item.score < 50 ? 'text-rose-400' : item.score < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {item.score}%
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold ${
                        item.status === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        item.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Variate Telemetry Sensor Mini-Gauges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] pt-1">
                    <div className="p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                      <div className="text-[var(--text-secondary)] text-[10px]">Temperature</div>
                      <div className="font-extrabold text-[var(--text-primary)] mt-0.5">{item.tag === 'Reactor-001' ? '142.8 °C ⚠️' : '84.5 °C'}</div>
                    </div>
                    <div className="p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                      <div className="text-[var(--text-secondary)] text-[10px]">Vibration Velocity</div>
                      <div className="font-extrabold text-[var(--text-primary)] mt-0.5">{item.tag === 'Pump-002' ? '1.85 mm/s ⚠️' : '0.24 mm/s'}</div>
                    </div>
                    <div className="p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                      <div className="text-[var(--text-secondary)] text-[10px]">Discharge Pressure</div>
                      <div className="font-extrabold text-[var(--text-primary)] mt-0.5">520.0 BAR</div>
                    </div>
                    <div className="p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)]">
                      <div className="text-[var(--text-secondary)] text-[10px]">Acoustic Spectrum</div>
                      <div className="font-extrabold text-emerald-400 mt-0.5">NORMAL</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Anomaly Detection */}
      {activeTab === 'anomaly' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Isolation Forest Parameters & Sensitivity Panel */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Isolation Forest Real-Time Anomaly Sensitivity Controls</span>
                </h3>
                <p className="text-[var(--text-secondary)] text-[11px]">Adjust anomaly score thresholds and contamination parameters</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 text-[10px]">
                {activeAlerts.length || 2} Active Anomaly Signals
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div className="p-3.5 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-color)] space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--text-primary)]">
                  <span>Contamination Rate (α)</span>
                  <span className="text-amber-400">0.05 (5%)</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">Expected percentage of outliers in telemetry stream</div>
              </div>
              <div className="p-3.5 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-color)] space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--text-primary)]">
                  <span>Anomaly Cutoff Score</span>
                  <span className="text-amber-400">0.75</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">Signals above 0.75 trigger ISA-18.2 Critical Alerts</div>
              </div>
              <div className="p-3.5 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-color)] space-y-1.5">
                <div className="flex justify-between font-bold text-[var(--text-primary)]">
                  <span>Inference Latency</span>
                  <span className="text-emerald-400">4.2 ms</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">Sub-millisecond sliding window evaluation</div>
              </div>
            </div>
          </div>

          {/* Active Anomaly Stream Cards with Outlier Waveforms */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Multi-Variate Telemetry Outlier Stream</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Anomaly Card 1: Reactor-001 Thermal Drift */}
              <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Reactor-001 Thermal Drift</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    CRITICAL (Score: 0.92)
                  </span>
                </div>
                <div className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                  Inlet Temperature Excursion: <strong className="text-rose-400">142.8 °C</strong> (+14.2°C variance above nominal baseline 84.5°C).
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div className="bg-rose-500 h-full w-[92%]" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/50">
                  <span className="text-[10px] text-[var(--text-secondary)]">Detected: Just Now via Siemens S7 / OPC-UA</span>
                  <button
                    onClick={() => {
                      setRetrainMsg('🚨 Emergency Dispatch Work Order auto-created for Reactor-001 Thermal Drift!');
                      setTimeout(() => setRetrainMsg(null), 4000);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-all"
                  >
                    Escalate to Work Order
                  </button>
                </div>
              </div>

              {/* Anomaly Card 2: Pump-002 Vibration Harmonics */}
              <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Pump-002 Vibration Harmonics</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    WARNING (Score: 0.78)
                  </span>
                </div>
                <div className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                  Bearing Harmonic Frequency Shift: <strong className="text-amber-400">1.85 mm/s</strong> (ISO 10816 Class II threshold exceeded).
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div className="bg-amber-500 h-full w-[78%]" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]/50">
                  <span className="text-[10px] text-[var(--text-secondary)]">Detected: 2 mins ago via MQTT Sparkplug B</span>
                  <button
                    onClick={() => {
                      setRetrainMsg('🚨 Emergency Dispatch Work Order auto-created for Pump-002 Vibration Spike!');
                      setTimeout(() => setRetrainMsg(null), 4000);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px] transition-all"
                  >
                    Escalate to Work Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RUL Forecasting */}
      {activeTab === 'rul' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Weibull & Financial Impact Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Remaining Useful Life (RUL) Weibull Survival Curves</h3>
                <p className="text-[var(--text-secondary)] text-[11px]">Neural Network & Degradation Trajectory Horizon Estimates</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30 text-[10px]">
                Weibull β=2.4 (Accelerated Wear)
              </span>
            </div>

            {/* Financial Downtime Risk & Net Cost Savings Estimator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
              <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-1 text-rose-200">
                <div className="text-[10px] font-bold text-rose-400 uppercase">Unscheduled Outage Risk</div>
                <div className="text-2xl font-extrabold text-rose-400 font-mono">$145,000</div>
                <div className="text-[10px] text-rose-300">Estimated cost of emergency plant trip & lost yield</div>
              </div>
              <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-xl space-y-1 text-sky-200">
                <div className="text-[10px] font-bold text-sky-400 uppercase">Planned Intervention Cost</div>
                <div className="text-2xl font-extrabold text-sky-400 font-mono">$12,500</div>
                <div className="text-[10px] text-sky-300">Parts replacement & scheduled shift maintenance</div>
              </div>
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1 text-emerald-200">
                <div className="text-[10px] font-bold text-emerald-400 uppercase">Net Cost Savings</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">$132,500 Saved</div>
                <div className="text-[10px] text-emerald-300">ROI achieved by early AI predictive dispatch</div>
              </div>
            </div>

            {/* RUL Asset List */}
            <div className="space-y-3 pt-2">
              {equipmentList.map(item => (
                <div key={item.tag} className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-2 shadow-md hover:border-[var(--brand-primary)]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[var(--text-primary)] font-sans">{item.name} ({item.tag})</span>
                    <span className="font-extrabold text-emerald-400 text-sm">{item.rul} Estimated RUL</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[var(--text-secondary)] gap-1">
                    <span>Confidence Bound (95% CI): <strong>±4.2 Days</strong></span>
                    <span>Target Intervention Window: <strong>{new Date(Date.now() + 14 * 86400000).toLocaleDateString()}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Root Cause Analysis (RCA & Causal DAG) */}
      {activeTab === 'rca' && (
        <div className="space-y-6 font-mono text-xs">
          {/* RCA Header Bar */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Root Cause Analysis (Causal DAG & Fault Tree Analysis)</span>
                </h3>
                <p className="text-[var(--text-secondary)] text-[11px]">Upstream root cause identification and causal event propagation mapping</p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30 text-[10px]">
                Bayesian Causal Network Engine
              </span>
            </div>

            {/* Causal DAG Tree Visualizer */}
            <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md">
              <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Causal DAG Dependency Tree (Root Cause Propagation Path)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-[10px] pt-1">
                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-purple-500/40 space-y-1 shadow-sm">
                  <div className="text-purple-400 font-bold uppercase">1. Root Trigger</div>
                  <div className="font-extrabold text-[var(--text-primary)]">Coolant Bypass Valve Stiction</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">Probability: 88.4%</div>
                </div>

                <div className="flex items-center justify-center text-purple-400 font-bold">➔</div>

                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-rose-500/40 space-y-1 shadow-sm">
                  <div className="text-rose-400 font-bold uppercase">2. Thermal Drift</div>
                  <div className="font-extrabold text-[var(--text-primary)]">Inlet Temp Surge (142.8 °C)</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">Variance: +14.2 °C</div>
                </div>

                <div className="flex items-center justify-center text-amber-400 font-bold">➔</div>

                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-amber-500/40 space-y-1 shadow-sm">
                  <div className="text-amber-400 font-bold uppercase">3. Mechanical Degradation</div>
                  <div className="font-extrabold text-[var(--text-primary)]">Bearing Vib Spike (1.85 mm/s)</div>
                  <div className="text-[9px] text-[var(--text-secondary)]">ISO Limit: 1.50 mm/s</div>
                </div>
              </div>
            </div>

            {/* Fault Tree Analysis (FTA) Breakdown Table */}
            <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md">
              <h4 className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Fault Tree Analysis (FTA) Probability Matrix</h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px]">
                      <th className="py-2 px-3 font-bold">Subsystem Node</th>
                      <th className="py-2 px-3 font-bold">Fault Description</th>
                      <th className="py-2 px-3 font-bold">Root Cause Contribution</th>
                      <th className="py-2 px-3 font-bold">Confidence</th>
                      <th className="py-2 px-3 font-bold">Corrective Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-rose-400">Coolant Loop (VALVE-104)</td>
                      <td className="py-2.5 px-3">Mechanical Stiction in Valve Actuator</td>
                      <td className="py-2.5 px-3 font-extrabold text-rose-400">42.5% Primary</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">96.8%</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => {
                            setRetrainMsg('🚨 Emergency Work Order dispatched for Coolant Valve Actuator Calibrator!');
                            setTimeout(() => setRetrainMsg(null), 4000);
                          }}
                          className="py-1 px-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]"
                        >
                          Dispatch Work Order
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-amber-400">Drive Assembly (PUMP-002)</td>
                      <td className="py-2.5 px-3">Drive End Bearing Frictional Fatigue</td>
                      <td className="py-2.5 px-3 font-extrabold text-amber-400">38.0% Secondary</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">92.4%</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => {
                            setRetrainMsg('🚨 Emergency Work Order dispatched for Pump-002 Bearing Replacement!');
                            setTimeout(() => setRetrainMsg(null), 4000);
                          }}
                          className="py-1 px-2.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px]"
                        >
                          Dispatch Work Order
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Explainable AI (SHAP & Counterfactual Simulator) */}
      {activeTab === 'xai' && (
        <div className="space-y-6 font-mono text-xs">
          {/* XAI Header Bar */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Explainable AI (SHAP / LIME & Counterfactual Simulator)</span>
                </h3>
                <p className="text-[var(--text-secondary)] text-[11px]">Deconstruct machine learning predictions into feature attributions & interactive what-if scenarios</p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-400 font-bold border border-purple-500/30 text-[10px]">
                XGBoost Kernel Explainer v0.42
              </span>
            </div>

            {/* Interactive Counterfactual "What-If" Simulator Panel */}
            <div className="p-5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Counterfactual "What-If" Telemetry Simulator</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
                  REAL-TIME SENSITIVITY INFERENCE
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Control 1: Inlet Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-[var(--text-primary)]">Simulated Inlet Temperature (°C)</span>
                    <span className="text-rose-400 font-extrabold">142.8 °C</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    defaultValue="142.8"
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>Nominal: 84.5 °C</span>
                    <span>Critical Trip: 150.0 °C</span>
                  </div>
                </div>

                {/* Control 2: Bearing Vibration */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-[var(--text-primary)]">Simulated Vibration Velocity (mm/s)</span>
                    <span className="text-amber-400 font-extrabold">1.85 mm/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.05"
                    defaultValue="1.85"
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                    <span>Nominal: 0.24 mm/s</span>
                    <span>ISO 10816 Limit: 1.50 mm/s</span>
                  </div>
                </div>
              </div>

              {/* Counterfactual Impact Output Card */}
              <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Predicted Asset Health</div>
                  <div className="text-xl font-extrabold text-rose-400 font-mono mt-0.5">38.5% CRITICAL</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Predicted RUL Horizon</div>
                  <div className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">14 Days Remaining</div>
                </div>
                <div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">Risk Mitigation Verdict</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    Reducing Temp to 85°C & Vib to 0.24mm/s restores RUL to <strong>142 Days (HEALTHY)</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Asset SHAP Feature Contribution Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Asset 1: Centrifugal Pump-002 Vibration SHAP Card (Workflow 2) */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Centrifugal Pump-002 SHAP Feature Attribution</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  BEARING SPIKE
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Bearing Vibration RMS (mm/s)</span>
                    <span className="font-bold text-amber-400">+54.2% SHAP Value (1.85 mm/s)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-amber-400 h-full w-[54.2%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Drive End Bearing Temp (°C)</span>
                    <span className="font-bold text-orange-400">+28.5% SHAP Value (84.5 °C)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-orange-400 h-full w-[28.5%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Pump Shaft Load & Turbulence (m³/h)</span>
                    <span className="font-bold text-sky-400">+17.3% SHAP Value (1250 m³/h)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-sky-400 h-full w-[17.3%]" />
                  </div>
                </div>
              </div>

              {/* Prescriptive Recommendation Box */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] space-y-2 text-amber-200">
                <div className="font-bold text-amber-400 flex items-center justify-between">
                  <span>🛠️ Prescriptive Maintenance Recommendation:</span>
                  <button
                    onClick={() => {
                      setRetrainMsg('🚨 Emergency Dispatch Work Order generated for Pump-002 Bearing Assembly Replacement!');
                      setTimeout(() => setRetrainMsg(null), 4000);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] transition-all shadow-md"
                  >
                    Dispatch Work Order
                  </button>
                </div>
                <p className="leading-relaxed text-[10.5px]">
                  Pump-002 bearing vibration exceeds ISO 10816 threshold (<strong>1.85 mm/s</strong> vs 1.50 mm/s limit). RUL model estimates <strong>14 Days remaining</strong>. Recommended action: Dispatch maintenance team to replace drive end bearing assembly before impeller seizure.
                </p>
              </div>
            </div>

            {/* Asset 2: Reactor-001 Vessel Thermal SHAP Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                <div className="font-extrabold text-sm text-[var(--text-primary)] font-sans">Reactor-001 Vessel SHAP Feature Attribution</div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                  THERMAL DRIFT
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Inlet Temperature (°C)</span>
                    <span className="font-bold text-rose-500">+42.5% SHAP Value (142.8 °C)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-rose-500 h-full w-[42.5%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Vibration RMS (mm/s)</span>
                    <span className="font-bold text-amber-500">+38.0% SHAP Value</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-amber-500 h-full w-[38%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>System Pressure (BAR)</span>
                    <span className="font-bold text-sky-500">+19.5% SHAP Value (520 bar)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-sky-500 h-full w-[19.5%]" />
                  </div>
                </div>
              </div>

              {/* Prescriptive Recommendation Box */}
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] space-y-2 text-rose-200">
                <div className="font-bold text-rose-400 flex items-center justify-between">
                  <span>🔥 Prescriptive Maintenance Recommendation:</span>
                  <button
                    onClick={() => {
                      setRetrainMsg('🚨 Emergency Dispatch Work Order generated for Reactor-001 Coolant Calibration!');
                      setTimeout(() => setRetrainMsg(null), 4000);
                    }}
                    className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] transition-all shadow-md"
                  >
                    Dispatch Work Order
                  </button>
                </div>
                <p className="leading-relaxed text-[10.5px]">
                  Reactor-001 temperature spike (<strong>142.8 °C</strong>) indicates catalytic bed overheating. Recommended action: Modulate coolant bypass valve and inspect thermal sensor calibration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: AI Case Library */}
      {activeTab === 'cases' && (
        <AICaseLibraryWorkspace />
      )}

      {/* Tab 6: Model Registry & Feature Store */}
      {activeTab === 'registry' && (
        <div className="space-y-6 font-mono text-xs">
          {/* Production Models Section */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">MLflow Model Registry & Lineage</h3>
                <p className="text-[var(--text-secondary)]">Deployed production artifacts, hyperparameters, and candidate models</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/30 text-[10px]">
                3 Production Models Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)] text-sm font-sans">xgboost-rul-v2.4.0</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    PRODUCTION
                  </span>
                </div>
                <div className="text-[var(--text-secondary)] text-[11px] space-y-1">
                  <div>Model Type: <strong className="text-[var(--text-primary)]">XGBoost Regressor</strong></div>
                  <div>Accuracy: <strong className="text-emerald-400">98.4%</strong> | F1-Score: <strong className="text-emerald-400">0.976</strong></div>
                  <div>Latency: <strong className="text-sky-400">3.8 ms</strong> | Memory Footprint: <strong className="text-slate-300">14.2 MB</strong></div>
                </div>
                <div className="p-2.5 bg-[var(--bg-card)] rounded-lg text-[10px] text-[var(--text-secondary)] border border-[var(--border-color)]">
                  Hyperparameters: max_depth=6, n_estimators=300, learning_rate=0.03 | Trained on 45,000 SCADA telemetry records
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--text-primary)] text-sm font-sans">isolation-forest-anomaly-v2.4.0</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    PRODUCTION
                  </span>
                </div>
                <div className="text-[var(--text-secondary)] text-[11px] space-y-1">
                  <div>Model Type: <strong className="text-[var(--text-primary)]">Isolation Forest Outlier Detector</strong></div>
                  <div>Precision: <strong className="text-emerald-400">96.2%</strong> | Recall: <strong className="text-emerald-400">94.8%</strong></div>
                  <div>Latency: <strong className="text-sky-400">4.2 ms</strong> | Contamination: <strong className="text-amber-400">0.05</strong></div>
                </div>
                <div className="p-2.5 bg-[var(--bg-card)] rounded-lg text-[10px] text-[var(--text-secondary)] border border-[var(--border-color)]">
                  Hyperparameters: n_estimators=200, max_samples=auto | Real-time stream scoring active
                </div>
              </div>
            </div>

            {/* Candidate Model Promotion Banner */}
            <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-extrabold text-purple-300 font-sans flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Candidate Model Ready: lstm-telemetry-forecaster-v3.0-rc1</span>
                </div>
                <p className="text-[11px] text-purple-200">
                  Passed automated validation against 10k SCADA test set. Validation Loss: 0.012 (14% accuracy improvement over XGBoost baseline).
                </p>
              </div>

              <button
                onClick={() => {
                  setRetrainMsg('🚀 Candidate Model lstm-telemetry-forecaster-v3.0-rc1 Promoted to Production Registry!');
                  setTimeout(() => setRetrainMsg(null), 5000);
                }}
                className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shrink-0 whitespace-nowrap"
              >
                🚀 Promote to Production
              </button>
            </div>
          </div>

          {/* Feature Store Table */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center space-x-2">
                  <Database className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Feast Industrial Feature Store (Offline & Online Ingestion)</span>
                </h3>
                <p className="text-[var(--text-secondary)] text-[11px]">Real-time feature view entities and aggregations</p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                4 Active Feature Views
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px]">
                    <th className="py-2 px-3 font-bold">Feature Name</th>
                    <th className="py-2 px-3 font-bold">Entity</th>
                    <th className="py-2 px-3 font-bold">Data Type</th>
                    <th className="py-2 px-3 font-bold">Transformation Window</th>
                    <th className="py-2 px-3 font-bold">Source Tag</th>
                    <th className="py-2 px-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">sensor_temp_mean_10m</td>
                    <td className="py-2.5 px-3">Reactor-001</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">Float64</td>
                    <td className="py-2.5 px-3">10-Minute Moving Average</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">DB100.DBD4</td>
                    <td className="py-2.5 px-3"><span className="text-emerald-400 font-bold">ONLINE (1ms)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-400">vibration_rms_peak</td>
                    <td className="py-2.5 px-3">Pump-002</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">Float64</td>
                    <td className="py-2.5 px-3">5-Minute Peak Amplitude</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">DB100.DBD0</td>
                    <td className="py-2.5 px-3"><span className="text-emerald-400 font-bold">ONLINE (1ms)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-rose-400">pressure_rate_of_change_dt</td>
                    <td className="py-2.5 px-3">Hydrocracker Header</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">Float64</td>
                    <td className="py-2.5 px-3">1-Minute Instant Derivative (dP/dt)</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">ns=2;s=RefineryAlpha...</td>
                    <td className="py-2.5 px-3"><span className="text-emerald-400 font-bold">ONLINE (1ms)</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-purple-400">acoustic_harmonic_ratio</td>
                    <td className="py-2.5 px-3">Compressor-001</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">Float64</td>
                    <td className="py-2.5 px-3">FFT Spectrum High-Harmonic Ratio</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">spBv1.0/Compressor...</td>
                    <td className="py-2.5 px-3"><span className="text-emerald-400 font-bold">ONLINE (1ms)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Engineer Feedback & MLOps */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Interactive 8-Stage Retraining Pipeline */}
          <MLOpsFeedbackPipeline />

          {/* MLOps & Active Learning Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <span>AGREEMENT RATE</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-500">
                {agreementRate}%
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Operator True Positive Rate</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <span>PENDING VALIDATIONS</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-amber-500">
                {pendingCount}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Active Learning Review Queue</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <span>TRUE POSITIVES</span>
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                {truePositives}
              </div>
              <div className="text-xs text-emerald-500 font-bold">Validated Asset Failures</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                <span>FALSE POSITIVES</span>
                <ThumbsDown className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-[var(--text-primary)]">
                {falsePositives}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">Filtered Noise Anomalies</div>
            </div>
          </div>

          {/* Active Learning Queue & Table */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
                  Reliability Engineer Feedback & Active Learning Stream
                </h3>
                <p className="text-[var(--text-secondary)] mt-0.5">
                  Human-in-the-loop validation for anomaly predictions and continuous model retraining
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl p-1 text-[11px]">
                  <button
                    onClick={() => setFeedbackFilter('ALL')}
                    className={`px-3 py-1 rounded-lg transition-all font-bold ${
                      feedbackFilter === 'ALL'
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    All ({feedbackList.length})
                  </button>
                  <button
                    onClick={() => setFeedbackFilter('PENDING')}
                    className={`px-3 py-1 rounded-lg transition-all font-bold ${
                      feedbackFilter === 'PENDING'
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFeedbackFilter('TRUE_POSITIVE')}
                    className={`px-3 py-1 rounded-lg transition-all font-bold ${
                      feedbackFilter === 'TRUE_POSITIVE'
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Confirmed ({truePositives})
                  </button>
                </div>

                <button
                  onClick={() => setShowNewFeedbackModal(true)}
                  className="btn-nexus-primary bg-[var(--brand-primary)] text-white px-3 py-1.5 rounded-xl font-bold inline-flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Feedback</span>
                </button>
              </div>
            </div>

            {/* Validation Table */}
            <div className="space-y-3 pt-2">
              {filteredFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-3 transition-all hover:border-[var(--brand-primary)]/50"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[var(--border-color)]/50 pb-2">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 bg-[var(--bg-card)] border border-[var(--border-color)] font-bold text-[var(--text-primary)] rounded">
                        {item.id}
                      </span>
                      <span className="font-extrabold text-[var(--text-primary)]">
                        {item.assetName} ({item.assetTag})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : item.severity === 'WARNING'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-500 border border-sky-500/30'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <div className="text-[11px] text-[var(--text-secondary)] font-mono">
                      Detected: {item.timestamp} • Model Confidence: <span className="font-bold text-[var(--text-primary)]">{item.confidence}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-[var(--text-primary)]">
                        Predicted Anomaly: <span className="text-[var(--brand-primary)]">{item.predictedAnomaly}</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
                        <span>Engineer Verdict Notes: {item.engineerNotes}</span>
                      </div>
                      {item.reviewedBy && (
                        <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Validated by {item.reviewedBy}
                        </div>
                      )}
                    </div>

                    {/* Verdict Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleUpdateVerdict(item.id, 'TRUE_POSITIVE')}
                        className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center space-x-1.5 text-[11px] transition-all ${
                          item.verdict === 'TRUE_POSITIVE'
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>True Positive</span>
                      </button>

                      <button
                        onClick={() => handleUpdateVerdict(item.id, 'FALSE_POSITIVE')}
                        className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center space-x-1.5 text-[11px] transition-all ${
                          item.verdict === 'FALSE_POSITIVE'
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/30'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>False Positive</span>
                      </button>

                      <button
                        onClick={() => handleUpdateVerdict(item.id, 'NEEDS_DATA')}
                        className={`px-3 py-1.5 rounded-xl font-bold inline-flex items-center space-x-1.5 text-[11px] transition-all ${
                          item.verdict === 'NEEDS_DATA'
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/30'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Flag for Retrain</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Drift & Active Retraining Pipeline Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
              <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[var(--brand-primary)]" />
                Feature Drift & PSI Index Monitoring
              </h4>
              <p className="text-[var(--text-secondary)]">Population Stability Index (PSI) tracking for key telemetry streams</p>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Inlet Temperature (°C)</span>
                    <span className="font-bold text-emerald-500">PSI: 0.02 (Stable)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-emerald-500 h-full w-[20%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>Vibration RMS (mm/s)</span>
                    <span className="font-bold text-amber-500">PSI: 0.08 (Low Drift)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-amber-500 h-full w-[50%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>System Pressure (BAR)</span>
                    <span className="font-bold text-emerald-500">PSI: 0.01 (Stable)</span>
                  </div>
                  <div className="w-full bg-[var(--bg-canvas)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div className="bg-emerald-500 h-full w-[10%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
              <h4 className="text-sm font-extrabold text-[var(--text-primary)] font-sans flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
                Automated Retraining Trigger Settings
              </h4>
              <p className="text-[var(--text-secondary)]">Configured rules for human-in-the-loop retraining</p>

              <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-2">
                <div className="flex justify-between items-center font-bold text-[var(--text-primary)]">
                  <span>Auto-Trigger Threshold</span>
                  <span className="text-[var(--brand-primary)]">15 Validated Feedback Samples</span>
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Current Queue Progress: <span className="font-bold text-emerald-500">11 / 15 Samples</span>
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2 rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div className="bg-[var(--brand-primary)] h-full w-[73%]" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                <span>Last Training Cycle: 2026-07-28 18:30</span>
                <span className="font-bold text-emerald-500">Accuracy: 98.4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Feedback Modal */}
      {showNewFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full max-w-lg p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <h3 className="text-base font-extrabold text-[var(--text-primary)] font-sans flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--brand-primary)]" />
                Log Reliability Engineer Feedback
              </h3>
              <button
                onClick={() => setShowNewFeedbackModal(false)}
                className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomFeedback} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">Target Equipment Asset</label>
                <select
                  value={newFeedbackForm.assetTag}
                  onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, assetTag: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="Reactor-001">Reactor-001 Vessel</option>
                  <option value="Pump-002">Pump-002 Centrifugal</option>
                  <option value="Compressor-001">Compressor-001 Gas</option>
                  <option value="Exchanger-101">Heat Exchanger-101</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">Observed / Predicted Anomaly Pattern</label>
                <input
                  type="text"
                  required
                  value={newFeedbackForm.predictedAnomaly}
                  onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, predictedAnomaly: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                  placeholder="e.g. Bearing Cavitation, Thermal Drift"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">Verdict</label>
                <select
                  value={newFeedbackForm.verdict}
                  onChange={(e: any) => setNewFeedbackForm({ ...newFeedbackForm, verdict: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                >
                  <option value="TRUE_POSITIVE">True Positive (Confirmed Anomaly)</option>
                  <option value="FALSE_POSITIVE">False Positive (Normal Operational Noise)</option>
                  <option value="NEEDS_DATA">Needs Data (Flag for Retraining Set)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[var(--text-primary)]">Engineer Inspection Notes</label>
                <textarea
                  rows={3}
                  value={newFeedbackForm.engineerNotes}
                  onChange={(e) => setNewFeedbackForm({ ...newFeedbackForm, engineerNotes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--brand-primary)]"
                  placeholder="Enter detailed physical inspection observations, repair actions taken, or telemetry notes..."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFeedbackModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--brand-primary)] text-white font-bold hover:bg-[var(--brand-hover)] shadow-md"
                >
                  Submit Active Learning Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICenter;
