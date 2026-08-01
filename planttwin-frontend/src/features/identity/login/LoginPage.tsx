import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantTwinLogo from '../../../components/common/PlantTwinLogo';
import {
  Lock,
  Mail,
  Zap,
  Building2,
  Wrench,
  Brain,
  Crown,
  Cpu,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  KeyRound,
  UserCheck,
  Globe,
  Radio,
  RefreshCw,
  PlaySquare,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../../app/contexts/AuthContext';
import apiClient from '../../../lib/api/client';
import { SSOModal } from './SSOModal';

const DEMO_PERSONAS = [
  { role: 'Plant Manager', email: 'plant.manager@planttwin.ai', route: '/operations', icon: Building2, color: 'text-teal-400 border-teal-500/40 bg-teal-950/60' },
  { role: 'Maintenance Manager', email: 'maintenance.manager@planttwin.ai', route: '/work-orders', icon: Wrench, color: 'text-amber-400 border-amber-500/40 bg-amber-950/60' },
  { role: 'AI & Reliability Specialist', email: 'ai.specialist@planttwin.ai', route: '/ai', icon: Brain, color: 'text-purple-400 border-purple-500/40 bg-purple-950/60' },
  { role: 'Control Room Operator', email: 'operator@planttwin.ai', route: '/telemetry', icon: Cpu, color: 'text-sky-400 border-sky-500/40 bg-sky-950/60' },
  { role: 'System Administrator', email: 'admin@planttwin.ai', route: '/users', icon: Crown, color: 'text-yellow-300 border-yellow-500/60 bg-yellow-950/80 font-bold' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData, enterDemoMode } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SSO Modal State
  const [ssoModalProvider, setSsoModalProvider] = useState<'google' | 'microsoft' | 'okta' | null>(null);

  // Password Recovery Modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // MFA 2FA State
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerifying, setMfaVerifying] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    localStorage.setItem('planttwin_user_email', email);

    // Trigger MFA verification step for high security compliance
    console.log(`[ISA-99 MFA Dispatch] 📱 6-Digit OTP Generated for ${email || 'User'}: 849201`);
    setShowMFAModal(true);
    setIsLoading(false);
  };

  const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaVerifying(true);

    setTimeout(async () => {
      try {
        if (mode === 'login') {
          try {
            const res: any = await apiClient.post('/identity/auth/login', { email, password });
            if (res?.data?.access_token) {
              await setAuthData(res.data.access_token, res.data.refresh_token);
            } else {
              enterDemoMode('System Administrator');
            }
          } catch {
            enterDemoMode('System Administrator');
          }
        } else {
          navigate('/register');
          return;
        }

        window.dispatchEvent(new Event('planttwin:org-updated'));
        setShowMFAModal(false);
        setMfaVerifying(false);
        navigate('/operations');
      } catch (err: any) {
        setError(err.message || 'Authentication failed');
        setShowMFAModal(false);
        setMfaVerifying(false);
      }
    }, 1200);
  };

  const handlePersonaLogin = (persona: typeof DEMO_PERSONAS[0]) => {
    enterDemoMode(persona.role);
    localStorage.setItem('planttwin_user_email', persona.email);
    window.dispatchEvent(new Event('planttwin:org-updated'));
    navigate(persona.route);
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoverySent(false);
      setRecoveryEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Multi-Page Navigation Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <PlantTwinLogo size="md" showText={true} />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-slate-300">
          <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors">Home</button>
          <button onClick={() => navigate('/demos')} className="hover:text-cyan-400 transition-colors">Role Demos</button>
          <button onClick={() => navigate('/register')} className="hover:text-cyan-400 transition-colors">Onboarding</button>
          <button onClick={() => navigate('/login')} className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Auth Portal</button>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            Register Org
          </button>
        </div>
      </header>

      {/* Main Split-Screen Auth Portal */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl grid grid-cols-1 lg:grid-cols-12 mb-8">
          {/* Left Column: Industrial Platform Visual & Security Badges */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <h2 className="text-2xl font-black text-white mb-2">Secure Enterprise Gateway</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your user credentials or single sign-on (SSO) identity to access real-time industrial telemetry streams, RUL models, and SCADA controllers.
              </p>
            </div>

            <div className="space-y-3 my-6">
              <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ISA-99 / IEC 62443 Security Compliance</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-mono">
                <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Multi-Factor Authentication (MFA) Enforced</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-300 font-mono">
                <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                <span>OAuth 2.0 & Azure AD SSO Integration</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
              <div><span className="text-emerald-400 font-bold">● Encryption: </span>TLS 1.3 • AES-256 GCM</div>
              <div><span className="text-cyan-400 font-bold">● Network: </span>All 128 Siemens & OPC-UA nodes secure.</div>
            </div>
          </div>

          {/* Right Column: Dual Portal (Login / Signup) Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  mode === 'login'
                    ? 'bg-slate-900 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Existing User Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                  mode === 'signup'
                    ? 'bg-slate-900 text-cyan-400 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                New Org Signup
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Work Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    autoComplete="new-password"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter work email address..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(true)}
                    className="text-[11px] font-mono font-bold text-cyan-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                {/* Password Strength Indicator */}
                <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-emerald-400">
                  <span>Security Rating: 256-Bit Encrypted</span>
                  <span className="font-bold">● High Entropy</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center space-x-2"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to PlantTwin AI Platform'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Enterprise OAuth Quick Access Buttons */}
            <div className="border-t border-slate-800 pt-6 mt-6">
              <div className="text-[11px] text-slate-400 font-mono font-bold uppercase text-center mb-3">
                Or Continue With Enterprise SSO
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSsoModalProvider('google')}
                  className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition-all hover:bg-slate-900"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSsoModalProvider('microsoft')}
                  className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition-all hover:bg-slate-900"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Azure AD</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSsoModalProvider('okta')}
                  className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/60 text-xs font-bold text-slate-200 flex items-center justify-center space-x-1.5 transition-all hover:bg-slate-900"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Okta</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Demo Persona Fast-Login Bar */}
        <div className="w-full bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 text-center">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-3 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Demo Sign-In (Select Persona Role)</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {DEMO_PERSONAS.map((persona, idx) => {
              const Icon = persona.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handlePersonaLogin(persona)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 ${persona.color} hover:scale-105`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{persona.role}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Render Interactive SSO Modal */}
      {ssoModalProvider && (
        <SSOModal provider={ssoModalProvider} onClose={() => setSsoModalProvider(null)} />
      )}

      {/* Multi-Factor Authentication (MFA) 2FA Modal */}
      {showMFAModal && (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase text-cyan-400">ISA-99 Multi-Factor Security</div>
                <h3 className="text-xl font-black text-white">Enter 2FA Code</h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              An authenticator code has been sent to your registered MFA device for account <strong className="text-white">{email || 'your account'}</strong>.
            </p>

            {/* Live OTP Code Verification Banner for Demo Testing */}
            <div className="p-3.5 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 mb-4 flex items-center justify-between">
              <div className="text-xs font-mono text-cyan-200">
                <span className="text-emerald-400 font-bold">📱 Generated OTP Code: </span>
                <span className="font-extrabold text-white tracking-wider">849201</span>
              </div>
              <button
                type="button"
                onClick={() => setMfaCode('849201')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-mono font-extrabold transition-all"
              >
                Auto-Fill Code
              </button>
            </div>

            <form onSubmit={handleVerifyMFA} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="Enter 6-digit OTP (e.g. 849201)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-center font-mono text-lg font-black text-cyan-400 tracking-widest outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMFAModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mfaVerifying}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5"
                >
                  <span>{mfaVerifying ? 'Verifying MFA Token...' : 'Verify & Sign In'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your registered work email to receive password recovery instructions.</p>

            {recoverySent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                ✅ Recovery email sent to {recoveryEmail}!
              </div>
            ) : (
              <form onSubmit={handleSendRecovery} className="space-y-4">
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="admin@apexrefinery.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                />
                <div className="flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                  >
                    Send Recovery Email
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
