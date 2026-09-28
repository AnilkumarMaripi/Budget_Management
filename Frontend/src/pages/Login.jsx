import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WebGLFluidShader from '../components/WebGLFluidShader';
import { loginUser, registerUser, isValidEmail, getSession } from '../lib/auth';
import { SUPPORTED_CURRENCIES, detectAutoCurrency, fetchGeoIPCurrency, saveUserCurrency, formatMoney } from '../lib/currency';


export default function Login({ defaultTab = 'signin' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab State: 'signin' or 'new_account'
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/signup' ? 'new_account' : defaultTab
  );

  // Sync tab with route if location changes
  useEffect(() => {
    if (location.pathname === '/signup') {
      setActiveTab('new_account');
    } else if (location.pathname === '/') {
      setActiveTab('signin');
    }
  }, [location.pathname]);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(SUPPORTED_CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // Auto-detect Currency by Location on Mount
  useEffect(() => {
    async function initCurrency() {
      const autoCurr = await detectAutoCurrency();
      setSelectedCurrency(autoCurr);

      // Async IP Refinement
      const geoCurr = await fetchGeoIPCurrency();
      if (geoCurr) {
        setSelectedCurrency(geoCurr);
      }
    }
    initCurrency();
  }, []);

  const handleCurrencyChange = (curr) => {
    setSelectedCurrency(curr);
    saveUserCurrency(curr.code);
    setIsCurrencyOpen(false);
  };


  // Check active session on mount
  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.onboardingComplete) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [navigate]);

  // Dark mode handler
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const triggerErrorShake = (msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Switch Tab Handler
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess(false);
  };

  // Realtime Password Strength Logic (For New Account)
  const hasLen = password.length >= 8;
  const hasNum = /\d/.test(password);
  const hasSym = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strengthScore = 0;
  if (password.length > 0) strengthScore++;
  if (hasLen && (hasNum || hasSym)) strengthScore++;
  if (hasLen && hasNum && hasSym) strengthScore++;

  const getStrengthLabel = () => {
    if (password.length === 0) return { text: 'Weak', class: 'text-[#3d4947] dark:text-gray-400' };
    if (strengthScore === 1) return { text: 'Weak', class: 'text-[#ba1a1a] font-semibold' };
    if (strengthScore === 2) return { text: 'Fair', class: 'text-[#008378] dark:text-[#6bd8cb] font-semibold' };
    return { text: 'Strong', class: 'text-[#00685f] dark:text-[#6ffbbe] font-bold' };
  };

  const strengthInfo = getStrengthLabel();

  // Login Submit Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      triggerErrorShake('Enter a valid email');
      return;
    }

    if (!password) {
      triggerErrorShake('Password is required');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = loginUser(email, password, rememberMe);
      setLoading(false);

      if (result.success) {
        if (result.user.onboardingComplete === false) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      } else {
        triggerErrorShake(result.error || 'Authentication failed');
      }
    }, 600);
  };

  // Sign Up Submit Handler
  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      triggerErrorShake('Enter a valid work or personal email address');
      return;
    }

    if (!password || password.length < 6) {
      triggerErrorShake('Password must be at least 6 characters');
      return;
    }

    if (!termsAccepted) {
      triggerErrorShake('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = registerUser(email, password, name);
      
      if (res.success) {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          navigate('/onboarding');
        }, 1000);
      } else {
        setLoading(false);
        triggerErrorShake(res.error || 'Failed to create account');
      }
    }, 1000);
  };

  const handleSocialAuth = (provider) => {
    setLoading(true);
    setTimeout(() => {
      const demoEmail = `${provider.toLowerCase()}_user_${Date.now().toString().slice(-4)}@domain.com`;
      let result;
      if (activeTab === 'signin') {
        result = loginUser(demoEmail, 'password123', rememberMe);
      } else {
        result = registerUser(demoEmail, 'password123', `${provider} User`);
      }
      setLoading(false);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        triggerErrorShake(result.error || 'Authentication failed');
      }
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f7f9fb] dark:bg-[#121517] text-[#191c1e] dark:text-white flex flex-col justify-between selection:bg-[#89f5e7] selection:text-[#00201d] overflow-x-hidden font-sans">
      
      {/* WebGL Fluid Background */}
      <WebGLFluidShader />

      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-[#89f5e7]/25 blur-[140px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-[#dae2fd]/35 blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] rounded-full bg-[#6ffbbe]/15 blur-[130px]"></div>
      </div>

      <main className="relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-4 lg:py-6">
        <div className="flex flex-col w-full max-w-[1480px] mx-auto">
          
          {/* Top Navigation Header */}
          <header className="flex items-center justify-between pb-4 sm:pb-6 px-2 sm:px-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleTabSwitch('signin')}>
              <div className="w-10 h-10 rounded-xl bg-[#00685f] text-white flex items-center justify-center shadow-md shadow-[#00685f]/20 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M5 9.2h3V19H5V9.2zm6-4h3V19h-3V5.2zm6 8h3V19h-3v-5.8zM19 4l-4.5 4.5h3.2v2h2.6V4h-1.3zM4 21h16v1.5H4V21z"></path>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl sm:text-2xl text-[#191c1e] dark:text-white tracking-tight">Smart Budget Planner</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] font-bold text-[0.65rem] tracking-wider uppercase">PRO 2.0</span>
                </div>
                <p className="text-xs text-[#565e74] dark:text-gray-400 -mt-0.5">Autonomous Wealth Orchestration</p>
              </div>
            </div>

            {/* Right Header Status Badges & Dark Mode Toggle */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e2326] shadow-xs border border-gray-100 dark:border-gray-800">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006947] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#006947]"></span>
                  </span>
                  <span className="font-mono text-xs text-[#565e74] dark:text-gray-300 font-medium">99.98% Cloud Uptime</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#565e74] dark:text-gray-300 font-mono text-xs">
                  <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[18px]">lock</span>
                  <span>SOC-2 Type II Certified</span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-xs font-semibold text-[#3d4947] dark:text-gray-200 shadow-sm hover:scale-105 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {darkMode ? 'light_mode' : 'dark_mode'}
                </span>
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </button>

              {/* Automatic Location-Based Currency Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCurrencyOpen(prev => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1e2326] backdrop-blur-md border border-gray-200 dark:border-gray-700 text-xs font-bold text-[#00685f] dark:text-[#6bd8cb] shadow-sm hover:scale-105 transition-all cursor-pointer"
                >
                  <span className="text-sm">{selectedCurrency.flag}</span>
                  <span>{selectedCurrency.code} ({selectedCurrency.symbol})</span>
                  <span className="material-symbols-outlined text-[14px]">expand_more</span>
                </button>

                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2326] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-fadeIn max-h-60 overflow-y-auto">
                    <div className="px-3 py-1 text-[0.65rem] font-bold text-[#565e74] dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                      Auto-Detected & World Currencies
                    </div>
                    {SUPPORTED_CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCurrencyChange(c)}
                        className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#f2f4f6] dark:hover:bg-[#262b2f] transition-colors ${
                          selectedCurrency.code === c.code ? 'text-[#00685f] dark:text-[#6bd8cb] font-bold bg-[#f4fffc] dark:bg-[#005049]/30' : 'text-[#191c1e] dark:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </span>
                        <span className="font-mono text-[11px] font-bold text-gray-400">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Asymmetric Dual-Column Split Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Product Value & Interactive Highlights (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-4 lg:space-y-5">
              
              {/* Welcome Pill Tagline */}
              <div className="inline-flex items-center gap-2.5 self-start px-4 py-1.5 rounded-full bg-[#89f5e7]/40 dark:bg-[#005049]/40 text-[#00201d] dark:text-[#89f5e7] shadow-xs backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-[#00685f] dark:bg-[#6bd8cb]"></span>
                <span className="font-bold text-xs tracking-wider uppercase">Welcome to Smart Wealth 2.0</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191c1e] dark:text-white tracking-tight leading-[1.15]">
                  Master your financial future with <span className="text-[#00685f] dark:text-[#6bd8cb] italic font-serif">intelligent clarity.</span>
                </h1>
                <p className="text-sm sm:text-base text-[#565e74] dark:text-gray-300 max-w-2xl leading-relaxed">
                  Smart Budget Planner automates expense categorization, forecasts dynamic cash flow, and proactively defends your savings milestones in real-time.
                </p>
              </div>

              {/* Metric Highlight Strip (Bento Card) */}
              <div className="bg-white/90 dark:bg-[#1e2326]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-md border border-white/50 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#89f5e7]/20 blur-3xl pointer-events-none"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider text-[#565e74] dark:text-gray-400 block">Total Capital Supervised ({selectedCurrency.code})</span>
                    <div className="flex items-baseline gap-2.5 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] dark:text-white tracking-tight font-mono">{formatMoney(42850290, selectedCurrency)}</span>
                      <span className="font-mono text-xs font-bold text-[#006947] dark:text-[#6ffbbe] bg-[#6ffbbe]/30 dark:bg-[#006947]/40 px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>+24.8%
                      </span>
                    </div>
                    <p className="text-xs text-[#565e74] dark:text-gray-400 mt-1">Across 12,400+ active personal & household portfolios</p>
                  </div>

                  {/* Rating Strip */}
                  <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-700 sm:pl-6 flex flex-col justify-center">
                    <div className="flex items-center gap-1 text-[#00685f] dark:text-[#6bd8cb]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                      <span className="font-mono font-bold text-sm text-[#191c1e] dark:text-white ml-1.5">4.96/5</span>
                    </div>
                    <span className="text-xs text-[#565e74] dark:text-gray-400 mt-1">From 2,800+ audited member reviews</span>
                  </div>
                </div>

                {/* Trajectory Sparkline Graph */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00685f] animate-pulse"></span>
                    <span className="font-mono text-xs text-[#565e74] dark:text-gray-400">Real-Time Autonomous Rebalancing Engine</span>
                  </div>
                  <svg className="h-6 w-36 text-[#00685f] dark:text-[#6bd8cb] stroke-current fill-none stroke-[2]" viewBox="0 0 144 24">
                    <path d="M0,18 L24,14 L48,16 L72,9 L96,11 L120,4 L144,2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
              </div>

              {/* Feature Spotlight Interactive Stack */}
              <div className="space-y-3">
                {/* Feature 1 */}
                <div className="group bg-white/80 dark:bg-[#1e2326]/80 hover:bg-white dark:hover:bg-[#252a2e] p-4 sm:p-4.5 rounded-2xl transition-all duration-200 shadow-xs border border-white/50 dark:border-gray-800 flex items-center gap-4 cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-[#89f5e7]/40 dark:bg-[#005049]/50 text-[#00685f] dark:text-[#6bd8cb] flex items-center justify-center shrink-0 group-hover:bg-[#00685f] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[22px]">receipt_long</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-[#191c1e] dark:text-white tracking-tight">Instant Expense Sync & AI Receipt Parser</h3>
                      <span className="font-bold text-[0.65rem] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[#565e74] dark:text-gray-300 uppercase">99.4% Accuracy</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#565e74] dark:text-gray-400 mt-0.5">Connect bank accounts securely or drop receipts. Transactions map automatically to tax buckets.</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group bg-white/80 dark:bg-[#1e2326]/80 hover:bg-white dark:hover:bg-[#252a2e] p-4 sm:p-4.5 rounded-2xl transition-all duration-200 shadow-xs border border-white/50 dark:border-gray-800 flex items-center gap-4 cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-[#6ffbbe]/40 dark:bg-[#006947]/50 text-[#006947] dark:text-[#6ffbbe] flex items-center justify-center shrink-0 group-hover:bg-[#006947] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[22px]">query_stats</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-[#191c1e] dark:text-white tracking-tight">Live Cash Flow & Dynamic Trajectory Charts</h3>
                      <span className="font-bold text-[0.65rem] px-2 py-0.5 rounded-md bg-[#6ffbbe]/30 text-[#005236] dark:text-[#6ffbbe] uppercase">Predictive AI</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#565e74] dark:text-gray-400 mt-0.5">See spending categorized into Needs, Wants, and Wealth Investments with a 90-day predictive run-rate.</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group bg-white/80 dark:bg-[#1e2326]/80 hover:bg-white dark:hover:bg-[#252a2e] p-4 sm:p-4.5 rounded-2xl transition-all duration-200 shadow-xs border border-white/50 dark:border-gray-800 flex items-center gap-4 cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-[#dae2fd]/50 dark:bg-[#3f465c]/50 text-[#565e74] dark:text-[#bec6e0] flex items-center justify-center shrink-0 group-hover:bg-[#565e74] group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[22px]">notification_important</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-[#191c1e] dark:text-white tracking-tight">Proactive Guardrails & Overspend Mitigation</h3>
                      <span className="font-bold text-[0.65rem] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[#565e74] dark:text-gray-300 uppercase">Zero-Latency</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#565e74] dark:text-gray-400 mt-0.5">Algorithmic thresholds send preemptive gentle nudges before subscription renewals or budget leaks take toll.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Dynamic Auth Card */}
            <div className="lg:col-span-5 w-full">
              <div className={`bg-white/95 dark:bg-[#1e2326]/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl border border-white/60 dark:border-gray-800 relative transition-transform duration-200 ${
                shake ? 'animate-shake' : ''
              }`}>
                
                {/* Dynamic Interactive Toggle Tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#f2f4f6] dark:bg-[#262b2f] rounded-xl mb-3.5">
                  <button
                    type="button"
                    onClick={() => handleTabSwitch('new_account')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${
                      activeTab === 'new_account'
                        ? 'bg-white dark:bg-[#1e2326] text-[#191c1e] dark:text-white shadow-sm'
                        : 'text-[#565e74] dark:text-gray-400 hover:text-[#191c1e] dark:hover:text-white'
                    }`}
                  >
                    {activeTab === 'new_account' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] dark:bg-[#6bd8cb]"></span>
                    )}
                    New Account
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabSwitch('signin')}
                    className={`py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${
                      activeTab === 'signin'
                        ? 'bg-white dark:bg-[#1e2326] text-[#191c1e] dark:text-white shadow-sm'
                        : 'text-[#565e74] dark:text-gray-400 hover:text-[#191c1e] dark:hover:text-white'
                    }`}
                  >
                    {activeTab === 'signin' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] dark:bg-[#6bd8cb]"></span>
                    )}
                    Sign In Vault
                  </button>
                </div>

                {/* Card Title & Subtitle */}
                <div className="mb-3.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                    {activeTab === 'signin'
                      ? 'Access your financial command center'
                      : 'Create your financial command center'}
                  </h2>
                  <p className="text-xs text-[#565e74] dark:text-gray-400 mt-0.5">
                    {activeTab === 'signin'
                      ? 'Sign in to your vault to manage budget, transactions & alerts.'
                      : 'Get 30 days full premium access. No credit card required.'}
                  </p>
                </div>

                {/* DYNAMIC FORM VIEW */}
                {activeTab === 'signin' ? (
                  /* --- SIGN IN VAULT FORM (EMAIL & PASSWORD FIRST) --- */
                  <form onSubmit={handleLoginSubmit} className="space-y-3 animate-fadeIn">
                    {/* EMAIL ADDRESS FIELD */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="signin-email" className="block font-bold text-xs uppercase text-[#565e74] dark:text-gray-300 tracking-wider">
                          Email Address
                        </label>
                        {email && (
                          <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1 ${
                            isValidEmail(email) ? 'text-[#00685f] dark:text-[#6ffbbe]' : 'text-[#ba1a1a]'
                          }`}>
                            {isValidEmail(email) ? 'Valid Email' : 'Invalid format'}
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[#565e74] dark:text-gray-400 text-[18px] pointer-events-none">
                          mail
                        </span>
                        <input
                          id="signin-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="alex.morgan@domain.com"
                          className="w-full h-10 sm:h-11 pl-9 pr-9 py-2 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white text-xs sm:text-sm outline-none focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 focus:ring-[#00685f] transition-all placeholder:text-[#565e74]/50 dark:placeholder:text-gray-500"
                        />
                        {isValidEmail(email) && (
                          <span className="material-symbols-outlined absolute right-3 text-[#00685f] dark:text-[#6ffbbe] text-[18px] pointer-events-none">
                            check_circle
                          </span>
                        )}
                      </div>
                    </div>

                    {/* MASTER PASSWORD FIELD */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="signin-password" className="block font-bold text-xs uppercase text-[#565e74] dark:text-gray-300 tracking-wider">
                          Password
                        </label>
                        <a
                          href="#forgot"
                          onClick={(e) => {
                            e.preventDefault();
                            alert('Password reset link sent to your email address.');
                          }}
                          className="text-xs text-[#00685f] dark:text-[#6bd8cb] hover:underline font-bold"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[#565e74] dark:text-gray-400 text-[18px] pointer-events-none">
                          lock
                        </span>
                        <input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError('');
                          }}
                          placeholder="••••••••••••"
                          className="w-full h-10 sm:h-11 pl-9 pr-9 py-2 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white font-mono text-xs sm:text-sm outline-none focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 focus:ring-[#00685f] transition-all placeholder:text-[#565e74]/50 dark:placeholder:text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-2.5 text-[#565e74] dark:text-gray-400 hover:text-[#191c1e] dark:hover:text-white p-0.5 focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Remember session checkbox */}
                    <div className="pt-0.5 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer select-none group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="w-4 h-4 rounded bg-[#e6e8ea] dark:bg-gray-700 peer-checked:bg-[#00685f] transition-colors flex items-center justify-center shadow-inner">
                            <span className="material-symbols-outlined text-white text-[13px] opacity-0 peer-checked:opacity-100 transition-opacity font-bold">
                              check
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-[#565e74] dark:text-gray-300 group-hover:text-[#191c1e] dark:group-hover:text-white transition-colors">
                          Remember session
                        </span>
                      </label>
                    </div>

                    {/* Inline Error Message */}
                    {error && (
                      <div className="p-2 rounded-xl bg-[#ffdad6] dark:bg-[#93000a]/40 text-[#93000a] dark:text-red-200 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Sign In CTA Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-1.5 h-10 sm:h-11 px-4 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#00685f]/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <span>Signing in...</span>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Vault</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>

                    {/* SSO DIVIDER + SSO PROVIDERS */}
                    <div className="relative my-3 pt-0.5 flex items-center justify-center">
                      <div className="w-full h-px bg-[#e6e8ea] dark:bg-gray-700"></div>
                      <span className="absolute bg-white dark:bg-[#1e2326] px-2.5 font-bold text-[0.65rem] text-[#565e74] dark:text-gray-400 tracking-widest uppercase">
                        Or sign in with SSO
                      </span>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Google')}
                        className="w-full flex items-center justify-center gap-2.5 h-10 sm:h-11 px-3 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] transition-all text-[#191c1e] dark:text-white font-bold text-xs shadow-xs active:scale-[0.98]"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                        </svg>
                        Continue with Google
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('Passkey')}
                          className="flex items-center justify-center gap-1.5 h-10 sm:h-11 px-2.5 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] transition-all text-[#191c1e] dark:text-white font-bold text-xs active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#00685f] dark:text-[#6bd8cb]">fingerprint</span>
                          Passkey / Face ID
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('Apple')}
                          className="flex items-center justify-center gap-1.5 h-10 sm:h-11 px-2.5 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] transition-all text-[#191c1e] dark:text-white font-bold text-xs active:scale-[0.98]"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.77-.95 2.83 1.04.08 2.1-.53 2.72-1.27z"></path>
                          </svg>
                          Apple ID
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* --- NEW ACCOUNT FORM --- */
                  <form onSubmit={handleSignUpSubmit} className="space-y-3 animate-fadeIn">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullname" className="block font-bold text-xs uppercase text-[#565e74] dark:text-gray-300 tracking-wider mb-1">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[#565e74] dark:text-gray-400 text-[18px] pointer-events-none">
                          person
                        </span>
                        <input
                          id="fullname"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full h-10 sm:h-11 pl-9 pr-3 py-2 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white text-xs sm:text-sm outline-none focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 focus:ring-[#00685f] transition-all placeholder:text-[#565e74]/50 dark:placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Work or Personal Email */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="signup-email" className="block font-bold text-xs uppercase text-[#565e74] dark:text-gray-300 tracking-wider">
                          Email Address
                        </label>
                        {email && (
                          <span className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1 ${
                            isValidEmail(email) ? 'text-[#00685f] dark:text-[#6ffbbe]' : 'text-[#ba1a1a]'
                          }`}>
                            {isValidEmail(email) ? 'Valid Email' : 'Invalid format'}
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[#565e74] dark:text-gray-400 text-[18px] pointer-events-none">
                          mail
                        </span>
                        <input
                          id="signup-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alex@domain.com"
                          className="w-full h-10 sm:h-11 pl-9 pr-9 py-2 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white text-xs sm:text-sm outline-none focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 focus:ring-[#00685f] transition-all placeholder:text-[#565e74]/50 dark:placeholder:text-gray-500"
                        />
                        {isValidEmail(email) && (
                          <span className="material-symbols-outlined absolute right-3 text-[#00685f] dark:text-[#6ffbbe] text-[18px] pointer-events-none">
                            check_circle
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Create Master Password */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="signup-password" className="block font-bold text-xs uppercase text-[#565e74] dark:text-gray-300 tracking-wider">
                          Create Password
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[0.65rem] uppercase tracking-wider text-[#565e74] dark:text-gray-400">Security:</span>
                          <span className={`font-mono text-xs ${strengthInfo.class}`}>{strengthInfo.text}</span>
                        </div>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-[#565e74] dark:text-gray-400 text-[18px] pointer-events-none">
                          lock
                        </span>
                        <input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-10 sm:h-11 pl-9 pr-9 py-2 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white font-mono text-xs sm:text-sm outline-none focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 focus:ring-[#00685f] transition-all placeholder:text-[#565e74]/50 dark:placeholder:text-gray-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute right-2.5 text-[#565e74] dark:text-gray-400 hover:text-[#191c1e] dark:hover:text-white p-0.5 focus:outline-none"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>

                      {/* Password Strength Bars */}
                      <div className="grid grid-cols-3 gap-1 mt-1.5 h-1">
                        <div className={`h-full rounded-full transition-colors duration-300 ${
                          password.length === 0 ? 'bg-[#e0e3e5] dark:bg-gray-700' : strengthScore >= 1 ? (strengthScore === 1 ? 'bg-[#ba1a1a]' : 'bg-[#00685f]') : 'bg-[#e0e3e5] dark:bg-gray-700'
                        }`}></div>
                        <div className={`h-full rounded-full transition-colors duration-300 ${
                          strengthScore >= 2 ? 'bg-[#00685f]' : 'bg-[#e0e3e5] dark:bg-gray-700'
                        }`}></div>
                        <div className={`h-full rounded-full transition-colors duration-300 ${
                          strengthScore >= 3 ? 'bg-[#00685f]' : 'bg-[#e0e3e5] dark:bg-gray-700'
                        }`}></div>
                      </div>

                      {/* Checklist Requirements */}
                      <div className="flex items-center justify-between mt-1 px-0.5">
                        <div className={`flex items-center gap-1 font-bold text-[0.65rem] uppercase tracking-wider transition-colors ${
                          hasLen ? 'text-[#00685f] dark:text-[#6ffbbe]' : 'text-[#565e74] dark:text-gray-400'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {hasLen ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>8+ chars</span>
                        </div>

                        <div className={`flex items-center gap-1 font-bold text-[0.65rem] uppercase tracking-wider transition-colors ${
                          hasNum ? 'text-[#00685f] dark:text-[#6ffbbe]' : 'text-[#565e74] dark:text-gray-400'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {hasNum ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>1 number</span>
                        </div>

                        <div className={`flex items-center gap-1 font-bold text-[0.65rem] uppercase tracking-wider transition-colors ${
                          hasSym ? 'text-[#00685f] dark:text-[#6ffbbe]' : 'text-[#565e74] dark:text-gray-400'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {hasSym ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>1 symbol</span>
                        </div>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-0.5 flex items-start gap-2">
                      <input
                        id="terms"
                        type="checkbox"
                        required
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded text-[#00685f] focus:ring-[#00685f] border-gray-300"
                      />
                      <label htmlFor="terms" className="text-xs text-[#565e74] dark:text-gray-300 leading-snug cursor-pointer select-none">
                        I agree to the <a className="text-[#00685f] dark:text-[#6bd8cb] hover:underline font-bold" href="#terms" onClick={e => e.preventDefault()}>Terms</a>, <a className="text-[#00685f] dark:text-[#6bd8cb] hover:underline font-bold" href="#privacy" onClick={e => e.preventDefault()}>Privacy</a>, & data sync.
                      </label>
                    </div>

                    {/* Inline Error */}
                    {error && (
                      <div className="p-2 rounded-xl bg-[#ffdad6] dark:bg-[#93000a]/40 text-[#93000a] dark:text-red-200 text-xs font-semibold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Submit CTA Button */}
                    <button
                      type="submit"
                      disabled={loading || success}
                      className={`w-full mt-1.5 h-10 sm:h-11 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        success
                          ? 'bg-[#006947] text-white shadow-[#006947]/30'
                          : 'bg-[#00685f] hover:bg-[#005049] text-white shadow-[#00685f]/25 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                    >
                      {loading ? (
                        <>
                          <span>Creating Account...</span>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        </>
                      ) : success ? (
                        <>
                          <span>Welcome Aboard!</span>
                          <span className="material-symbols-outlined text-[18px]">check</span>
                        </>
                      ) : (
                        <>
                          <span>Create Your Free Account</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>

                    {/* SSO DIVIDER + PROVIDERS */}
                    <div className="relative my-3 pt-0.5 flex items-center justify-center">
                      <div className="w-full h-px bg-[#e6e8ea] dark:bg-gray-700"></div>
                      <span className="absolute bg-white dark:bg-[#1e2326] px-2.5 font-bold text-[0.65rem] text-[#565e74] dark:text-gray-400 tracking-widest uppercase">
                        Or register with SSO
                      </span>
                    </div>

                    <div className="space-y-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleSocialAuth('Google')}
                        className="w-full flex items-center justify-center gap-2.5 h-10 sm:h-11 px-3 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] transition-all text-[#191c1e] dark:text-white font-bold text-xs shadow-xs active:scale-[0.98]"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                        </svg>
                        Continue with Google
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('Passkey')}
                          className="flex items-center justify-center gap-1.5 h-10 sm:h-11 px-2.5 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] transition-all text-[#191c1e] dark:text-white font-bold text-xs active:scale-[0.98]"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#00685f] dark:text-[#6bd8cb]">fingerprint</span>
                          Passkey / Face ID
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSocialAuth('Apple')}
                          className="flex items-center justify-center gap-1.5 h-10 sm:h-11 px-2.5 rounded-xl bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] transition-all text-[#191c1e] dark:text-white font-bold text-xs active:scale-[0.98]"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.87.96-2.96-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.77-.95 2.83 1.04.08 2.1-.53 2.72-1.27z"></path>
                          </svg>
                          Apple ID
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Compact Footer Security Badge */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 text-[#565e74] dark:text-gray-400 font-bold text-[0.65rem] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[14px]">verified</span>
                    Bank-grade 256-Bit AES Encryption
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-2 text-xs text-[#565e74] dark:text-gray-500 font-medium z-10">
        © 2026 Smart Budget Planner. All rights reserved.
      </footer>
    </div>
  );
}
