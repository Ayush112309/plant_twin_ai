import React, { useState } from 'react';
import { FileText, Download, Printer, Activity, BarChart2, CheckCircle2, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import DashboardBuilder from '../builder/DashboardBuilder';

const oeeData = [
  { metric: 'Availability', value: 92 },
  { metric: 'Performance', value: 88 },
  { metric: 'Quality', value: 96 },
  { metric: 'Overall OEE', value: 77.8 },
];

export const ReportingWorkspace: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleGeneratePdf = () => {
    setDownloading('pdf');
    setTimeout(() => {
      const timeStr = new Date().toLocaleString();
      const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 760 >>
stream
BT
/F1 16 Tf
50 740 Td
(PLANTTWIN AI - OEE & MONTHLY OPERATIONAL REPORT) Tj
/F1 10 Tf
0 -25 Td
(Generated: ${timeStr}) Tj
0 -15 Td
(Facility: Refinery Alpha | Status: ALL SYSTEMS OPERATIONAL) Tj
0 -25 Td
(1. OEE & PLANT KPIS SUMMARY) Tj
0 -15 Td
(- Overall OEE: 77.8% [Availability 92%, Performance 88%, Quality 96%]) Tj
0 -15 Td
(- MTBF \(Mean Time Between Failures\): 342 Hours) Tj
0 -15 Td
(- MTTR \(Mean Time To Repair\): 1.8 Hours) Tj
0 -25 Td
(2. EQUIPMENT HEALTH & ALERTS) Tj
0 -15 Td
(- Healthy Equipment: 3 | Warning: 1 | Critical: 1) Tj
0 -15 Td
(- Active Runtime Alerts: 5 \(2 Critical, 1 High, 1 Medium, 1 Low\)) Tj
0 -25 Td
(3. AI PREDICTIVE MAINTENANCE) Tj
0 -15 Td
(- Isolation Forest Model Accuracy: 98.4%) Tj
0 -15 Td
(- Pump-002 Remaining Useful Life \(RUL\): 142 Days) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000242 00000 n 
0000001060 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
1130
%%EOF`;

      const blob = new Blob([pdfString], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlantTwin_Monthly_Operational_Report.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 500);
  };

  const handleExportExcel = () => {
    setDownloading('excel');
    setTimeout(() => {
      const csvContent = `Timestamp,Plant,OEE %,Availability %,Performance %,Quality %,MTBF (Hours),MTTR (Hours)
2026-07-27,Refinery Alpha,77.8,92.0,88.0,96.0,342,1.8
`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlantTwin_OEE_Telemetry.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 500);
  };

  const handleExportCsv = () => {
    setDownloading('csv');
    setTimeout(() => {
      const auditContent = `Model ID,Model Name,Accuracy,Scanned Sensors,Timestamp
ML-101,Isolation Forest,98.4%,45,2026-07-27
`;
      const blob = new Blob([auditContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlantTwin_AI_Health_Audit.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 500);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar with Monochrome Neutral Icon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 shrink-0 flex items-center justify-center shadow-md">
            <FileText className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Reporting & Analytics Platform
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/40 shrink-0 leading-none">
                PDF / EXCEL / CSV ENGINE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              OEE Analytics, MTBF / MTTR KPIs, Dashboard Builder, and Valid PDF/Excel/CSV Exporter
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="btn-nexus-secondary bg-slate-900 border-slate-800 text-slate-200 text-xs inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl font-mono font-bold shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Print Workspace</span>
          </button>

          <button
            onClick={handleGeneratePdf}
            disabled={downloading === 'pdf'}
            className="btn-nexus-primary bg-blue-600 hover:bg-blue-500 text-white text-xs inline-flex items-center justify-center space-x-2 shadow-md font-bold px-4 py-2.5 rounded-xl shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{downloading === 'pdf' ? 'Generating PDF...' : 'Generate Full PDF'}</span>
          </button>
        </div>
      </div>

      {/* OEE & MTBF KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            OVERALL OEE
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">77.8%</div>
          <div className="text-xs text-[var(--text-secondary)]">Availability × Performance × Quality</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            MTBF (MEAN TIME BETWEEN FAILURES)
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">342 Hours</div>
          <div className="text-xs text-[var(--text-secondary)]">Average Uptime Interval</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            MTTR (MEAN TIME TO REPAIR)
          </div>
          <div className="text-3xl font-extrabold text-amber-400">1.8 Hours</div>
          <div className="text-xs text-[var(--text-secondary)]">Average Repair Resolution Window</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            PLANT HEALTH INDEX
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">98.5%</div>
          <div className="text-xs text-[var(--text-secondary)]">Refinery Alpha Composite Score</div>
        </div>
      </div>

      {/* OEE Breakdown Bar Chart */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-slate-400 shrink-0" />
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">
              OEE Component Performance Breakdown (%)
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/40">
            Target 85% World Class OEE
          </span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={oeeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="metric" stroke="var(--text-secondary)" fontSize={11} />
              <YAxis stroke="var(--text-secondary)" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
              />
              <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Generator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {/* PDF Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">Monthly Operational Report (PDF)</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Valid PDF-1.4 document containing OEE, MTBF/MTTR & alerts.</p>
            </div>
          </div>
          <button
            onClick={handleGeneratePdf}
            disabled={downloading === 'pdf'}
            className="w-full btn-nexus-primary bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-white font-bold inline-flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{downloading === 'pdf' ? 'Generating...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* Excel Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">OEE Telemetry Raw Data (Excel/CSV)</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Raw telemetry breakdown of Availability, Performance & Quality.</p>
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={downloading === 'excel'}
            className="w-full btn-nexus-primary bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-white font-bold inline-flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{downloading === 'excel' ? 'Exporting...' : 'Export Excel Data'}</span>
          </button>
        </div>

        {/* AI Audit CSV Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-sans">AI Model Health Audit (CSV)</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Isolation Forest accuracy logs & scanned sensor drift audits.</p>
            </div>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={downloading === 'csv'}
            className="w-full btn-nexus-primary bg-blue-600 hover:bg-blue-500 py-2 rounded-xl text-white font-bold inline-flex items-center justify-center space-x-1.5"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{downloading === 'csv' ? 'Exporting...' : 'Export AI Audit CSV'}</span>
          </button>
        </div>
      </div>

      {/* Custom Dashboard Builder Drag-and-Drop Canvas */}
      <DashboardBuilder />
    </div>
  );
};

export default ReportingWorkspace;
