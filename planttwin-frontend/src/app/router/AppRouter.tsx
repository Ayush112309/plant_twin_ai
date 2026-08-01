import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import OperationsOverview from '../../features/operations_center/OperationsOverview';
import EquipmentWorkspace from '../../features/assets/equipment/EquipmentWorkspace';
import ConnectivityWorkspace from '../../features/connectivity/ConnectivityWorkspace';
import AICenter from '../../features/ai/overview/AICenter';
import DigitalTwinWorkspace from '../../features/digital_twin/explorer/DigitalTwinWorkspace';
import TelemetryWorkspace from '../../features/telemetry/live_dashboard/TelemetryWorkspace';
import AlarmManagement from '../../features/runtime/alarms/AlarmManagement';
import WorkOrdersWorkspace from '../../features/runtime/work_orders/WorkOrdersWorkspace';
import ReportingWorkspace from '../../features/reporting/dashboards/ReportingWorkspace';
import NotificationCenterWorkspace from '../../features/notifications/NotificationCenterWorkspace';
import PlantExplorer from '../../features/enterprise/hierarchy/PlantExplorer';
import IntegrationsWorkspace from '../../features/integrations/IntegrationsWorkspace';
import LoginPage from '../../features/identity/login/LoginPage';
import LandingPage from '../../features/landing/LandingPage';
import PersonaHubPage from '../../features/demos/PersonaHubPage';
import RegisterPage from '../../features/identity/register/RegisterPage';
import AcceptInvitationPage from '../../features/identity/invitations/AcceptInvitationPage';
import UserManagementWorkspace from '../../features/identity/users/UserManagementWorkspace';
import AuditLogsWorkspace from '../../features/identity/audit/AuditLogsWorkspace';
import ProtectedRoute from './ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Landing Experience & Role Tour (Pages 1 & 2) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/demos" element={<PersonaHubPage />} />

      {/* Authentication & Onboarding Routes (Pages 3 & 4) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

      {/* Main Workspace Dashboard Routes (Protected) */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="operations" element={<OperationsOverview />} />
        <Route path="plant-explorer" element={<PlantExplorer />} />
        <Route path="equipment" element={<EquipmentWorkspace />} />
        <Route path="ai" element={<AICenter />} />
        <Route path="digital-twin" element={<DigitalTwinWorkspace />} />
        <Route path="telemetry" element={<TelemetryWorkspace />} />
        <Route path="runtime" element={<AlarmManagement />} />
        <Route path="alerts" element={<AlarmManagement />} />
        <Route path="work-orders" element={<WorkOrdersWorkspace />} />
        <Route path="reports" element={<ReportingWorkspace />} />
        <Route path="notifications" element={<NotificationCenterWorkspace />} />
        <Route path="connectivity" element={<ConnectivityWorkspace />} />
        <Route path="assets" element={<EquipmentWorkspace />} />
        <Route path="rules" element={<AlarmManagement />} />
        <Route path="enterprise" element={<PlantExplorer />} />
        <Route path="integrations" element={<IntegrationsWorkspace />} />
        <Route path="users" element={<UserManagementWorkspace />} />
        <Route path="audit-logs" element={<AuditLogsWorkspace />} />
        <Route path="admin" element={<AuditLogsWorkspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
