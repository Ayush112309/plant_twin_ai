import { useAuth } from '../contexts/AuthContext';

export interface RolePermissions {
  roleName: string;
  email: string;
  badge: string;
  isFullAccess: boolean;
  canWritePLC: boolean;
  canManageWorkOrders: boolean;
  canPromoteModels: boolean;
  canExportReports: boolean;
  canAdministerSystem: boolean;
}

const PERSONA_PERMISSIONS: Record<string, RolePermissions> = {
  'Plant Manager': {
    roleName: 'Plant Manager',
    email: 'plant.manager@planttwin.ai',
    badge: '🏭 Executive Leadership',
    isFullAccess: false,
    canWritePLC: false,
    canManageWorkOrders: false,
    canPromoteModels: false,
    canExportReports: true,
    canAdministerSystem: false,
  },
  'Maintenance Manager': {
    roleName: 'Maintenance Manager',
    email: 'maintenance.manager@planttwin.ai',
    badge: '🔧 Maintenance & Asset Reliability',
    isFullAccess: false,
    canWritePLC: false,
    canManageWorkOrders: true,
    canPromoteModels: false,
    canExportReports: true,
    canAdministerSystem: false,
  },
  'AI & Reliability Specialist': {
    roleName: 'AI & Reliability Specialist',
    email: 'ai.specialist@planttwin.ai',
    badge: '🤖 Predictive Intelligence',
    isFullAccess: false,
    canWritePLC: false,
    canManageWorkOrders: false,
    canPromoteModels: true,
    canExportReports: true,
    canAdministerSystem: false,
  },
  'Control Room Operator': {
    roleName: 'Control Room Operator',
    email: 'operator@planttwin.ai',
    badge: '🎛 SCADA & Live Operations',
    isFullAccess: false,
    canWritePLC: true,
    canManageWorkOrders: false,
    canPromoteModels: false,
    canExportReports: false,
    canAdministerSystem: false,
  },
  'System Administrator': {
    roleName: 'System Administrator (Full Access)',
    email: 'admin@planttwin.ai',
    badge: '⚙ Super Admin (Full Platform Access)',
    isFullAccess: true,
    canWritePLC: true,
    canManageWorkOrders: true,
    canPromoteModels: true,
    canExportReports: true,
    canAdministerSystem: true,
  },
};

export const usePermissions = (): RolePermissions => {
  const { isAuthenticated, isDemoMode, user, permissions, demoPersona } = useAuth();
  const storedEmail = localStorage.getItem('planttwin_user_email');

  // If we have a real authenticated user and permissions from the backend API
  if (isAuthenticated && user && permissions) {
    const roleMapping: Record<string, string> = {
      SYSTEM_ADMIN: 'System Administrator (Full Access)',
      PLANT_MANAGER: 'Plant Manager',
      MAINTENANCE_MANAGER: 'Maintenance Manager',
      AI_SPECIALIST: 'AI & Reliability Specialist',
      CONTROL_OPERATOR: 'Control Room Operator',
      VIEWER: 'Viewer',
    };

    const roleNameStr = user.role ? roleMapping[user.role] || user.role : 'User';

    return {
      roleName: roleNameStr,
      email: storedEmail || user.email,
      badge: user.role === 'SYSTEM_ADMIN' ? '⚙ Super Admin' : '👤 Team Member',
      isFullAccess: permissions.is_system_admin,
      canWritePLC: permissions.can_write_plc,
      canManageWorkOrders: permissions.can_manage_work_orders,
      canPromoteModels: permissions.can_promote_models,
      canExportReports: permissions.can_export_reports,
      canAdministerSystem: permissions.can_administer_system,
    };
  }

  // Fallback to Demo Mode personas
  if (isDemoMode && demoPersona) {
    const base = PERSONA_PERMISSIONS[demoPersona] || PERSONA_PERMISSIONS['Plant Manager'];
    return {
      ...base,
      email: storedEmail || base.email,
    };
  }

  // Default fallback if not logged in and not in demo mode
  const base = PERSONA_PERMISSIONS['Plant Manager'];
  return {
    ...base,
    email: storedEmail || base.email,
  };
};

export default usePermissions;
