# 🏭 PlantTwin AI™ — Industrial Digital Twin & Autonomous SCADA Operations Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.0-4169E1.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-2.11-FDB813.svg?style=for-the-badge&logo=timescale)](https://www.timescale.com)
[![Docker](https://img.shields.io/badge/Docker-24.0-2496ED.svg?style=for-the-badge&logo=docker)](https://www.docker.com)
[![ISA-95 & ISA-18.2](https://img.shields.io/badge/ISA--95%20%2F%20ISA--18.2-Compliant-00C853.svg?style=for-the-badge)](#standards--compliance)

> **PlantTwin AI™** is a enterprise-ready, industrial-grade **Digital Twin, Real-Time Telemetry Historian, and AI Predictive Maintenance Platform**. Built specifically for continuous process manufacturing, chemical refineries, power generation facilities, and smart factories.

## 📄 Solution Flyers & Product Collateral

- 🔴 **PlantTwin AI Master Solution Flyer (HTML)**: [PlantTwin_AI_Solution_Flyer.html](PlantTwin_AI_Solution_Flyer.html) *(Built using exact AeroInspect AI solution flyer structure & titles)*
- 🔵 **GenAI Copilot Agent Solution Flyer (HTML)**: [PlantTwin_Copilot_Agent_Flyer.html](PlantTwin_Copilot_Agent_Flyer.html) *(Gemini LLM, P&ID Vector RAG, and live tag query agent flyer)*
- 🟡 **Predictive Maintenance Agent Solution Flyer (HTML)**: [PlantTwin_Predictive_Agent_Flyer.html](PlantTwin_Predictive_Agent_Flyer.html) *(XGBoost RUL, SHAP XAI, and 14-day failure prediction flyer)*

## 📊 Tech Stack & Dependencies Deliverable

- 📊 **Tech Stack & Dependencies Excel Sheet (.xlsx)**: [PlantTwin_AI_Tech_Stack_and_Dependencies.xlsx](PlantTwin_AI_Tech_Stack_and_Dependencies.xlsx) *(Complete 4-sheet workbook detailing all backend, frontend, infrastructure, and hardware dependencies)*

---

## 🌟 Executive Key Features

- 🌳 **ISA-95 Hierarchy Topology**: Full Enterprise → Site → Area → Production Line → Machine Equipment → Sensor Tag modeling.
- ⚙️ **Equipment & Asset Management**: GIS spatial positioning maps, dynamic P&ID process flow diagram rendering, and asset lifecycle tracking.
- 📈 **Live SCADA Telemetry & Historian**: Real-time high-frequency telemetry streaming with scatter correlation charts, replay scrubbers, and TimescaleDB hypertable storage.
- 🚨 **ISA-18.2 Alarm Operations & Rule Engine**: Alarm lifecycle management (Unacknowledged, Acknowledged, Shelved, Cleared) with interactive alarm evaluation modal.
- 🤖 **AI Predictive Intelligence Platform**: 7 core capabilities including RUL (Remaining Useful Life) estimation, bearing fault signature analysis, anomaly detection, and automated root-cause recommendation.
- 📋 **Work Orders & Maintenance Lifecycle**: End-to-end work order creation pipeline with persistent storage and role-based action guards.
- 📊 **Reporting & Analytics Engine**: Automated PDF report generator (PDF-1.4 format), executive KPI summary cards, and custom CSV exports.
- 🔔 **Enterprise Notification Center**: Multi-channel notifications (In-App, Email, SMS, Webhooks) with automated 3-tier escalation matrices.
- 🔌 **Industrial SCADA Connectivity Hub**: Multi-protocol protocol drivers (Siemens S7-1200/1500 PLCSIM, OPC-UA, MQTT, Modbus TCP, REST API, CSV Ingestion).
- 🛡️ **Security, Governance & Audit Trail**: SOC-2 & ISA-99 compliant append-only audit stream tracking all PLC memory writes and administrative interventions.
- 🎨 **Dynamic Multi-Theme Engine**: 6 curated high-contrast themes (**Industrial Dark**, **Dark Slate**, **Enterprise Light**, **Siemens SCADA Teal**, **Midnight Purple**, **High Contrast**).

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Industrial Operator / Engineer]) -->|HTTP / WebSocket| Frontend[React 18 + Vite + TypeScript Frontend]
    Frontend -->|REST API & JWT Auth| Gateway[FastAPI API Gateway - Port 8000]
    
    subgraph Core Platform Backend
        Gateway -->|Async ORM| Postgres[(PostgreSQL 14 + TimescaleDB - Port 5433)]
        Gateway -->|Pub/Sub & Cache| Redis[(Redis Cache - Port 6379)]
        Gateway -->|PLC Ingestion| ProtocolHub[Industrial Connectivity Hub]
    end
    
    subgraph Industrial Field Protocol Simulation
        ProtocolHub -->|S7comm / ISO-on-TCP| SiemensPLC[Siemens S7-1200 / S7-1500 PLC]
        ProtocolHub -->|OPC-UA| OPCServer[OPC-UA Industrial Server]
        ProtocolHub -->|MQTT| MQTTBroker[MQTT Telemetry Broker]
    end
```

---

## ⚡ Quick Start & Setup Guide

### Option 1: Docker Compose (Recommended for Production)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/planttwin-ai-platform.git
cd planttwin-ai-platform

# 2. Launch the entire containerized stack (Frontend, Backend, PostgreSQL, Redis)
docker-compose up -d --build

# 3. Access the platform
# Frontend Web App: http://localhost:3000
# Backend Swagger API Docs: http://localhost:8000/docs
```

### Option 2: Local Development Setup

#### Backend (FastAPI & Python 3.10+)

```bash
cd planttwin-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### Frontend (React 18 & Vite)

```bash
cd planttwin-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🔐 Demo User Credentials & Persona Matrix

The system includes pre-configured persona profiles for live demonstration:

| Persona | Email | Password | Role Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@apex.com` | `AdminPassword123!` | Full Admin & Governance Privileges |
| **Plant Manager** | `plant.manager@planttwin.ai` | `ManagerPassword123!` | Operational & Reporting Access |
| **Reliability Engineer** | `engineer@planttwin.ai` | `EngineerPassword123!` | AI Models & Telemetry Analysis |
| **Control Operator** | `operator@planttwin.ai` | `OperatorPassword123!` | SCADA Ticker & Alarm Acknowledgment |

---

## 🌐 API Endpoints Reference

| Category | Endpoint | Method | Description |
| :--- | :--- | :---: | :--- |
| **Health** | `/api/v1/health` | `GET` | System operational health status |
| **Auth** | `/api/v1/identity/auth/login` | `POST` | Authenticate user & issue signed JWT tokens |
| **Users** | `/api/v1/identity/users` | `GET` | User roster & RBAC role matrix |
| **Organizations** | `/api/v1/enterprise/organizations` | `GET` | Multi-tenant organization list |
| **Plants** | `/api/v1/enterprise/plants` | `GET` | ISA-95 plant hierarchy topology |
| **Assets** | `/api/v1/assets/equipment` | `GET` | Equipment inventory & sensor tags |
| **Alarms** | `/api/v1/runtime/alarms/active` | `GET` | Active ISA-18.2 alarm stream |
| **Work Orders** | `/api/v1/runtime/work-orders` | `GET / POST` | Maintenance work orders CRUD |
| **Notifications** | `/api/v1/notifications/center` | `GET` | Enterprise notification stream |

---

## 📜 Standards & Compliance

- **ISA-95**: Enterprise-Control System Integration (Level 0 through Level 4).
- **ISA-18.2**: Management of Alarm Systems for Process Industries.
- **SOC-2 Type II**: Security, Availability, and Confidentiality controls.
- **IEC 62443 / ISA-99**: Industrial Communication Networks Network and System Security.

---

## 📄 License

Distributed under the **Commercial Enterprise License** / **MIT License**. See `LICENSE` for more information.

---
