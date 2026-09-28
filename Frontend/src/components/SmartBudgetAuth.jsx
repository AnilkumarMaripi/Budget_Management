import React, { useState } from 'react';
import WebGLFluidShader from './WebGLFluidShader';

export default function SmartBudgetAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Email validation regex check
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setNotification({ type: 'info', message: 'Authenticating with Vault...' });

    setTimeout(() => {
      setIsSubmitting(false);
      setNotification({ type: 'success', message: 'Signed in successfully! Welcome to Vault.' });
      setTimeout(() => setNotification(null), 3500);
    }, 1200);
  };

  const handleSocialSignIn = (provider) => {
    setNotification({ type: 'info', message: `Connecting to ${provider}...` });
    setTimeout(() => {
      setNotification({ type: 'success', message: `Authenticated via ${provider}!` });
      setTimeout(() => setNotification(null), 3000);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-surface text-on-surface pt-safe pb-safe selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Header Logo */}
      <div className="w-full flex flex-col items-center justify-center pt-space-xl pb-space-md">
        <div className="flex items-center gap-space-xs">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-[0_4px_16px_rgba(0,104,95,0.2)]">
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-semibold">
            <span className="text-primary">Smart</span>Budget
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col relative w-full px-gutter-mobile bg-surface max-w-md mx-auto">
        <div className="flex flex-col w-full relative pb-space-lg">
          
          {/* Dynamic Fluid Animated WebGL Shader Background */}
          <WebGLFluidShader />

          {/* Ambient Glow Blobs */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary-fixed-dim/20 rounded-full blur-3xl -z-10 pointer-events-none" />
          <div className="absolute top-96 -right-12 w-48 h-48 bg-secondary-container/40 rounded-full blur-2xl -z-10 pointer-events-none" />

          {/* Header / Floating Logo Showcase */}
          <div className="flex flex-col items-center text-center mt-space-sm mb-space-md">
            <div className="relative group">
              {/* Subtle Ambient Glow Ring */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary to-tertiary-fixed rounded-2xl opacity-30 blur-md group-hover:opacity-50 transition-opacity duration-500" />

              {/* Brand Logo Card with Subtle Floating Lift */}
              <div className="relative w-20 h-20 rounded-2xl bg-surface-container-lowest p-2 shadow-xl shadow-primary/10 flex items-center justify-center animate-floating">
                <img
                  alt="Smart Budget Planner"
                  className="w-full h-full object-contain rounded-xl drop-shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv1FFCFcDDVMvv2_R5dBLTCNdT-ffJZynNEP9ON-o7bCYVb4qhx5qVfgEQcvCmjICTtxE9-XgWhL6aoiqDdJNrBaTQbHM7ocjyNNaXI-sveh30pbuKaLVhTHr_J-P5bb0a-NM5DtGG6w2P7i9KXJuKPmQ29tyASij3yAdZnigAg3nY2R4dftndCdlzwNMlAGvlbqMxKBN8e7rpN--nqeBrRk5PzTLzRdrYjQrgxbZaLdE5eMQK9D_h0IOIjIM71j5vBQ"
                />
              </div>
            </div>

            <div className="mt-space-sm flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high/70 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider mb-1 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Smart Wealth 2.0
              </span>
              <h1 className="font-headline-md text-headline-md text-on-surface font-semibold tracking-tight">
                Smart Budget Planner
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Master your money, effortlessly
              </p>
            </div>
          </div>

          {/* Feedback Toast Notification */}
          {notification && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md animate-fadeIn ${
              notification.type === 'success' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-primary-container text-on-primary-container'
            }`}>
              <span className="material-symbols-outlined text-[18px]">
                {notification.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span>{notification.message}</span>
            </div>
          )}

          {/* Authentication Main Card */}
          <div className="w-full bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-space-md shadow-xl shadow-surface-dim/40 relative">
            
            {/* Form Elements */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm" id="loginForm">
              
              {/* Email Input Field */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant flex items-center justify-between" htmlFor="email">
                  <span>Email Address</span>
                  {isValidEmail && (
                    <span className="text-tertiary font-body-sm text-[11px] font-medium" id="validEmailIndicator">
                      Valid
                    </span>
                  )}
                </label>

                <div className="relative flex items-center group">
                  <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none transition-colors group-focus-within:text-primary">
                    mail
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.morgan@domain.com"
                    className="w-full pl-11 pr-4 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:shadow-[0_0_0_2px_#00685f]"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">
                  Password
                </label>

                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                    lock
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md rounded-lg outline-none transition-all duration-200 placeholder:text-on-surface-variant/50 focus:shadow-[0_0_0_2px_#00685f]"
                  />
                  <button
                    id="togglePassword"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 text-on-surface-variant hover:text-on-surface focus:outline-none p-1 rounded-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px] flex items-center justify-center">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Options Row: Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <div className="relative flex items-center justify-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded bg-surface-container-high peer-checked:bg-primary transition-colors flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-on-primary text-[15px] opacity-0 peer-checked:opacity-100 transition-opacity font-bold">
                        check
                      </span>
                    </div>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    Remember me
                  </span>
                </label>

                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setNotification({ type: 'info', message: 'Password reset link sent to your email.' });
                    setTimeout(() => setNotification(null), 3000);
                  }}
                  className="font-body-sm text-body-sm text-primary hover:text-primary-container font-semibold transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              {/* Primary Sign In Action Button */}
              <button
                id="submitBtn"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 bg-primary text-on-primary font-headline-sm text-body-md font-semibold rounded-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In to Vault'}</span>
                <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>

            </form>

            {/* Divider */}
            <div className="relative my-space-md flex items-center justify-center">
              <div className="w-full h-px bg-surface-container-high" />
              <span className="absolute px-3 bg-surface-container-lowest text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                or continue with
              </span>
            </div>

            {/* Social Authentication Providers */}
            <div className="grid grid-cols-2 gap-space-sm">
              {/* Google Sign In */}
              <button
                type="button"
                onClick={() => handleSocialSignIn('Google')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high/60 text-on-surface font-body-sm text-body-sm font-medium transition-all active:scale-95 shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z" fill="#4285F4" />
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" fill="#34A853" />
                  <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              {/* Phone Sign In */}
              <button
                type="button"
                onClick={() => handleSocialSignIn('Phone OTP')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high/60 text-on-surface font-body-sm text-body-sm font-medium transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">smartphone</span>
                <span>Phone</span>
              </button>
            </div>

          </div>

          {/* Sign Up Prompt Footer */}
          <div className="mt-space-md text-center flex flex-col items-center gap-2">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?
              <a
                href="#signup"
                onClick={(e) => {
                  e.preventDefault();
                  setNotification({ type: 'info', message: 'Navigating to Sign Up screen...' });
                  setTimeout(() => setNotification(null), 2500);
                }}
                className="text-primary font-semibold hover:underline ml-1"
              >
                Create one now
              </a>
            </p>

            {/* Trust / Security Micro-badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high/50 text-on-surface-variant font-label-numeric text-[11px] backdrop-blur-sm">
              <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
              <span>256-Bit Bank-Grade Encryption</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
