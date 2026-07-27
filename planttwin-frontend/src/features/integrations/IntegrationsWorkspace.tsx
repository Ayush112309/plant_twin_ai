import React from 'react';
import { Radio, Database, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const IntegrationsWorkspace: React.FC = () => {
  const connectors = [
    { name: 'SAP S/4HANA ERP', type: 'ERP Connector', status: 'CONNECTED', sync: '2 mins ago' },
    { name: 'IBM Maximo EAM / CMMS', type: 'Work Order Sync', status: 'CONNECTED', sync: '5 mins ago' },
    { name: 'Oracle Cloud ERP', type: 'Financial & Assets', status: 'CONNECTED', sync: '12 mins ago' },
    { name: 'Ignition SCADA Server', type: 'OPC UA / SCADA', status: 'CONNECTED', sync: 'Live Stream' },
    { name: 'OSIsoft PI Historian', type: 'Time-Series Store', status: 'CONNECTED', sync: 'Live Stream' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Enterprise Integration Platform</h1>
        <p className="text-xs text-slate-400">SAP, Oracle, IBM Maximo, CMMS, SCADA & Webhooks Integration</p>
      </div>

      <div className="industrial-card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-100">Active Enterprise API Connectors</h2>
        <div className="space-y-3 text-xs">
          {connectors.map((c) => (
            <div key={c.name} className="p-3 rounded-lg bg-[#090D14] border border-[#1E293B] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-slate-200">{c.name}</div>
                  <div className="text-[11px] text-slate-400">{c.type} • Last sync: {c.sync}</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{c.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsWorkspace;
