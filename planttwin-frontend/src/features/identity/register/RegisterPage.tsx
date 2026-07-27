import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Building2, UserCircle, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../../app/contexts/AuthContext';
import apiClient from '../../../lib/api/client';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthData, enterDemoMode } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [orgName, setOrgName] = useState('');
  const [industryType, setIndustryType] = useState('Refinery');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNext = () => {
    if (step === 1 && !orgName) {
      setError('Organization name is required');
      return;
    }
    if (step === 2) {
      if (!firstName || !lastName || !email || !password) {
        setError('All fields are required');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
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

    // Persist registered email & admin name in localStorage for top header profile display
    localStorage.setItem('planttwin_user_email', email);
    if (firstName || lastName) {
      localStorage.setItem('planttwin_user_name', `${firstName} ${lastName}`.trim());
    }

    // Register Organization locally & sync header dropdown
    try {
      const newOrg = {
        name: orgName,
        region: `${industryType} Facility`,
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
          organization_slug: generateSlug(orgName),
          industry_type: industryType,
          admin_email: email,
          admin_password: password,
          admin_first_name: firstName,
          admin_last_name: lastName,
        });

        if (response && response.data && response.data.token) {
          await setAuthData(response.data.token.access_token, response.data.token.refresh_token);
        } else {
          enterDemoMode('System Administrator');
        }
      } catch (err) {
        enterDemoMode('System Administrator');
      }

      navigate('/operations');
    } catch (err: any) {
      setError(err.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLengthOk = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 mx-auto flex items-center justify-center shadow-xl glow-emerald">
              <Activity className="w-6 h-6 text-white font-bold" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans">Register Organization</h1>
          <p className="text-xs text-[var(--text-secondary)] font-mono">Join PlantTwin AI Multi-Tenant Enterprise Platform</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center px-4 font-mono">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-600 text-white shadow-md' : 'bg-[var(--bg-card)] text-slate-500 border border-[var(--border-color)]'}`}>1</div>
            <span className="text-[10px] font-semibold mt-2 text-[var(--text-secondary)] uppercase">Organization</span>
          </div>
          <div className={`h-[2px] flex-1 ${step >= 2 ? 'bg-emerald-600' : 'bg-[var(--border-color)]'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-emerald-600 text-white shadow-md' : 'bg-[var(--bg-card)] text-slate-500 border border-[var(--border-color)]'}`}>2</div>
            <span className="text-[10px] font-semibold mt-2 text-[var(--text-secondary)] uppercase">System Admin</span>
          </div>
          <div className={`h-[2px] flex-1 ${step >= 3 ? 'bg-emerald-600' : 'bg-[var(--border-color)]'}`}></div>
          <div className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-emerald-600 text-white shadow-md' : 'bg-[var(--bg-card)] text-slate-500 border border-[var(--border-color)]'}`}>3</div>
            <span className="text-[10px] font-semibold mt-2 text-[var(--text-secondary)] uppercase">Provision</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="industrial-card p-6 border-[var(--border-color)] space-y-6 shadow-2xl bg-[var(--bg-card)] rounded-2xl">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-xs font-semibold font-mono">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 font-mono text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 mb-4">
                <Building2 className="w-5 h-5 shrink-0" />
                <h2 className="text-sm font-extrabold font-sans">Organization Details</h2>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., Apex Refinery"
                  className="input-nexus"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Industry Type</label>
                <select
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value)}
                  className="input-nexus"
                >
                  <option value="Refinery">Refinery</option>
                  <option value="Chemical Plant">Chemical Plant</option>
                  <option value="Power Plant">Power Plant</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
              <button
                onClick={handleNext}
                className="w-full btn-nexus-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 mt-4 shadow-lg"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 font-mono text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 mb-4">
                <UserCircle className="w-5 h-5 shrink-0" />
                <h2 className="text-sm font-extrabold font-sans">System Administrator Profile</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-nexus" placeholder="John" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-nexus" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Work Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-nexus" placeholder="admin@apex.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-nexus" placeholder="••••••••••••" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-nexus" placeholder="••••••••••••" />
                </div>
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

              <div className="flex space-x-3 mt-4">
                <button onClick={handleBack} className="btn-nexus-secondary w-1/3 text-xs font-bold">
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span>Back</span>
                </button>
                <button onClick={handleNext} className="w-2/3 btn-nexus-primary py-3 text-xs font-bold flex items-center justify-center space-x-2 shadow-lg">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 font-mono text-xs">
              <div className="flex items-center space-x-2 text-emerald-400 mb-4">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h2 className="text-sm font-extrabold font-sans">Confirm & Provision Organization</h2>
              </div>

              <div className="bg-[var(--bg-canvas)] border border-[var(--border-color)] p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                  <span className="text-xs text-[var(--text-secondary)]">Organization</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{orgName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                  <span className="text-xs text-[var(--text-secondary)]">Industry</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{industryType}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                  <span className="text-xs text-[var(--text-secondary)]">System Admin</span>
                  <span className="text-xs font-bold text-[var(--text-primary)]">{firstName} {lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--text-secondary)]">Email</span>
                  <span className="text-xs font-bold text-emerald-400">{email}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button onClick={handleBack} disabled={isLoading} className="btn-nexus-secondary w-1/3 text-xs font-bold">
                  <ArrowLeft className="w-4 h-4 shrink-0" />
                  <span>Back</span>
                </button>
                <button onClick={handleSubmit} disabled={isLoading} className="w-2/3 btn-nexus-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50">
                  {isLoading ? (
                    <span>Provisioning Organization...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Launch</span>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xs text-[var(--text-secondary)] font-sans">
            Already have an account? <Link to="/login" className="text-emerald-400 font-bold hover:underline font-mono">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
