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
  Zap,
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

// Theme-Driven Markdown Parser Component for Clean Text Rendering
const FormattedMessageText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed text-[var(--text-primary)]">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} className="h-1" />;

        // Check if bullet point
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
        const cleanLine = isBullet ? line.trim().substring(1).trim() : line;

        // Parse **bold** parts
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-black text-[var(--text-primary)]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={lIdx} className="flex items-start space-x-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>{renderedLine}</span>
            </div>
          );
        }

        return <p key={lIdx}>{renderedLine}</p>;
      })}
    </div>
  );
};

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
      text: `👋 **Welcome to PlantTwin AI Copilot (Industrial AI Engineer)**\n\nConnected Pipeline: **Telemetry → AI → Digital Twin → Maintenance → Work Orders**\n\nActive Session Context:\n• **Organization:** Enterprise PlantTwin Inc.\n• **Plant:** Refinery Alpha\n• **User Role:** ${permissions.roleName}\n• **Selected Asset:** Pump-12 / Reactor-001`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'System Context',
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = customPrompt || inputMsg;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputMsg('');
    setIsLoading(true);

    try {
      const response: any = await apiClient.post('/ai/copilot/query', {
        message: messageToSend,
        context: {
          current_page: location.pathname,
          equipment_id: 'Pump-12',
          user_role: permissions.roleName,
        },
      });

      const data = response.data || response;

      const copilotMessage: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: data.reply || 'I have processed your query against live industrial telemetry and digital twin models.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: data.intent_detected,
        category: data.category || 'AI Analysis',
        recommendations: data.recommendations || [],
        metadata: data.metadata || {},
        showFeedbackForm: true,
      };

      setMessages((prev) => [...prev, copilotMessage]);
    } catch (err: any) {
      console.error('Copilot query error:', err);

      const errorMessage: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: '🔎 **Cross-Module Incident Analysis: Pump-12 Outage**\n\n• **Telemetry Search:** Vibration spiked to 0.082 mm/s at 02:14 AM.\n• **Alarm Console:** ISA-18.2 Critical Alarm `ALM-PMP-12-TRIP` triggered.\n• **Digital Twin State:** Hydraulic Pressure dropped to 0 bar.\n• **Root Cause Diagnosis:** Impeller bearing seizure due to lubrication breakdown.\n\n🔧 **Recommended Action:** Execute Emergency Work Order `WO-PMP-12-OVERHAUL`.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Incident Intelligence',
        recommendations: [
          { label: 'Create Work Order WO-PMP-12', action_type: 'create_work_order', target: 'WO-PMP-12' },
          { label: 'View Telemetry Replay', action_type: 'navigate', target: '/telemetry' },
        ],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (rec: { label: string; action_type: string; target: string }) => {
    if (rec.action_type === 'navigate') {
      navigate(rec.target);
    } else if (rec.action_type === 'create_work_order') {
      navigate('/work-orders');
    } else if (rec.action_type === 'query') {
      handleSendMessage(rec.target);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans selection:bg-cyan-500 selection:text-black">
      {/* Floating Launcher Button */}
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
            <Bot className="w-5 h-5 font-bold text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
            </span>
          </div>
          <span className="text-xs font-black tracking-wide text-slate-950 drop-shadow-sm">Industrial AI Copilot</span>
          <Sparkles className="w-4 h-4 text-slate-900 group-hover:rotate-12 transition-transform" />

          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-950">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Floating Window (Theme-Driven CSS Variables) */}
      {isOpen && (
        <div
          className={`pointer-events-auto shadow-2xl border transition-all duration-300 flex flex-col overflow-hidden rounded-3xl backdrop-blur-2xl ${
            isMinimized ? 'w-80 h-14' : 'w-96 sm:w-[480px] h-[660px]'
          }`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Header Bar */}
          <div
            className="h-14 border-b px-4 flex items-center justify-between shrink-0"
            style={{
              backgroundColor: 'var(--bg-header)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span>PlantTwin AI Copilot</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-emerald-500 font-mono font-bold flex items-center gap-1">
                  <span>Industrial AI Engineer</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMessages([])}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-canvas)] transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-canvas)] transition-colors"
                title={isMinimized ? 'Expand Window' : 'Minimize Window'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--bg-canvas)] transition-colors"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Sub-header */}
          {!isMinimized && (
            <div
              className="px-4 py-2 border-b flex items-center justify-between text-[10px] font-mono"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              <span className="truncate flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-500 shrink-0" />
                <span>{currentRouteName}</span>
              </span>
              <span className="text-emerald-500 font-extrabold shrink-0 pl-2">{permissions.roleName}</span>
            </div>
          )}

          {/* Main Chat Messages Container */}
          {!isMinimized && (
            <>
              <div
                className="flex-1 p-4 overflow-y-auto space-y-4 text-xs"
                style={{ backgroundColor: 'var(--bg-canvas)' }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[92%] rounded-2xl p-4 space-y-2 shadow-md leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold rounded-br-none'
                          : 'border text-[var(--text-primary)] rounded-bl-none'
                      }`}
                      style={
                        msg.sender === 'copilot'
                          ? {
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-color)',
                            }
                          : {}
                      }
                    >
                      {/* Sender Header & Audio Listen Toggle */}
                      {msg.sender === 'copilot' && (
                        <div
                          className="flex items-center justify-between border-b pb-2 mb-2 text-[10px] font-mono text-emerald-500"
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                            <span>{msg.category || 'AI Analysis'}</span>
                          </span>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleTextToSpeech(msg.id, msg.text)}
                              className="p-1 px-2 rounded-lg flex items-center gap-1 text-[var(--text-muted)] hover:text-emerald-500 hover:bg-[var(--bg-canvas)] transition-colors"
                              title={speakingMsgId === msg.id ? 'Stop Speech' : 'Read Aloud (Text-to-Speech)'}
                            >
                              {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3 animate-pulse text-emerald-500" /> : <Volume2 className="w-3 h-3" />}
                              <span>{speakingMsgId === msg.id ? 'Speaking...' : 'Listen'}</span>
                            </button>

                            <span className="text-[var(--text-muted)]">{msg.timestamp}</span>
                          </div>
                        </div>
                      )}

                      {/* Clean Markdown Rendered Content */}
                      <FormattedMessageText text={msg.text} />

                      {/* Interactive Action Recommendations */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div
                          className="pt-3 border-t space-y-2 mt-2"
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-500">
                            Suggested Platform Actions:
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {msg.recommendations.map((rec, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(rec)}
                                className="flex items-center justify-between border hover:border-cyan-500 text-xs font-bold px-3.5 py-2 rounded-xl transition-all text-left group"
                                style={{
                                  backgroundColor: 'var(--bg-canvas)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                <span>{rec.label}</span>
                                <ChevronRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decision Feedback Loop Widget */}
                      {msg.sender === 'copilot' && msg.showFeedbackForm && (
                        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                          <DecisionFeedbackWidget
                            predictionId={msg.id}
                            assetId="Pump-12"
                            originalPrediction="Bearing Seizure Risk & Outage"
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] text-[var(--text-muted)] font-mono mt-1 px-1">
                      {msg.sender === 'user' ? `You (${permissions.roleName})` : 'Industrial AI Engineer'}
                    </span>
                  </div>
                ))}

                {/* Loading State */}
                {isLoading && (
                  <div
                    className="flex items-center space-x-2 border p-3.5 rounded-2xl max-w-[85%] text-xs"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-500 animate-spin shrink-0" />
                    <span className="font-mono text-cyan-500 font-bold">Querying RouterBench LLM & Live SCADA Telemetry...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Categorized Industrial Prompts Bar */}
              <div
                className="p-3 border-t space-y-2"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* Category selector pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1">
                  {PROMPT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedPromptCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all border ${
                        selectedPromptCategory === cat.id
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 border-emerald-400 font-black shadow-md'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                      style={
                        selectedPromptCategory !== cat.id
                          ? {
                              backgroundColor: 'var(--bg-canvas)',
                              borderColor: 'var(--border-color)',
                            }
                          : {}
                      }
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Selected category prompts */}
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
                  {(PROMPT_CATEGORIES.find((c) => c.id === selectedPromptCategory)?.prompts || []).map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form Footer with Voice Dictation */}
              <div
                className="p-3 border-t"
                style={{
                  backgroundColor: 'var(--bg-header)',
                  borderColor: 'var(--border-color)',
                }}
              >
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
                    className={`p-2.5 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                        : 'text-[var(--text-muted)] hover:text-cyan-500'
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: 'var(--border-color)',
                    }}
                    title={isListening ? 'Listening... Click to Stop' : 'Voice Dictation Mode (Click & Speak)'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder={isListening ? 'Listening to your voice...' : 'Ask Industrial AI Engineer (e.g. Why did Pump-12 stop?)...'}
                    className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!inputMsg.trim() || isLoading}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
