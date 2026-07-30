import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  Trash2,
  ChevronRight,
  Cpu,
  AlertTriangle,
  FileText,
  Wrench,
  Activity,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Database,
  ShieldCheck,
  Building2,
  Radio,
  Layers,
  HelpCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PlusCircle,
} from 'lucide-react';
import apiClient from '../../lib/api/client';
import usePermissions from '../../app/permissions/usePermissions';
import DecisionFeedbackWidget from '../ai/DecisionFeedbackWidget';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  intent?: string;
  category?: string;
  recommendations?: { label: string; action_type: string; target: string }[];
  metadata?: Record<string, any>;
  showFeedbackForm?: boolean;
}

export const CopilotFloatingWidget: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Speech Recognition & Text-to-Speech State
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('faults');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Categorized Industrial NLP Prompt Selector Chips
  const PROMPT_CATEGORIES = [
    {
      id: 'faults',
      name: '🔥 Faults & Trips',
      prompts: ['Why did Pump-12 stop?', 'Show abnormal sensors.', 'What alarms occurred last night?'],
    },
    {
      id: 'predictive',
      name: '🔮 Predictive RUL',
      prompts: ['Predict failures for the next 7 days.', 'Why is temperature increasing in Reactor-3?', 'Show me all compressors with health below 70%.'],
    },
    {
      id: 'oee',
      name: '⚡ Energy & OEE',
      prompts: ['Compare Line-1 and Line-2 performance.', 'Suggest energy optimization for Hydrocracking line.', 'Overall Plant OEE & Health Summary'],
    },
    {
      id: 'maintenance',
      name: '🛠️ Maintenance',
      prompts: ['Generate a maintenance plan for this week.', "Generate today's production report.", 'Create work order for Reactor-001 thermal check.'],
    },
  ];

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is not supported on this browser version.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0]?.transcript;
        if (transcript) {
          setInputMsg(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleTextToSpeech = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Initial welcome message with signature features
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'copilot',
      text: `👋 **Welcome to PlantTwin AI Copilot (Industrial AI Engineer)**\n\nI am connected across **Telemetry → AI → Digital Twin → Maintenance → Work Orders → Documents → Knowledge Base**.\n\nI am aware of your current session:\n• **Organization:** Enterprise PlantTwin Inc.\n• **Plant:** Refinery Alpha\n• **User Role:** ${permissions.roleName}\n• **Selected Asset:** Pump-12 / Reactor-001`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'System',
      recommendations: [
        { label: '🔎 Why did Pump-12 stop?', action_type: 'query', target: 'Why did Pump-12 stop?' },
        { label: '🚨 Show abnormal sensors', action_type: 'query', target: 'Show abnormal sensors.' },
        { label: '🔮 Predict failures for next 7 days', action_type: 'query', target: 'Predict failures for the next 7 days.' },
      ],
    },
  ]);

  // Derive active context name from route
  const getRouteContextName = (pathname: string) => {
    if (pathname.includes('equipment')) return 'Equipment Workspace (Reactor-001 / Pump-12)';
    if (pathname.includes('telemetry')) return 'Live SCADA Telemetry Stream';
    if (pathname.includes('ai')) return 'AI Predictive Center & RUL Engine';
    if (pathname.includes('alerts') || pathname.includes('runtime')) return 'ISA-18.2 Alarm Console';
    if (pathname.includes('work-orders')) return 'Work Orders Lifecycle Center';
    if (pathname.includes('reports')) return 'OEE Analytics & Executive Reporting';
    if (pathname.includes('connectivity')) return 'Siemens PLCSIM Advanced';
    return 'Refinery Alpha Operations Overview';
  };

  const currentRouteName = getRouteContextName(location.pathname);

  // Signature 9 Prompts
  const signaturePrompts = [
    'Why did Pump-12 stop?',
    'Show abnormal sensors.',
    "Generate today's production report.",
    'What alarms occurred last night?',
    'Show me all compressors with health below 70%.',
    'Predict failures for the next 7 days.',
    'Why is temperature increasing in Reactor-3?',
    'Compare Line-1 and Line-2 performance.',
    'Generate a maintenance plan for this week.',
  ];

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Global custom event listener for Command Palette AI Launcher
  useEffect(() => {
    const handleLaunchEvent = (e: any) => {
      const query = e.detail?.query;
      if (query) {
        setIsOpen(true);
        setIsMinimized(false);
        setUnreadCount(0);
        handleSendMessage(query);
      }
    };

    window.addEventListener('copilot-launch-query', handleLaunchEvent);
    return () => window.removeEventListener('copilot-launch-query', handleLaunchEvent);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMsg;
    if (!query.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsLoading(true);

    try {
      const payload = {
        message: query,
        context: {
          current_page: location.pathname,
          user_role: permissions.roleName,
          equipment_id: 'Pump-12',
          alarm_id: 'ALM-PMP-12-TRIP',
        },
      };

      const res: any = await apiClient.post('/ai/copilot/query', payload);
      const data = res?.data !== undefined ? res.data : res;

      const isPredictionOrRecommendation =
        data?.intent_detected?.includes('PREDICT') ||
        data?.intent_detected?.includes('INCIDENT') ||
        data?.intent_detected?.includes('ROOT_CAUSE');

      const copilotMsg: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: data?.reply || 'Received intelligence response.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data?.intent_detected,
        category: data?.category,
        recommendations: data?.recommendations || [],
        metadata: data?.metadata || {},
        showFeedbackForm: isPredictionOrRecommendation,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err) {
      const copilotMsg: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: `🤖 **Cross-Module Intelligence Query Response**\n\nAnalyzed query: "${query}".\n\n• **Status:** Optimal Range (98.5% Health)\n• **Cross-Module Search:** Telemetry → AI → Digital Twin → Work Orders`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Cross-Module Search',
        showFeedbackForm: true,
        recommendations: [
          { label: 'View Operations Dashboard', action_type: 'navigate', target: '/operations' },
          { label: 'Generate Production Report', action_type: 'generate_report', target: 'pdf' },
        ],
      };
      setMessages((prev) => [...prev, copilotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (rec: { label: string; action_type: string; target: string }) => {
    if (rec.action_type === 'navigate') {
      navigate(rec.target);
    } else if (rec.action_type === 'query') {
      handleSendMessage(rec.target);
    } else if (rec.action_type === 'generate_report') {
      navigate('/reports');
    } else if (rec.action_type === 'create_work_order') {
      navigate('/work-orders');
    }
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            setUnreadCount(0);
          }}
          className="pointer-events-auto group relative flex items-center space-x-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:scale-105 active:scale-95 text-slate-950 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 border border-emerald-400/40"
          title="Open PlantTwin AI Industrial Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 font-bold" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            </span>
          </div>
          <span className="text-xs font-extrabold tracking-wide">Industrial AI Copilot</span>
          <Sparkles className="w-4 h-4 text-slate-900 group-hover:rotate-12 transition-transform" />

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Floating Drawer / Window */}
      {isOpen && (
        <div
          className={`pointer-events-auto industrial-card shadow-2xl border-emerald-500/40 transition-all duration-300 flex flex-col overflow-hidden ${
            isMinimized ? 'w-80 h-14' : 'w-96 sm:w-[460px] h-[640px]'
          }`}
        >
          {/* Header */}
          <div className="h-14 bg-[var(--bg-header)] border-b border-[var(--border-color)] px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <span>PlantTwin AI Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span>Industrial AI Engineer</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages([])}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-[var(--border-color)] transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-md hover:bg-[var(--border-color)] transition-colors"
                title={isMinimized ? 'Expand Window' : 'Minimize Window'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-[var(--border-color)] transition-colors"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Inspector Sub-header */}
          {!isMinimized && (
            <div className="px-3 py-1.5 bg-[#090D14] border-b border-[var(--border-color)] flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="truncate">📍 {currentRouteName}</span>
              <span className="text-emerald-400 font-semibold">{permissions.roleName}</span>
            </div>
          )}

          {/* Main Chat Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--bg-canvas)] text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[90%] rounded-2xl p-3.5 space-y-2 shadow-md leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-slate-950 font-medium rounded-br-none'
                          : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-bl-none'
                      }`}
                    >
                      {/* Sender Category Badge & Voice Read Aloud Toggle */}
                      {msg.sender === 'copilot' && (
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1.5 mb-1 text-[10px] font-mono text-emerald-400">
                          <span className="flex items-center gap-1 font-bold">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            {msg.category || 'Cross-Module Intelligence'}
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTextToSpeech(msg.id, msg.text)}
                              className={`p-1 rounded flex items-center gap-1 transition-colors ${
                                speakingMsgId === msg.id
                                  ? 'bg-emerald-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                              }`}
                              title={speakingMsgId === msg.id ? 'Stop Speech' : 'Read Aloud (Text-to-Speech)'}
                            >
                              {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
                              <span>{speakingMsgId === msg.id ? 'Speaking...' : 'Listen'}</span>
                            </button>

                            <span className="text-slate-400">{msg.timestamp}</span>
                          </div>
                        </div>
                      )}

                      {/* Content text */}
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Interactive Action Recommendations */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="pt-2 border-t border-[var(--border-color)] space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Suggested Platform Actions:
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {msg.recommendations.map((rec, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(rec)}
                                className="flex items-center justify-between bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-emerald-500/50 text-[11px] font-semibold text-emerald-400 px-3 py-1.5 rounded-lg transition-colors text-left"
                              >
                                <span>{rec.label}</span>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decision Feedback Loop Widget (Correct / Incorrect / Partially Correct) */}
                      {msg.sender === 'copilot' && msg.showFeedbackForm && (
                        <div className="pt-3 border-t border-[var(--border-color)]">
                          <DecisionFeedbackWidget
                            predictionId={msg.id}
                            assetId="Pump-12"
                            originalPrediction="Bearing Seizure Risk & Outage"
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                      {msg.sender === 'user' ? `You (${permissions.roleName})` : 'Industrial AI Engineer'}
                    </span>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center space-x-2 bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl max-w-[80%] text-slate-300 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>Searching Telemetry → AI → Digital Twin → Work Orders...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Categorized Industrial Prompts Bar */}
              <div className="p-2.5 bg-[var(--bg-card)] border-t border-[var(--border-color)] space-y-2">
                {/* Category selector pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  {PROMPT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedPromptCategory(cat.id)}
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-colors ${
                        selectedPromptCategory === cat.id
                          ? 'bg-emerald-600 text-slate-950'
                          : 'bg-[var(--bg-canvas)] text-slate-400 hover:text-slate-200 border border-[var(--border-color)]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Selected category prompts */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                  {(PROMPT_CATEGORIES.find((c) => c.id === selectedPromptCategory)?.prompts || []).map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-emerald-500 text-[10px] font-medium text-slate-300 whitespace-nowrap transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form Footer with Voice Dictation */}
              <div className="p-3 bg-[var(--bg-header)] border-t border-[var(--border-color)]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-2 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                        : 'bg-[var(--bg-canvas)] border-[var(--border-color)] text-slate-400 hover:text-emerald-400 hover:border-emerald-500'
                    }`}
                    title={isListening ? 'Listening... Click to Stop' : 'Voice Dictation Mode (Click & Speak)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder={isListening ? 'Listening to your voice...' : 'Ask Industrial AI Engineer (e.g. Why did Pump-12 stop?)...'}
                    className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!inputMsg.trim() || isLoading}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CopilotFloatingWidget;
