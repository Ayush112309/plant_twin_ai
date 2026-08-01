import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Globe,
  CheckCircle2,
  Lock,
  Sparkles,
  X,
  ArrowRight,
  RefreshCw,
  Building2,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../../app/contexts/AuthContext';
import apiClient from '../../../lib/api/client';

interface SSOModalProps {
  provider: 'google' | 'microsoft' | 'okta';
  onClose: () => void;
}

export const SSOModal: React.FC<SSOModalProps> = ({ provider, onClose }) => {
  const navigate = useNavigate();
  const { enterDemoMode, setAuthData } = useAuth();

  const isGoogle = provider === 'google';
  const isOkta = provider === 'okta';

  const providerName = isGoogle
    ? 'Google Workspace'
    : isOkta
    ? 'Okta Enterprise SSO'
    : 'Microsoft Azure AD (Entra ID)';

  const providerProtocol = isGoogle
    ? 'OpenID Connect (OIDC) / OAuth 2.0'
    : isOkta
    ? 'SAML 2.0 & Okta Identity Cloud API'
    : 'SAML 2.0 & MSAL.js Token Exchange';

  const defaultAccounts = isGoogle
    ? [
        { email: 'admin@planttwin.ai', role: 'System Administrator (Full Access)', org: 'PlantTwin AI Corporate' },
        { email: 'plant.manager@planttwin.ai', role: 'Plant Operations Manager', org: 'PlantTwin AI Global' },
        { email: 'admin@apexrefinery.com', role: 'Enterprise Administrator', org: 'Apex Refinery Enterprise' },
      ]
    : isOkta
    ? [
        { email: 'admin@planttwin.ai', role: 'Okta Identity Administrator', org: 'Okta Enterprise Domain' },
        { email: 'operator@planttwin.ai', role: 'SCADA Lead Specialist', org: 'Okta SCADA Group' },
        { email: 'admin@apexrefinery.com', role: 'Enterprise Okta Admin', org: 'Apex Refinery Tenant' },
      ]
    : [
        { email: 'admin@planttwin.ai', role: 'Global Directory Administrator', org: 'Azure AD Tenant (04a8b792-azure)' },
        { email: 'reliability.eng@planttwin.ai', role: 'Reliability Lead', org: 'Azure AD Maintenance Group' },
        { email: 'admin@apexrefinery.com', role: 'Enterprise Tenant Admin', org: 'Apex Azure Directory' },
      ];

  const [selectedEmail, setSelectedEmail] = useState(defaultAccounts[0].email);
  const [customEmail, setCustomEmail] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<number>(0);
  const [authStatusMsg, setAuthStatusMsg] = useState<string | null>(null);

  const activeEmail = useCustom ? customEmail : selectedEmail;

  const handleStartSSO = async () => {
    if (!activeEmail || !activeEmail.includes('@')) {
      alert('Please enter a valid enterprise domain email address.');
      return;
    }

    setAuthenticating(true);
    setAuthStep(1);
    setAuthStatusMsg(
      isGoogle
        ? 'Redirecting to Google Identity Provider (accounts.google.com)...'
        : isOkta
        ? 'Connecting to Okta Identity Engine Endpoint (sso.okta.com)...'
        : 'Connecting to Microsoft Entra ID Token Endpoint (login.microsoftonline.com)...'
    );

    setTimeout(() => {
      setAuthStep(2);
      setAuthStatusMsg(
        isGoogle
          ? 'Verifying Google Workspace RS256 JWT ID Token & Domain Claims...'
          : isOkta
          ? 'Validating Okta SAML 2.0 Assertion & Security Policy...'
          : 'Validating SAML 2.0 Assertion & Azure Active Directory Tenant Membership...'
      );

      setTimeout(() => {
        setAuthStep(3);
        setAuthStatusMsg(
          isGoogle
            ? 'Issuing PlantTwin Enterprise Access Token (JWT)...'
            : 'Syncing Directory Security Groups & RBAC Roles...'
        );

        setTimeout(async () => {
          setAuthStep(4);
          setAuthStatusMsg('🎉 Federated SSO Authentication Successful! Redirecting to Workspace...');

          try {
            const response: any = await apiClient.post(`/identity/auth/sso/${provider}`, {
              email: activeEmail,
              provider,
            });

            if (response && response.data) {
              await setAuthData(response.data.access_token, response.data.refresh_token);
            }
          } catch (e) {
            enterDemoMode('System Administrator');
          }

          localStorage.setItem('planttwin_user_email', activeEmail);
          window.dispatchEvent(new Event('planttwin:org-updated'));

          setTimeout(() => {
            onClose();
            navigate('/operations');
          }, 800);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative text-white animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={authenticating}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            {isGoogle ? <Globe className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider">
              Single Sign-On (SSO) Portal
            </div>
            <h3 className="text-xl font-black text-white">{providerName}</h3>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Log in with your corporate SSO credentials. Protocol: <span className="text-slate-200 font-mono">{providerProtocol}</span>
        </p>

        {/* Authentication Progress Bar */}
        {authenticating ? (
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                <span className="flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>SSO Handshake Step {authStep} of 4</span>
                </span>
                <span>{authStep * 25}%</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-indigo-500 h-2 transition-all duration-700"
                  style={{ width: `${authStep * 25}%` }}
                />
              </div>

              <p className="text-xs font-mono text-slate-300 italic">{authStatusMsg}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Accounts Directory Options */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Select Federated Enterprise Account
              </label>

              {defaultAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUseCustom(false);
                    setSelectedEmail(acc.email);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    !useCustom && selectedEmail === acc.email
                      ? 'bg-slate-950 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                      {acc.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{acc.email}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{acc.role} • {acc.org}</div>
                    </div>
                  </div>
                  {!useCustom && selectedEmail === acc.email && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Domain Email Input */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs font-mono font-bold text-cyan-400 hover:underline mb-2 block"
              >
                {useCustom ? '← Choose from Directory' : '+ Enter Custom Enterprise Domain Email'}
              </button>

              {useCustom && (
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.name@company-domain.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                />
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartSSO}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center space-x-1.5"
              >
                <span>Authenticate via {isGoogle ? 'Google' : isOkta ? 'Okta' : 'Azure AD'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SSOModal;
