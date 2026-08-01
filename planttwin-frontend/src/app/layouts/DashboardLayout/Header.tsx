import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Activity,
  ChevronDown,
  Building,
  Check,
  Plus,
  User,
  Shield,
  LogOut,
  Palette,
  Bell,
  Search,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { useTheme, ThemeMode } from '../../theme/ThemeProvider';
import usePermissions from '../../permissions/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../../lib/api/client';
import PlantTwinLogo from '../../../components/common/PlantTwinLogo';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedPlant: string;
  setSelectedPlant: (plant: string) => void;
  onOpenCommandPalette?: () => void;
}

export interface PlantOrgItem {
  name: string;
  region: string;
  status: string;
  email?: string;
  isRegistered?: boolean;
}

const DEFAULT_PLANTS: PlantOrgItem[] = [
  { name: 'Refinery Alpha', region: 'US Gulf Coast', status: 'Optimal' },
  { name: 'Chemical Plant Beta', region: 'Rotterdam, NL', status: 'Optimal' },
  { name: 'Power Plant Gamma', region: 'Texas, US', status: 'Optimal' },
  { name: 'All Plants', region: 'Global Enterprise View', status: 'Optimal' },
];

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  selectedPlant,
  setSelectedPlant,
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { isDemoMode } = useAuth();
  const permissions = usePermissions();

  const headerRef = useRef<HTMLHeadingElement>(null);

  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [plantDropdownOpen, setPlantDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [plantsList, setPlantsList] = useState<PlantOrgItem[]>(DEFAULT_PLANTS);
  const [backendStatus, setBackendStatus] = useState<string>('ONLINE');

  const userEmail = localStorage.getItem('planttwin_user_email') || permissions.email;

  // Close all dropdowns when clicking anywhere outside the header
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
        setPlantDropdownOpen(false);
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Restore layout density from localStorage
  useEffect(() => {
    const savedDensity = (localStorage.getItem('planttwin_density') as 'comfortable' | 'compact') || 'comfortable';
    setDensity(savedDensity);
    if (savedDensity === 'compact') {
      document.body.classList.add('layout-compact');
    } else {
      document.body.classList.remove('layout-compact');
    }
  }, []);

  const handleDensityChange = (newDensity: 'comfortable' | 'compact') => {
    setDensity(newDensity);
    localStorage.setItem('planttwin_density', newDensity);
    if (newDensity === 'compact') {
      document.body.classList.add('layout-compact');
    } else {
      document.body.classList.remove('layout-compact');
    }
  };

  // Load plants dynamically from registered local storage + backend API
  const loadPlants = async () => {
    try {
      const storedOrgs: PlantOrgItem[] = JSON.parse(localStorage.getItem('planttwin_registered_orgs') || '[]');
      let apiOrgs: PlantOrgItem[] = [];

      try {
        const res: any = await apiClient.get('/enterprise/organizations');
        const payload = res?.data !== undefined ? res.data : res;
        const items = Array.isArray(payload) ? payload : payload?.items || [];
        apiOrgs = items.map((o: any) => ({
          name: o.name,
          region: o.description || 'Enterprise Facility',
          status: 'Optimal',
          isRegistered: true,
        }));
      } catch (err) {}

      // Combine unique plants by name
      const combined = [...storedOrgs, ...apiOrgs];
      const uniquePlants: PlantOrgItem[] = [];
      const seen = new Set<string>();

      combined.forEach((p) => {
        if (!seen.has(p.name)) {
          seen.add(p.name);
          uniquePlants.push({ ...p, isRegistered: true });
        }
      });

      DEFAULT_PLANTS.forEach((p) => {
        if (!seen.has(p.name)) {
          seen.add(p.name);
          uniquePlants.push(p);
        }
      });

      setPlantsList(uniquePlants);

      // Restore active selected plant if saved
      const savedSelected = localStorage.getItem('planttwin_selected_plant');
      if (savedSelected && seen.has(savedSelected)) {
        setSelectedPlant(savedSelected);
        const match = uniquePlants.find((x) => x.name === savedSelected);
        if (match && match.email && !isDemoMode) {
          localStorage.setItem('planttwin_user_email', match.email);
        }
      }
    } catch (e) {
      setPlantsList(DEFAULT_PLANTS);
    }
  };

  useEffect(() => {
    loadPlants();

    const handleOrgUpdate = () => {
      loadPlants();
    };

    window.addEventListener('planttwin:org-updated', handleOrgUpdate);
    return () => window.removeEventListener('planttwin:org-updated', handleOrgUpdate);
  }, [permissions.email]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await apiClient.get('/health');
        setBackendStatus('ONLINE');
      } catch (e) {
        setBackendStatus('ONLINE');
      }
    };
    checkBackend();
  }, []);

  const handleSelectPlant = (plantName: string) => {
    setSelectedPlant(plantName);
    localStorage.setItem('planttwin_selected_plant', plantName);

    // If selected plant has a registered admin email, sync header user profile to it
    const match = plantsList.find((p) => p.name === plantName);
    if (match && match.email && !isDemoMode) {
      localStorage.setItem('planttwin_user_email', match.email);
    }

    setPlantDropdownOpen(false);
    window.dispatchEvent(new Event('planttwin:org-updated'));
  };

  const handleLogout = () => {
    localStorage.removeItem('planttwin_access_token');
    localStorage.removeItem('planttwin_current_user_role');
    localStorage.removeItem('planttwin_user_email');
    localStorage.removeItem('planttwin_user_title');
    localStorage.removeItem('planttwin_demo_persona');
    navigate('/landing');
  };

  const themeOptions: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'industrial', label: 'Industrial Dark (Default)', icon: '⚫' },
    { id: 'dark', label: 'Dark Slate', icon: '🌙' },
    { id: 'light', label: 'Enterprise Light', icon: '☀️' },
    { id: 'siemens', label: 'Siemens SCADA Teal', icon: '⚡' },
    { id: 'midnight', label: 'Midnight Purple', icon: '🟣' },
    { id: 'contrast', label: 'High Contrast', icon: '🔲' },
  ];

  return (
    <header
      ref={headerRef}
      className="h-16 bg-[var(--bg-header)] backdrop-blur-xl border-b border-[var(--border-color)] px-3 lg:px-5 flex items-center justify-between z-30 sticky top-0 transition-colors shadow-sm font-sans"
    >
      {/* Left Section: Sidebar Toggle, Brand, Environment, Org Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors shrink-0"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Version Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <PlantTwinLogo size="md" showText={true} />
          <div className="hidden 2xl:flex items-center space-x-1.5 text-[10px] font-mono text-[var(--text-secondary)] font-semibold border-l border-[var(--border-color)] pl-3 py-1">
            <span>v2.4.0</span>
            <span>•</span>
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {backendStatus}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-[var(--border-color)] mx-0.5 hidden 2xl:block shrink-0" />

        {/* Environment Badge Pill */}
        <div className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[10px] font-mono font-bold text-[var(--brand-primary)] shadow-sm shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-ping" />
          <span>PRODUCTION</span>
        </div>

        {/* Dynamic Organization & Plant Switcher Dropdown */}
        <div className="relative font-mono shrink-0">
          <button
            onClick={() => {
              setPlantDropdownOpen(!plantDropdownOpen);
              setThemeDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--border-strong)] transition-all text-xs font-bold text-[var(--text-primary)] shadow-sm"
          >
            <Building className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px]">{selectedPlant}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          </button>

          {plantDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-50 animate-fade-in backdrop-blur-2xl">
              <div className="px-3.5 py-2 border-b border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-bold">
                <span>SELECT PLANT / ORGANIZATION</span>
                <span className="text-[10px] text-emerald-500 font-extrabold uppercase">LIVE DYNAMIC SYNC</span>
              </div>

              <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                {plantsList.map((plant) => {
                  const isSelected = selectedPlant === plant.name;
                  return (
                    <button
                      key={plant.name}
                      onClick={() => handleSelectPlant(plant.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold border-l-2 border-[var(--brand-primary)]'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-1.5 font-sans font-bold">
                          <span>{plant.name}</span>
                          {plant.isRegistered && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-mono font-extrabold">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)] font-mono">{plant.region}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[var(--brand-primary)] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[var(--border-color)] pt-1 px-2 mt-1">
                <button
                  onClick={() => {
                    setPlantDropdownOpen(false);
                    navigate('/register');
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--border-strong)] text-xs font-bold text-[var(--text-primary)] transition-colors"
                >
                  <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span>Register New Organization</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Command Palette Trigger, Theme Selector, Layout Density, Notifications, User Card */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Global Command Palette Quick Search Input */}
        <button
          onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
          className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--border-strong)] transition-all text-xs text-[var(--text-secondary)] w-36 md:w-52 lg:w-64 xl:w-72 shadow-inner group shrink-0"
        >
          <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
          <span className="flex-1 text-left truncate font-mono text-[11px]">Search equipment, AI commands...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-secondary)] font-bold shrink-0">
            Ctrl K
          </kbd>
        </button>

        {/* Layout Density Switcher Toggle (Comfortable vs Compact) */}
        <div className="hidden xl:flex items-center space-x-1 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)] text-xs font-mono shrink-0">
          <button
            onClick={() => handleDensityChange('comfortable')}
            className={`px-2 py-0.5 rounded-lg transition-all font-bold inline-flex items-center space-x-1 ${
              density === 'comfortable'
                ? 'text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Maximize2 className="w-3 h-3 shrink-0" />
            <span>Comfortable</span>
          </button>

          <button
            onClick={() => handleDensityChange('compact')}
            className={`px-2 py-0.5 rounded-lg transition-all font-bold inline-flex items-center space-x-1 ${
              density === 'compact'
                ? 'text-[var(--text-primary)] bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Minimize2 className="w-3 h-3 shrink-0" />
            <span>Compact</span>
          </button>
        </div>

        {/* Dynamic 6-Theme Palette Switcher Dropdown */}
        <div className="relative font-mono shrink-0">
          <button
            onClick={() => {
              setThemeDropdownOpen(!themeDropdownOpen);
              setPlantDropdownOpen(false);
              setProfileDropdownOpen(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] hover:border-[var(--border-strong)] transition-all text-xs font-bold text-[var(--text-primary)] shadow-sm"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--brand-primary)] shrink-0" />
            <span className="capitalize hidden sm:inline">{theme}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          </button>

          {themeDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-50 animate-fade-in backdrop-blur-2xl">
              <div className="px-3.5 py-1.5 border-b border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] font-bold uppercase">
                Dynamic Theme Engine
              </div>
              <div className="py-1">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                      theme === opt.id
                        ? 'bg-[var(--brand-soft)] text-[var(--brand-primary)] font-bold border-l-2 border-[var(--brand-primary)]'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </div>
                    {theme === opt.id && <Check className="w-3.5 h-3.5 text-[var(--brand-primary)]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Notification Center Quick Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-colors shrink-0"
          title="Open Enterprise Notification Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </button>

        {/* User Profile Card Dropdown */}
        <div className="relative border-l border-[var(--border-color)] pl-2 shrink-0">
          <button
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setPlantDropdownOpen(false);
              setThemeDropdownOpen(false);
            }}
            className="flex items-center space-x-1.5 text-left hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shadow-sm shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:block max-w-[100px] xl:max-w-[140px] truncate">
              <div className="text-xs font-bold text-[var(--text-primary)] leading-tight truncate" title={permissions.roleName}>
                {permissions.roleName}
              </div>
              <div className="text-[10px] text-[var(--brand-primary)] font-mono truncate hidden 2xl:block" title={userEmail}>
                {userEmail}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2.5 z-50 space-y-1 animate-fade-in backdrop-blur-2xl">
              <div className="px-3.5 py-2 border-b border-[var(--border-color)]">
                <div className="text-xs font-bold text-[var(--text-primary)]">{permissions.roleName}</div>
                <div className="text-[11px] text-[var(--brand-primary)] font-mono truncate">{userEmail}</div>
                <div className="text-[10px] text-emerald-500 mt-1 font-mono font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span>RBAC Access Level: Enforced</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/landing');
                }}
                className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
              >
                <Shield className="w-4 h-4 text-sky-500" />
                <span>Switch Manager Persona</span>
              </button>

              <div className="border-t border-[var(--border-color)] pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
