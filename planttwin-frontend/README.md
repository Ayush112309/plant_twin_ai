# 🎨 PlantTwin AI™ — Enterprise React Frontend Web Application

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-0.344-F59E0B.svg?style=for-the-badge)](https://lucide.dev)

> **PlantTwin AI™ Frontend** is a state-of-the-art, high-performance industrial management interface designed for process manufacturing plants, chemical refineries, and power generation facilities. Built with React 18, TypeScript, Tailwind CSS, Lucide React, and Recharts.

---

## 🚀 Workspaces & UI Modules

- 🏡 **Landing Page & Role Tour (`/landing`)**: Public landing page with showcase cards for 5 operational manager personas.
- 🔐 **Authentication & Persona Switcher (`/login`)**: Role-based authentication modal with quick persona switchers.
- 📊 **Operations Center (`/operations`)**: Top 5 KPI ticker cards, live SCADA stream, and active alarm summary.
- 🌳 **Plant Explorer & ISA-95 Topology (`/plant-explorer`)**: Multi-tier hierarchy tree (Enterprise $\rightarrow$ Site $\rightarrow$ Area $\rightarrow$ Production Line $\rightarrow$ Machine $\rightarrow$ Tag).
- ⚙️ **Equipment & Asset Workspace (`/equipment`)**: GIS spatial map integration, dynamic P&ID process flow schematics, and live sensor telemetry.
- 🤖 **AI Predictive Intelligence Center (`/ai`)**: 7 AI capabilities including RUL estimation, bearing fault signature analysis, and automated root-cause recommendations.
- 🌐 **Digital Twin Workspace (`/digital-twin`)**: Dynamic 3D/canvas twin explorer with interactive physical telemetry injection.
- 📈 **Live SCADA Telemetry & Historian (`/telemetry`)**: Scatter correlation charts, incident replay scrubber, and high-frequency metric pills.
- 🚨 **Runtime Operations & ISA-18.2 Alarms (`/runtime`)**: Alarm lifecycle management (Unacknowledged, Acknowledged, Shelved, Cleared) with interactive alarm evaluation modal.
- 📋 **Work Orders & Maintenance Pipeline (`/work-orders`)**: Work order creation modal with persistent storage and role guards.
- 📑 **Reporting & Analytics Platform (`/reports`)**: Executive KPI reporting and automated PDF-1.4 file exporter.
- 🔔 **Enterprise Notification Center (`/notifications`)**: Multi-channel notification cards with automated 3-tier escalation matrices.
- 🔌 **Industrial Connectivity SCADA Hub (`/connectivity`)**: Driver configuration for Siemens S7-1200/1500 PLCSIM, OPC-UA, MQTT, Modbus TCP, REST API, and CSV ingestion.
- 👥 **Organization Users & Permissions (`/users`)**: RBAC member roster, role assignment, and invitation link generator.
- 🛡️ **Security, Governance & Audit Trail (`/audit-logs`)**: Real-time audit log stream tracking all PLC memory writes and administrative interventions.

---

## 🎨 Dynamic Multi-Theme System

Supports 6 enterprise dark/light themes with strict contrast compliance:
1. `industrial` — Industrial Dark Slate Navy (Default)
2. `dark` — Dark Slate
3. `light` — Enterprise Operational Light
4. `siemens` — Siemens SCADA Teal
5. `midnight` — Midnight Purple
6. `contrast` — High-Contrast Accessibility

---

## 📁 Directory Structure

```
src/
├── app/
│   ├── layouts/          # Top Header, Sidebar Navigation, Command Palette
│   ├── router/           # AppRouter & ProtectedRoute guards
│   ├── contexts/         # AuthContext, ThemeContext, TelemetryContext
│   └── styles/           # Global design tokens (index.css)
├── features/
│   ├── ai/               # AI Predictive Center
│   ├── assets/           # Equipment & Asset Workspace
│   ├── connectivity/     # SCADA Connectivity Hub
│   ├── digital_twin/     # Digital Twin Explorer
│   ├── enterprise/       # ISA-95 Plant Explorer Hierarchy
│   ├── identity/         # Login, User Management & Audit Logs
│   ├── notifications/    # Notification Center
│   ├── operations_center/# Executive Operations Overview
│   ├── reporting/        # Dashboards & PDF Exporter
│   ├── runtime/          # ISA-18.2 Alarm Engine & Work Orders
│   └── telemetry/        # Telemetry Historian & Replay Scrubber
└── lib/
    ├── api/              # Axios HTTP client with JWT interceptors
    └── charts/           # Industrial Recharts wrappers
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local Vite development server
npm run dev

# Access app at http://localhost:3000
```
