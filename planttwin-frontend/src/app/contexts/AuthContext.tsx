import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../../lib/api/client';

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  organization_id: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subscription_tier: string | null;
}

export interface AuthPermissions {
  is_system_admin: boolean;
  can_view_all_plants: boolean;
  can_write_plc: boolean;
  can_manage_work_orders: boolean;
  can_promote_models: boolean;
  can_export_reports: boolean;
  can_administer_system: boolean;
  can_invite_users: boolean;
}

export interface MeResponse {
  user: User;
  organization: Organization | null;
  permissions: AuthPermissions;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  user: User | null;
  organization: Organization | null;
  permissions: AuthPermissions | null;
  demoPersona: string | null;
  setAuthData: (token: string, refresh: string) => Promise<void>;
  enterDemoMode: (persona: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoPersona, setDemoPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [permissions, setPermissions] = useState<AuthPermissions | null>(null);

  const fetchProfile = async () => {
    try {
      const response: any = await apiClient.get('/identity/auth/me');
      if (response && response.data) {
        const { user, organization, permissions } = response.data as MeResponse;
        setUser(user);
        setOrganization(organization);
        setPermissions(permissions);
        setIsAuthenticated(true);
        setIsDemoMode(false);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('planttwin_access_token');
    const demo = localStorage.getItem('planttwin_demo_persona');

    if (token) {
      fetchProfile();
    } else if (demo) {
      setIsDemoMode(true);
      setDemoPersona(demo);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      if (!isDemoMode) {
        logout();
      }
    };

    window.addEventListener('planttwin:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('planttwin:unauthorized', handleUnauthorized);
  }, [isDemoMode]);

  const setAuthData = async (token: string, refresh: string) => {
    localStorage.setItem('planttwin_access_token', token);
    localStorage.setItem('planttwin_refresh_token', refresh);
    localStorage.removeItem('planttwin_demo_persona');
    setIsDemoMode(false);
    setDemoPersona(null);
    await fetchProfile();
  };

  const enterDemoMode = (persona: string) => {
    localStorage.setItem('planttwin_demo_persona', persona);
    localStorage.removeItem('planttwin_access_token');
    localStorage.removeItem('planttwin_refresh_token');
    window.dispatchEvent(new Event('planttwin:org-updated'));
    setIsDemoMode(true);
    setDemoPersona(persona);
    setIsAuthenticated(false);
    setUser(null);
    setOrganization(null);
    setPermissions(null);
  };

  const logout = () => {
    localStorage.removeItem('planttwin_access_token');
    localStorage.removeItem('planttwin_refresh_token');
    localStorage.removeItem('planttwin_demo_persona');
    setIsAuthenticated(false);
    setIsDemoMode(false);
    setDemoPersona(null);
    setUser(null);
    setOrganization(null);
    setPermissions(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isDemoMode,
        isLoading,
        user,
        organization,
        permissions,
        demoPersona,
        setAuthData,
        enterDemoMode,
        logout,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
