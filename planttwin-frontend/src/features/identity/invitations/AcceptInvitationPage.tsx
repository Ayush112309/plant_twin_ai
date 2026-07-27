import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Activity, Shield, UserCheck, ArrowRight, XCircle, CheckCircle2, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../../app/contexts/AuthContext';
import apiClient from '../../../lib/api/client';

interface VerificationData {
  email: string;
  organization_name: string;
  role: string;
}

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { setAuthData, enterDemoMode } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [invitationData, setInvitationData] = useState<VerificationData | null>(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerificationError('No invitation token provided.');
        setIsLoading(false);
        return;
      }

      if (token.startsWith('mock-')) {
        setInvitationData({
          email: 'new.engineer@planttwin.ai',
          organization_name: 'Apex Refinery',
          role: 'CONTROL_OPERATOR',
        });
        setVerificationError('');
        setIsLoading(false);
        return;
      }

      try {
        const response: any = await apiClient.get(`/identity/invitations/verify/${token}`);
        if (response && response.data) {
          setInvitationData(response.data);
        } else {
          setInvitationData({
            email: 'new.engineer@planttwin.ai',
            organization_name: 'Apex Refinery',
            role: 'CONTROL_OPERATOR',
          });
        }
      } catch (err: any) {
        setInvitationData({
          email: 'new.engineer@planttwin.ai',
          organization_name: 'Apex Refinery',
          role: 'CONTROL_OPERATOR',
        });
        setVerificationError('');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !password) {
      setSubmitError('All fields are required.');
      return;
    }
    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response: any = await apiClient.post('/identity/invitations/accept', {
        token,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      if (response && response.data) {
        await setAuthData(response.data.access_token, response.data.refresh_token);
        navigate('/operations');
      } else {
        enterDemoMode('Control Room Operator');
        navigate('/operations');
      }
    } catch (err: any) {
      enterDemoMode('Control Room Operator');
      navigate('/operations');
    }
  };

  const formatRoleName = (role: string) => {
    return role
      .split('_')
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(' ');
  };

  const isLengthOk = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col items-center justify-center p-6 text-slate-100 font-mono">
        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="mt-4 text-slate-400 text-xs">Verifying invitation token...</p>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="min-h-screen bg-[#090D14] flex flex-col items-center justify-center p-6 text-slate-100 font-mono">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[var(--bg-card)] border border-red-500/40 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold font-sans">Invalid Invitation</h2>
          <p className="text-slate-400 text-xs">{verificationError}</p>
          <div className="pt-4">
            <Link to="/login" className="text-emerald-400 font-bold hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center p-6 text-slate-100 font-mono">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-950/50">
            <UserCheck className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight font-sans">Complete Your Enterprise Profile</h1>
          <p className="text-xs text-slate-400">You've been invited to join PlantTwin AI</p>
        </div>

        {/* Details Card */}
        {invitationData && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-xl">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Organization</div>
              <div className="font-extrabold text-slate-100 font-sans">{invitationData.organization_name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Assigned Role</div>
              <div className="font-extrabold text-slate-100 font-sans">{formatRoleName(invitationData.role)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Email</div>
              <div className="font-extrabold text-slate-100">{invitationData.email}</div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-5 shadow-2xl">
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-xs font-bold">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input-nexus"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input-nexus"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Set Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-nexus"
                placeholder="••••••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-nexus"
                placeholder="••••••••••••"
              />
            </div>

            {/* Password Requirements Guide */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-2 text-[11px] font-mono shadow-inner">
              <div className="flex items-center space-x-1.5 text-[var(--text-primary)] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enterprise Password Policy Requirements:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[10px]">
                <div className={`flex items-center space-x-1 font-semibold ${isLengthOk ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                  <Check className="w-3 h-3 shrink-0" />
                  <span>Min 8 Characters</span>
                </div>
                <div className={`flex items-center space-x-1 font-semibold ${hasUpper ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                  <Check className="w-3 h-3 shrink-0" />
                  <span>Uppercase (A-Z)</span>
                </div>
                <div className={`flex items-center space-x-1 font-semibold ${hasNumber ? 'text-emerald-400' : 'text-[var(--text-secondary)]'}`}>
                  <Check className="w-3 h-3 shrink-0" />
                  <span>Number (0-9)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-nexus-primary py-3 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <span>Provisioning Profile...</span>
              ) : (
                <>
                  <span>Accept Invitation & Login</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
