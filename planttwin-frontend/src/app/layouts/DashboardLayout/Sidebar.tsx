import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Compass,
  Cpu,
  Brain,
  Layers,
  LineChart,
  PlaySquare,
  AlertTriangle,
  ClipboardList,
  FileText,
  Bell,
  Radio,
  Boxes,
  Workflow,
  Building2,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { usePlantTelemetry } from '../../contexts/PlantTelemetryContext';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { activeAlerts } = usePlantTelemetry();

  const sections = [
    {
      title: 'OPERATIONAL WORKSPACES',
      items: [
        { label: 'Operations Overview', icon: Activity, path: '/operations' },
        { label: 'Plant Explorer', icon: Compass, path: '/plant-explorer' },
        { label: 'Equipment & Assets', icon: Cpu, path: '/equipment' },
        { label: 'AI Predictive Center', icon: Brain, path: '/ai' },
        { label: 'Digital Twin Explorer', icon: Layers, path: '/digital-twin' },
        { label: 'Live SCADA Telemetry', icon: LineChart, path: '/telemetry' },
        { label: 'Runtime Operations', icon: PlaySquare, path: '/runtime' },
        { label: 'Alarm Management', icon: AlertTriangle, path: '/alerts', badge: (activeAlerts?.length || 0) + 4, badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
        { label: 'Work Orders', icon: ClipboardList, path: '/work-orders' },
        { label: 'Reports & Analytics', icon: FileText, path: '/reports' },
        { label: 'Notification Inbox', icon: Bell, path: '/notifications', badge: (activeAlerts?.length || 0) + 2, badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
      ],
    },
    {
      title: 'INDUSTRIAL CONNECTIVITY',
      items: [
        { label: 'Connectivity Hub', icon: Radio, path: '/connectivity' },
        { label: 'Asset Taxonomy', icon: Boxes, path: '/assets' },
        { label: 'Rules & Escalations', icon: Workflow, path: '/rules' },
      ],
    },
    {
      title: 'ENTERPRISE GOVERNANCE',
      items: [
        { label: 'Enterprise Hub', icon: Building2, path: '/enterprise' },
        { label: 'Users & Permissions', icon: Users, path: '/users' },
        { label: 'Security & Audit Logs', icon: ShieldCheck, path: '/audit-logs' },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-14 bottom-8 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] z-20 transition-all duration-300 flex flex-col ${
        isOpen ? 'w-60' : 'w-16'
      }`}
    >
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 no-scrollbar">
        {sections.map((section, idx) => (
          <div key={idx}>
            {isOpen && (
              <div className="px-3 mb-2 text-[10px] font-mono font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                        isActive
                          ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] border-l-4 border-[var(--brand-primary)] font-bold shadow-md'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                      } ${!isOpen && 'justify-center px-0'}`
                    }
                    title={!isOpen ? item.label : undefined}
                  >
                    <IconComponent className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {isOpen && (
                      <div className="ml-3 flex-1 flex items-center justify-between truncate">
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Engine Status Widget */}
      {isOpen && (
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-card)] m-2 rounded-xl shadow-inner border">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-primary)]">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <span>PlantTwin Engine</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/40">
              v2.4
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-500" />
            <span className="text-[11px] text-emerald-400 font-medium truncate font-mono">TimescaleDB & Siemens Ready</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
