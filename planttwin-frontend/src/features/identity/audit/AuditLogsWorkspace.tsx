import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  Lock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Key,
  Database,
  Cpu,
} from 'lucide-react';

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  eventType: 'PLC_WRITE' | 'SECURITY' | 'ALARM_ACK' | 'USER_INVITED' | 'ROLE_CHANGE';
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED';
  details: string;
}

export const AuditLogsWorkspace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<'ALL' | 'PLC_WRITE' | 'SECURITY' | 'ALARM_ACK'>('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([
    {
      id: 'AUD-801',
      timestamp: '2026-07-27 18:50:12',
      user: 'admin@planttwin.ai',
      role: 'SYSTEM_ADMIN',
      eventType: 'PLC_WRITE',
      resource: 'Siemens S7-1200 DB1.DBD4 (Bearing Temp)',
      ipAddress: '192.168.0.104',
      status: 'SUCCESS',
      details: 'Mutated memory offset to 70.9 °C',
    },
    {
      id: 'AUD-802',
      timestamp: '2026-07-27 18:32:05',
      user: 'plant.manager@planttwin.ai',
      role: 'PLANT_MANAGER',
      eventType: 'ALARM_ACK',
      resource: 'ISA-18.2 Alarm ALM-101 (Reactor-001)',
      ipAddress: '192.168.0.112',
      status: 'SUCCESS',
      details: 'Acknowledged high-temperature excursion',
    },
    {
      id: 'AUD-803',
      timestamp: '2026-07-27 17:15:40',
      user: 'maintenance.manager@planttwin.ai',
      role: 'MAINTENANCE_MANAGER',
      eventType: 'SECURITY',
      resource: 'Siemens S7-1500 PLC DB100.DBX12.0',
      ipAddress: '192.168.0.118',
      status: 'DENIED',
      details: 'Write privilege blocked: Maintenance Manager role lacks PLC write permission',
    },
    {
      id: 'AUD-804',
      timestamp: '2026-07-27 16:45:00',
      user: 'admin@planttwin.ai',
      role: 'SYSTEM_ADMIN',
      eventType: 'USER_INVITED',
      resource: 'Organization Membership',
      ipAddress: '192.168.0.104',
      status: 'SUCCESS',
      details: 'Invited new.engineer@planttwin.ai as CONTROL_OPERATOR',
    },
    {
      id: 'AUD-805',
      timestamp: '2026-07-27 14:10:22',
      user: 'admin@planttwin.ai',
      role: 'SYSTEM_ADMIN',
      eventType: 'ROLE_CHANGE',
      resource: 'User RBAC Matrix',
      ipAddress: '192.168.0.104',
      status: 'SUCCESS',
      details: 'Promoted Sarah Connor to PLANT_MANAGER',
    },
  ]);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvContent =
        'data:text/csv;charset=utf-8,ID,Timestamp,User,Role,EventType,Resource,IPAddress,Status,Details\n' +
        auditLogs
          .map((a) => `${a.id},${a.timestamp},${a.user},${a.role},${a.eventType},"${a.resource}",${a.ipAddress},${a.status},"${a.details}"`)
          .join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `PlantTwin_Security_Audit_Trail_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 500);
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'PLC_WRITE':
        return (
          <span className="inline-flex items-center space-x-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-emerald-500/30 shrink-0 leading-none">
            <Cpu className="w-3 h-3 shrink-0 text-emerald-500" />
            <span>PLC WRITE</span>
          </span>
        );
      case 'SECURITY':
        return (
          <span className="inline-flex items-center space-x-1 text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-red-500/30 shrink-0 leading-none">
            <ShieldCheck className="w-3 h-3 shrink-0 text-red-500" />
            <span>SECURITY</span>
          </span>
        );
      case 'ALARM_ACK':
        return (
          <span className="inline-flex items-center space-x-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-amber-500/30 shrink-0 leading-none">
            <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
            <span>ALARM ACK</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 text-[var(--text-primary)] bg-[var(--bg-canvas)] px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold border border-[var(--border-color)] shrink-0 leading-none">
            <span>GOVERNANCE</span>
          </span>
        );
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = eventFilter === 'ALL' || log.eventType === eventFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Security, Governance & Audit Trail
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 shrink-0 leading-none">
                SOC-2 & ISA-99 COMPLIANT
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Real-time audit log stream for PLC write operations, user role modifications & security interventions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-mono shrink-0 shadow-md"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{isExporting ? 'Exporting Logs...' : 'Export Audit Log CSV'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Security Audit Metrics Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            TOTAL AUDIT EVENTS
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">142 Events Logged</div>
          <div className="text-xs text-emerald-500 font-bold">Immutable Append-Only</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            PLC WRITE OPERATIONS
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">
            {auditLogs.filter((a) => a.eventType === 'PLC_WRITE').length} Memory Writes
          </div>
          <div className="text-xs text-[var(--text-secondary)]">S7comm & Modbus Offset Audit</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            RBAC ACCESS DENIED
          </div>
          <div className="text-2xl font-extrabold text-red-500">
            {auditLogs.filter((a) => a.status === 'DENIED').length} Unauthorized Attempts
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Blocked by Role Guard</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            RETENTION POLICY
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">365 Days</div>
          <div className="text-xs text-[var(--text-secondary)]">TimescaleDB Retention Chunk</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit events by user, action, or resource..."
            className="input-nexus input-nexus-search text-xs py-2 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-[11px] text-[var(--text-secondary)] uppercase font-bold hidden sm:inline">Event Category:</span>
          <div className="flex items-center space-x-1 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
            {(['ALL', 'PLC_WRITE', 'SECURITY', 'ALARM_ACK'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setEventFilter(cat)}
                className={`px-3 py-1 rounded-lg transition-colors text-[11px] font-extrabold inline-flex items-center justify-center ${
                  eventFilter === cat
                    ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl font-mono text-xs overflow-x-auto space-y-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
              <th className="py-3 px-3">Audit Event ID</th>
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">User & Persona Role</th>
              <th className="py-3 px-3">Resource Tag / Offset</th>
              <th className="py-3 px-3">IP Address</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                <td className="py-3.5 px-3 font-bold text-[var(--text-primary)]">{log.id}</td>
                <td className="py-3.5 px-3 text-[var(--text-secondary)]">{log.timestamp}</td>
                <td className="py-3.5 px-3">{getEventBadge(log.eventType)}</td>
                <td className="py-3.5 px-3">
                  <div className="font-bold text-[var(--text-primary)]">{log.user}</div>
                  <div className="text-[10px] text-[var(--brand-primary)] font-semibold">{log.role}</div>
                </td>
                <td className="py-3.5 px-3 text-[var(--text-primary)] font-medium">{log.resource}</td>
                <td className="py-3.5 px-3 text-[var(--text-secondary)]">{log.ipAddress}</td>
                <td className="py-3.5 px-3">
                  {log.status === 'SUCCESS' ? (
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold">
                      SUCCESS
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/30 text-[10px] font-bold animate-pulse">
                      DENIED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsWorkspace;
