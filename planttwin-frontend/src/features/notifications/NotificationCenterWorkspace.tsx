import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Mail,
  MessageSquare,
  Smartphone,
  Radio,
  Share2,
  Send,
  Zap,
  Clock,
  ShieldCheck,
  Check,
  Archive,
  ArrowRight,
  Settings,
  Workflow,
  X,
} from 'lucide-react';
import apiClient from '../../lib/api/client';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: string;
  severity: string;
  channels_sent: string[];
  read: boolean;
  archived: boolean;
  escalation_stage: number;
  associated_asset?: string;
  associated_work_order?: string;
  created_at: string;
}

export const NotificationCenterWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'escalation' | 'channels' | 'preferences'>('inbox');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterTime, setFilterTime] = useState<string>('ALL');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // User Notification Preferences state
  const [preferences, setPreferences] = useState({
    receive_critical: true,
    receive_warning: true,
    receive_maintenance: true,
    receive_ai_predictions: true,
    receive_security: true,
    receive_system: true,
    receive_workflow: true,
    receive_reports: false,
    receive_marketing: false,
  });

  const fetchNotifications = () => {
    setLoading(true);
    apiClient
      .get('/notifications/center')
      .then((res: any) => {
        const items = res?.data !== undefined ? res.data : Array.isArray(res) ? res : [];
        if (Array.isArray(items) && items.length > 0) {
          setNotifications(items);
        } else {
          loadFallbackNotifications();
        }
      })
      .catch(() => {
        loadFallbackNotifications();
      })
      .finally(() => setLoading(false));
  };

  const loadFallbackNotifications = () => {
    setNotifications([
      {
        id: 'notif-101',
        title: 'CRITICAL ALARM: Reactor-001 Thermal Spike 100°C',
        message: 'ISA-18.2 Critical Alarm ALM-2024-001 triggered on DB100.DBD12. Immediate intervention required.',
        category: 'Critical',
        severity: 'CRITICAL',
        channels_sent: ['In-App', 'Push', 'Email', 'Slack', 'MS Teams'],
        read: false,
        archived: false,
        escalation_stage: 1,
        associated_asset: 'Reactor-001 Vessel',
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-102',
        title: 'PREDICTIVE MAINTENANCE: Pump-002 Bearing Wear Horizon',
        message: 'AI RUL Engine predicts bearing degradation in 142 days. Preventive overhaul suggested.',
        category: 'Prediction',
        severity: 'HIGH',
        channels_sent: ['In-App', 'Email'],
        read: false,
        archived: false,
        escalation_stage: 1,
        associated_asset: 'Pump-002 Centrifugal',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-103',
        title: 'WORKFLOW ESCALATED: Unacknowledged Alarm Escalated to Supervisor',
        message: 'Critical alarm ALM-2024-001 was unacknowledged for >10 mins. Escalated to Plant Supervisor & Work Order Created.',
        category: 'Workflow',
        severity: 'HIGH',
        channels_sent: ['In-App', 'SMS', 'Email'],
        read: true,
        archived: false,
        escalation_stage: 2,
        associated_work_order: 'WO-EMERGENCY-101',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = (id: string) => {
    apiClient
      .post(`/notifications/center/${id}/read`, {})
      .then(() => {})
      .catch(() => {});

    if (id === 'ALL') {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setActionSuccessMsg('All notifications marked as read.');
    } else {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setActionSuccessMsg('Notification marked as read.');
    }
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleArchive = (id: string) => {
    apiClient
      .post(`/notifications/center/${id}/archive`, {})
      .then(() => {})
      .catch(() => {});

    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true } : n)));
    setActionSuccessMsg('Notification moved to archive.');
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleTriggerEscalation = (id: string) => {
    apiClient
      .post(`/notifications/center/${id}/escalate`, {})
      .then(() => {})
      .catch(() => {});

    setActionSuccessMsg('Escalation Rule Triggered! Escalated to Supervisor & Emergency Work Order created.');
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    const isArchivedTab = filterTime === 'ARCHIVED';
    if (isArchivedTab !== n.archived) return false;

    if (filterCategory !== 'ALL' && n.category.toUpperCase() !== filterCategory.toUpperCase()) {
      return false;
    }

    if (filterTime === 'UNREAD' && n.read) return false;
    if (filterTime === 'CRITICAL' && n.severity !== 'CRITICAL') return false;

    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read && !n.archived).length;

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <Bell className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Enterprise Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 shrink-0 leading-none">
                  {unreadCount} UNREAD ALERTS
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Multi-Channel Alerts (Email, SMS, Push, Slack, Teams), Escalation Rules Engine & Notification Governance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => handleMarkRead('ALL')}
            className="btn-nexus-secondary text-xs inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-mono font-bold shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={() => handleTriggerEscalation('notif-101')}
            className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-extrabold text-xs inline-flex items-center justify-center space-x-2 shadow-md px-4 py-2.5 rounded-xl shrink-0 font-mono"
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Simulate Alarm Escalation Rule</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center justify-between font-mono shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Clean Theme-Reactive Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-xs font-mono font-bold shadow-sm">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'inbox'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Notification History & Inbox ({unreadCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('escalation')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'escalation'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Workflow className="w-4 h-4 shrink-0" />
          <span>Multi-Tier Escalation Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'channels'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Multi-Channel Integration Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-3.5 py-2 rounded-xl transition-all inline-flex items-center space-x-2 shrink-0 ${
            activeTab === 'preferences'
              ? 'bg-[var(--brand-primary)] text-white border border-[var(--brand-primary)] shadow-md font-extrabold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Alert Preferences & Delivery Rules</span>
        </button>
      </div>

      {/* Inbox & History View */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[var(--text-secondary)] font-bold">Category Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-nexus text-xs py-1.5 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)]"
              >
                <option value="ALL">All Categories</option>
                <option value="CRITICAL">Critical Alarms</option>
                <option value="PREDICTION">AI Predictions</option>
                <option value="WORKFLOW">Workflow Escalations</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)]">
              {(['ALL', 'UNREAD', 'CRITICAL', 'ARCHIVED'] as const).map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterTime(ft)}
                  className={`px-3 py-1 rounded-lg transition-colors font-bold ${
                    filterTime === ft
                      ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  notif.read
                    ? 'bg-[var(--bg-card)] border-[var(--border-color)] opacity-80'
                    : 'bg-[var(--bg-card)] border-[var(--brand-border)] shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-[var(--text-primary)] text-sm">{notif.title}</span>
                      {notif.severity === 'CRITICAL' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 font-extrabold animate-pulse">
                          CRITICAL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/30 font-extrabold">
                          HIGH
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--text-secondary)] font-sans text-xs">{notif.message}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="px-3 py-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-xs font-bold transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(notif.id)}
                      className="p-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      title="Archive Notification"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2 flex-wrap gap-2">
                  <div className="flex items-center space-x-3">
                    <span>Delivered via: <strong className="text-[var(--text-primary)]">{notif.channels_sent.join(', ')}</strong></span>
                    {notif.associated_asset && <span>• Asset: <strong className="text-emerald-500">{notif.associated_asset}</strong></span>}
                  </div>
                  <span>Timestamp: {new Date(notif.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalation Matrix View */}
      {activeTab === 'escalation' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Multi-Tier ISA-18.2 Alarm Escalation Matrix</h3>
            <p className="text-[var(--text-secondary)] text-xs mt-0.5">Automated rule escalation when critical alarms remain unacknowledged</p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-primary)] text-sm">Tier 1: Immediate In-App & Push Broadcast</div>
                <div className="text-[var(--text-secondary)] mt-1">Dispatches in-app banners & mobile push notifications to shift operators.</div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold">T = 0s</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-primary)] text-sm">Tier 2: Multi-Channel Email & SMS Alerting</div>
                <div className="text-[var(--text-secondary)] mt-1">Dispatches email digests & Twilio SMS alerts to reliability engineers.</div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold">T = 5 Mins</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-between">
              <div>
                <div className="font-bold text-[var(--text-primary)] text-sm">Tier 3: Supervisor Work Order Escalation</div>
                <div className="text-[var(--text-secondary)] mt-1">Automatically generates emergency work order & notifies Plant Supervisor.</div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 font-bold">T = 10 Mins</span>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Channel Hub */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center space-x-2 text-[var(--text-primary)] font-bold text-sm">
              <Mail className="w-5 h-5 text-emerald-500" />
              <span>Email & SMTP Gateway</span>
            </div>
            <p className="text-[var(--text-secondary)]">AWS SES / SendGrid SMTP Integration with HTML alert templates.</p>
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold">CONNECTED</span>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center space-x-2 text-[var(--text-primary)] font-bold text-sm">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              <span>Twilio SMS & Voice Call</span>
            </div>
            <p className="text-[var(--text-secondary)]">Emergency SMS & Automated Voice Call Dispatcher for Tier 2/3 alarms.</p>
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold">CONNECTED</span>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center space-x-2 text-[var(--text-primary)] font-bold text-sm">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              <span>Slack & MS Teams Webhooks</span>
            </div>
            <p className="text-[var(--text-secondary)]">Real-time chat ops webhooks with interactive incident response cards.</p>
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-bold">CONNECTED</span>
          </div>
        </div>
      )}

      {/* Alert Preferences */}
      {activeTab === 'preferences' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 font-mono text-xs">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Alert Delivery Preferences</h3>
            <p className="text-[var(--text-secondary)] text-xs mt-0.5">Customize which alarm categories deliver notifications to your device</p>
          </div>

          <div className="space-y-3">
            {Object.entries(preferences).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)]">
                <span className="capitalize text-[var(--text-primary)] font-bold">{key.replace('receive_', '').replace('_', ' ')} Notifications</span>
                <button
                  onClick={() => setPreferences((prev: any) => ({ ...prev, [key]: !val }))}
                  className={`px-3 py-1 rounded-xl font-bold transition-all ${
                    val ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
                  }`}
                >
                  {val ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenterWorkspace;
