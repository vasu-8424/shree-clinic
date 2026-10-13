import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMinutes, setLockMinutes] = useState(15);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to /admin
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    setIsSubmitting(false);

    if (result.success) {
      const from = (location.state as any)?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed.');
      if (result.locked) {
        setIsLocked(true);
        if (result.minutesRemaining) setLockMinutes(result.minutesRemaining);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ec] flex flex-col justify-center items-center p-4 sm:p-6 select-none">
      {/* Background Subtle Ambient Glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#d9ae4a]/10 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#6c9f36]/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#123f48]/15 overflow-hidden relative z-10">
        {/* Brand Header */}
        <div className="bg-[#0b3037] p-8 text-center text-white relative">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 mx-auto mb-4 flex items-center justify-center shadow-md">
            <img
              src="/shree-logo-transparent.png"
              alt="SHREE Clinic"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#d9ae4a] block mb-1">
            CLINICAL DIRECTOR & ADMIN PORTAL
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f7f4ec]">
            Patient Management System
          </h1>
          <p className="text-xs text-[#f7f4ec]/70 mt-1">
            Freedom Hospitals · Mokila · Hyderabad
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {/* Lockout Banner */}
          {isLocked && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold uppercase tracking-wider">
                  Security Lockout Active
                </strong>
                <p className="text-xs mt-0.5 leading-relaxed">
                  Account temporarily locked for <strong>{lockMinutes} minutes</strong> due to 5 consecutive failed attempts.
                </p>
              </div>
            </div>
          )}

          {/* Standard Error Banner */}
          {errorMessage && !isLocked && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5">
              <span className="text-sm">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5 font-mono">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  disabled={isLocked || isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@shreeclinic.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0b3037] focus:ring-2 focus:ring-[#0b3037]/10 disabled:bg-neutral-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5 font-mono">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked || isSubmitting}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0b3037] focus:ring-2 focus:ring-[#0b3037]/10 disabled:bg-neutral-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#0b3037] hover:bg-[#123f48] text-[#f7f4ec] font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#d9ae4a]" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-[11px] text-neutral-500 font-mono">
            <span>Encrypted at rest · India DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </div>

      {/* Return to Public Website */}
      <a
        href="/"
        className="mt-6 text-xs font-bold text-neutral-600 hover:text-black transition-colors"
      >
        ← Back to Public Website
      </a>
    </div>
  );
};
