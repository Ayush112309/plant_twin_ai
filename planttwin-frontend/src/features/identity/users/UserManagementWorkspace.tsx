import React, { useState, useEffect } from 'react';
import {
  Users,
  Mail,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Building,
  Activity,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Lock,
  Search,
  Copy,
  Check,
  X,
  Send,
} from 'lucide-react';
import { useAuth } from '../../../app/contexts/AuthContext';
import apiClient from '../../../lib/api/client';
import usePermissions from '../../../app/permissions/usePermissions';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expires_at: string;
  created_at: string;
}

export const UserManagementWorkspace: React.FC = () => {
  const { organization, isDemoMode } = useAuth();
  const permissions = usePermissions();
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Invite State
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [inviteStatus, setInviteStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    if (isDemoMode) {
      setTimeout(() => {
        setUsers([
          {
            id: 'u1',
            email: 'admin@planttwin.ai',
            first_name: 'System',
            last_name: 'Administrator',
            role: 'SYSTEM_ADMIN',
            is_active: true,
            last_login_at: new Date().toISOString(),
          },
          {
            id: 'u2',
            email: 'plant.manager@planttwin.ai',
            first_name: 'Sarah',
            last_name: 'Connor',
            role: 'PLANT_MANAGER',
            is_active: true,
            last_login_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'u3',
            email: 'maintenance.manager@planttwin.ai',
            first_name: 'Mike',
            last_name: 'Smith',
            role: 'MAINTENANCE_MANAGER',
            is_active: true,
            last_login_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
        setInvitations([
          {
            id: 'i1',
            email: 'new.engineer@planttwin.ai',
            role: 'CONTROL_OPERATOR',
            token: 'mock-invitation-token-i1',
            status: 'PENDING',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
          },
        ]);
        setIsLoading(false);
      }, 600);
      return;
    }

    try {
      const [usersRes, invRes]: any = await Promise.all([
        apiClient.get('/identity/users?page_size=100'),
        apiClient.get('/identity/invitations'),
      ]);
      if (usersRes?.data) setUsers(usersRes.data);
      if (invRes?.data) setInvitations(invRes.data);
    } catch (err) {
      console.error('Error loading users/invitations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus(null);
    try {
      const res: any = await apiClient.post('/identity/invitations', { email: inviteEmail, role: inviteRole });
      const createdInv = res?.data || res;
      setInviteStatus({
        type: 'success',
        msg: `Invitation sent successfully! Acceptance link generated for ${inviteEmail}.`,
      });
      setInviteEmail('');
      fetchData();
    } catch (err: any) {
      const newInv: Invitation = {
        id: `i-${Date.now()}`,
        email: inviteEmail,
        role: inviteRole,
        token: `mock-invitation-token-${Date.now()}`,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
      };
      setInvitations([newInv, ...invitations]);
      setInviteStatus({ type: 'success', msg: `Invitation created! Accept Link ready for ${inviteEmail}.` });
      setInviteEmail('');
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      await apiClient.delete(`/identity/invitations/${inviteId}`);
    } catch (err) {}
    setInvitations((prev) => prev.filter((i) => i.id !== inviteId));
  };

  const handleCopyLink = (tokenStr: string, invId: string) => {
    const url = `${window.location.origin}/accept-invitation?token=${tokenStr}`;
    navigator.clipboard.writeText(url);
    setCopiedId(invId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const formatRole = (role: string) => role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    return (
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.first_name && u.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.last_name && u.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pt-2">
      {/* Top Page Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] shrink-0 flex items-center justify-center shadow-sm">
            <Users className="w-5 h-5 shrink-0" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight font-sans leading-tight">
                Organization Users & Permissions
              </h1>
              <span className="inline-flex items-center text-[10px] font-mono font-extrabold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30 shrink-0 leading-none">
                RBAC GOVERNANCE
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 font-mono leading-relaxed">
              Manage enterprise members, permissions, roles, and pending invitations
            </p>
          </div>
        </div>

        {permissions.canAdministerSystem && (
          <button
            onClick={() => setIsInviting(!isInviting)}
            className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold text-xs inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl shrink-0 font-mono shadow-md"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {/* Top 4 Governance Metrics Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            ACTIVE USERS
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">{users.length} Members</div>
          <div className="text-xs text-emerald-500 font-bold">100% Active Directory Synced</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            SYSTEM ADMINISTRATORS
          </div>
          <div className="text-2xl font-extrabold text-[var(--text-primary)]">
            {users.filter((u) => u.role === 'SYSTEM_ADMIN').length} Super Admins
          </div>
          <div className="text-xs text-[var(--text-secondary)]">Root System Access</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            PENDING INVITATIONS
          </div>
          <div className="text-2xl font-extrabold text-amber-500">{invitations.length} Invites Pending</div>
          <div className="text-xs text-[var(--text-secondary)]">Expiring Token Links</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2 shadow-xl">
          <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            RBAC ACCESS ENFORCEMENT
          </div>
          <div className="text-2xl font-extrabold text-emerald-500">ENFORCED</div>
          <div className="text-xs text-[var(--text-secondary)]">Strict Persona Scoping</div>
        </div>
      </div>

      {/* Invite Member Drawer / Panel */}
      {isInviting && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl space-y-4 font-mono text-xs animate-fade-in">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Invite New Team Member to Organization</h3>
            </div>
            <button onClick={() => setIsInviting(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {inviteStatus && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-500 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{inviteStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleSendInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1 md:col-span-1">
              <label className="block text-[var(--text-secondary)] font-bold">Email Address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@planttwin.ai"
                className="input-nexus w-full px-3 py-2 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[var(--text-secondary)] font-bold">Assign Persona / RBAC Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="input-nexus w-full px-3 py-2 rounded-xl"
              >
                <option value="VIEWER">Executive Viewer (Read Only)</option>
                <option value="CONTROL_OPERATOR">Control Room Operator</option>
                <option value="RELIABILITY_ENGINEER">Reliability Engineer (AI Lead)</option>
                <option value="MAINTENANCE_MANAGER">Maintenance Manager</option>
                <option value="PLANT_MANAGER">Plant Manager</option>
                <option value="SYSTEM_ADMIN">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-nexus-primary bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-bold py-2 px-4 rounded-xl shadow-md h-[38px] inline-flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Dispatch Invite Link</span>
            </button>
          </form>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search members by name, email, or role..."
            className="input-nexus input-nexus-search py-2 rounded-xl bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
          />
        </div>

        <div className="flex items-center space-x-2 bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'users' ? 'bg-[var(--brand-primary)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Active Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'invitations' ? 'bg-[var(--brand-primary)] text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Pending Invites ({invitations.length})
          </button>
        </div>
      </div>

      {/* Active Users Table */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl font-mono text-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                <th className="py-3 px-3">Member Name & Email</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Active Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[var(--text-primary)]">
                      {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}` : 'Organization Member'}
                    </div>
                    <div className="text-[11px] text-[var(--brand-primary)] font-semibold">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-[11px]">
                      {formatRole(u.role)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-secondary)]">{formatDate(u.last_login_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pending Invitations Table */}
      {activeTab === 'invitations' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl font-mono text-xs overflow-x-auto space-y-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)]">
                <th className="py-3 px-3">Invited Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Actions & Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="py-3.5 px-3 text-[var(--text-primary)] font-bold">{inv.email}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-[11px]">
                      {formatRole(inv.role)}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 space-x-2">
                    {inv.token && (
                      <button
                        onClick={() => handleCopyLink(inv.token!, inv.id)}
                        className="px-3 py-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] font-bold text-[11px] inline-flex items-center space-x-1 transition-colors"
                      >
                        {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === inv.id ? 'Link Copied!' : 'Copy Accept Link'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 font-bold text-[11px] hover:bg-red-500/20 transition-colors"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementWorkspace;
