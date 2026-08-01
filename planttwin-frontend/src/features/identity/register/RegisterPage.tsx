import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlantTwinLogo from '../../../components/common/PlantTwinLogo';
import {
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Crown,
  Sparkles,
  Zap,
  Mail,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../../app/contexts/AuthContext';
import apiClient from '../../../lib/api/client';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData, enterDemoMode } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Company Profile State
  const [orgName, setOrgName] = useState('');
  const [industryType, setIndustryType] = useState('Oil & Gas Refinery');
  const [plantLocation, setPlantLocation] = useState('Houston, Texas');
  const [scaleAssets, setScaleAssets] = useState('10 - 50 Industrial PLCs');

  // Step 2: Admin & Team Setup State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamInvites, setTeamInvites] = useState<{ email: string; role: string }[]>([
    { email: '', role: 'SCADA Operations Lead' },
  ]);

  // Step 3: Plan Selection State
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');

  const addTeamMember = () => {
    setTeamInvites([...teamInvites, { email: '', role: 'Predictive Maintenance Tech' }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamInvites(teamInvites.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1 && !orgName) {
      setError('Organization name is required');
      return;
    }
    if (step === 2) {
      if (!firstName || !lastName || !email || !password) {
        setError('All admin details are required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
    setError('');
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    localStorage.setItem('planttwin_user_email', email);
    localStorage.setItem('planttwin_registered_email', email);
    if (firstName || lastName) {
      localStorage.setItem('planttwin_user_name', `${firstName} ${lastName}`.trim());
    }

    try {
      const newOrg = {
        name: orgName,
        region: `${industryType} (${plantLocation})`,
        status: 'Optimal',
        email: email,
      };

      const existingOrgs = JSON.parse(localStorage.getItem('planttwin_registered_orgs') || '[]');
      localStorage.setItem('planttwin_registered_orgs', JSON.stringify([newOrg, ...existingOrgs]));
      localStorage.setItem('planttwin_selected_plant', orgName);
      window.dispatchEvent(new Event('planttwin:org-updated'));

      try {
        const response: any = await apiClient.post('/identity/register', {
          organization_name: orgName,
          organization_slug: orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          industry_type: industryType,
          admin_email: email,
          admin_password: password,
          admin_first_name: firstName,
          admin_last_name: lastName,
          plan: selectedPlan,
        });

        const payload = response?.data !== undefined ? response.data : response;
        const tokenObj = payload?.token || payload?.data?.token;

        if (tokenObj && tokenObj.access_token) {
          await setAuthData(tokenObj.access_token, tokenObj.refresh_token);
        } else {
          enterDemoMode('System Administrator');
        }
      } catch (backendErr) {
        enterDemoMode('System Administrator');
      }

      navigate('/operations');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B19] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Multi-Page Navigation Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <PlantTwinLogo size="md" showText={true} />
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-bold text-slate-300">
          <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors">Home</button>
          <button onClick={() => navigate('/demos')} className="hover:text-cyan-400 transition-colors">Role Demos</button>
          <button onClick={() => navigate('/register')} className="text-cyan-400 border-b-2 border-cyan-400 pb-1">Onboarding</button>
          <button onClick={() => navigate('/login')} className="hover:text-cyan-400 transition-colors">Auth Portal</button>
        </nav>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-bold text-slate-200 transition-all"
          >
            Log In
          </button>
        </div>
      </header>

      {/* Main Wizard Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          {/* Header & Step Indicator */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Page 3: Organization Onboarding Wizard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">Register PlantTwin AI Organization</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Set up your industrial plant profile, team seats, and subscription plan</p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 mb-8 relative">
            <div className={`p-3 rounded-2xl border text-center transition-all ${step >= 1 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              <div className="text-[10px] font-mono font-bold">STEP 1</div>
              <div className="text-xs font-extrabold mt-0.5">Company Profile</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center transition-all ${step >= 2 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              <div className="text-[10px] font-mono font-bold">STEP 2</div>
              <div className="text-xs font-extrabold mt-0.5">Team & Admin</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center transition-all ${step >= 3 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'}`}>
              <div className="text-[10px] font-mono font-bold">STEP 3</div>
              <div className="text-xs font-extrabold mt-0.5">Plan Selection</div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-6 text-center">
              {error}
            </div>
          )}

          {/* STEP 1: Company Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Organization / Plant Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Apex Refining Terminal"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Industry Sector</label>
                  <select
                    value={industryType}
                    onChange={(e) => setIndustryType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  >
                    <option value="Oil & Gas Refinery">Oil & Gas Refinery</option>
                    <option value="Chemical & Processing">Chemical & Processing</option>
                    <option value="Pharmaceutical Manufacturing">Pharmaceutical Manufacturing</option>
                    <option value="Power & Energy Plant">Power & Energy Plant</option>
                    <option value="Smart Agriculture & Processing">Smart Agriculture & Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Plant Location</label>
                  <input
                    type="text"
                    value={plantLocation}
                    onChange={(e) => setPlantLocation(e.target.value)}
                    placeholder="e.g. Rotterdam, Netherlands"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Operation Scale (PLC Asset Count)</label>
                <select
                  value={scaleAssets}
                  onChange={(e) => setScaleAssets(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                >
                  <option value="1 - 10 Industrial PLCs">1 - 10 Industrial PLCs (Pilot Plant)</option>
                  <option value="10 - 50 Industrial PLCs">10 - 50 Industrial PLCs (Medium Facility)</option>
                  <option value="50+ Enterprise PLCs">50+ Enterprise PLCs (Multi-Site Fleet)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Team & Admin Setup */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Alex"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Morgan"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Admin Business Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@apexrefinery.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Multi-Seat Team Invitations */}
              <div className="border-t border-slate-800 pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">Multi-Seat Team Invitations</span>
                  <button
                    onClick={addTeamMember}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Seat</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {teamInvites.map((invite, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="email"
                        placeholder="colleague@plant.com"
                        value={invite.email}
                        onChange={(e) => {
                          const updated = [...teamInvites];
                          updated[index].email = e.target.value;
                          setTeamInvites(updated);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-bold text-white focus:border-cyan-500 outline-none"
                      />
                      <select
                        value={invite.role}
                        onChange={(e) => {
                          const updated = [...teamInvites];
                          updated[index].role = e.target.value;
                          setTeamInvites(updated);
                        }}
                        className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-2 text-xs font-bold text-white outline-none"
                      >
                        <option value="SCADA Operations Lead">SCADA Lead</option>
                        <option value="Predictive Maintenance Tech">Maintenance Tech</option>
                        <option value="Automation & Control Engineer">Automation Eng</option>
                      </select>
                      {teamInvites.length > 1 && (
                        <button onClick={() => removeTeamMember(index)} className="p-2 text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Starter Plan */}
                <div
                  onClick={() => setSelectedPlan('starter')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === 'starter'
                      ? 'bg-slate-950 border-cyan-500/70 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-slate-400">PILOT PLANT</div>
                  <div className="text-lg font-black text-white mt-1">Starter</div>
                  <div className="text-xl font-black text-cyan-400 my-2">$499 <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                  <ul className="text-xs text-slate-400 space-y-1 font-mono">
                    <li>• Up to 10 PLCs</li>
                    <li>• 2 AI Agent Roles</li>
                    <li>• Standard SCADA</li>
                  </ul>
                </div>

                {/* Professional Plan */}
                <div
                  onClick={() => setSelectedPlan('pro')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                    selectedPlan === 'pro'
                      ? 'bg-slate-950 border-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[9px] font-mono font-black">POPULAR</span>
                  <div className="text-xs font-mono font-bold text-emerald-400">PRODUCTION FACILITY</div>
                  <div className="text-lg font-black text-white mt-1">Professional</div>
                  <div className="text-xl font-black text-emerald-400 my-2">$1,499 <span className="text-xs text-slate-400 font-normal">/mo</span></div>
                  <ul className="text-xs text-slate-400 space-y-1 font-mono">
                    <li>• Up to 50 PLCs</li>
                    <li>• All 5 AI Agent Roles</li>
                    <li>• RUL & XAI Included</li>
                  </ul>
                </div>

                {/* Enterprise Plan */}
                <div
                  onClick={() => setSelectedPlan('enterprise')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === 'enterprise'
                      ? 'bg-slate-950 border-purple-500/70 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-purple-400">MULTI-SITE FLEET</div>
                  <div className="text-lg font-black text-white mt-1">Enterprise</div>
                  <div className="text-xl font-black text-purple-400 my-2">Custom</div>
                  <ul className="text-xs text-slate-400 space-y-1 font-mono">
                    <li>• Unlimited PLCs</li>
                    <li>• Custom Model Training</li>
                    <li>• Dedicated On-Premises</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>14-Day Free Enterprise Trial • No Credit Card Required</span>
                </div>
                <span className="font-mono font-bold text-cyan-400">100% Guaranteed</span>
              </div>
            </div>
          )}

          {/* Stepper Navigation Controls */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6 mt-8">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 transition-all flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-xs hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center space-x-1.5"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 text-slate-950 font-black text-xs hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center space-x-2"
              >
                <span>{isLoading ? 'Creating Organization...' : 'Complete Onboarding & Launch Dashboard'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
