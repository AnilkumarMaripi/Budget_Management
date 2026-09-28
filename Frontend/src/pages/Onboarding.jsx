import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getUsers, saveUsers, saveSession } from '../lib/auth';
import { SUPPORTED_CURRENCIES, detectAutoCurrency, saveUserCurrency } from '../lib/currency';

export default function Onboarding() {
  const navigate = useNavigate();
  const session = getSession();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // 5 Questions State
  const [goal, setGoal] = useState('Save Money');
  const [currency, setCurrency] = useState(SUPPORTED_CURRENCIES[0]);
  const [savingsRate, setSavingsRate] = useState('20% of Income (Standard)');
  const [trackingMethod, setTrackingMethod] = useState('Automated Bank Sync');
  const [budgetStrategy, setBudgetStrategy] = useState('50/30/20 Rule');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    async function initCurr() {
      const detected = await detectAutoCurrency();
      if (detected) {
        setCurrency(detected);
      }
    }
    initCurr();
  }, []);

  const handleCurrencySelect = (c) => {
    setCurrency(c);
    saveUserCurrency(c.code);
  };

  const handleComplete = () => {
    const sessionUser = getSession();
    if (sessionUser) {
      sessionUser.onboardingComplete = true;
      sessionUser.preferences = {
        goal,
        currency: currency.code,
        savingsRate,
        trackingMethod,
        budgetStrategy
      };
      saveSession(sessionUser, true);

      // Update in stored users
      const users = getUsers();
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === sessionUser.email.toLowerCase()) {
          return {
            ...u,
            onboardingComplete: true,
            preferences: sessionUser.preferences
          };
        }
        return u;
      });
      saveUsers(updatedUsers);
    }

    setIsCompleted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };

  const goalsList = [
    { title: 'Save Money', desc: 'Build wealth and increase net worth systematically', icon: 'savings' },
    { title: 'Track Daily Expenses', desc: 'Gain 100% visibility over daily cash outflow', icon: 'analytics' },
    { title: 'Pay Off Debt', desc: 'Eliminate loans & high-interest balances fast', icon: 'credit_card_off' },
    { title: 'Build Investment Portfolio', desc: 'Allocate surplus funds into assets & stocks', icon: 'trending_up' },
    { title: 'Emergency Safety Cushion', desc: 'Build 3-6 months of liquid emergency funds', icon: 'shield_locked' },
  ];

  const savingsRatesList = [
    { title: '10% of Income', desc: 'Starter savings goal for building consistency', icon: 'eco' },
    { title: '20% of Income (Standard)', desc: 'Recommended balanced goal under 50/30/20 rule', icon: 'verified' },
    { title: '30% of Income', desc: 'Accelerated growth rate for fast wealth building', icon: 'rocket_launch' },
    { title: '50%+ Aggressive Saver', desc: 'FIRE strategy for maximum financial freedom', icon: 'local_fire_department' },
  ];

  const trackingMethodsList = [
    { title: 'Automated Bank Sync', desc: 'Real-time transaction import & auto-categorization', icon: 'sync' },
    { title: 'AI Receipt Scanner', desc: 'Snap receipt photos to extract line items instantly', icon: 'document_scanner' },
    { title: 'Manual Daily Entry', desc: 'Full hands-on control for micro-budgeting', icon: 'edit_note' },
    { title: 'Weekly Bulk Review', desc: 'Batch review and categorize at the end of every week', icon: 'calendar_view_week' },
  ];

  const budgetStrategiesList = [
    { title: '50/30/20 Rule', desc: '50% Needs, 30% Wants, 20% Savings & Debt', icon: 'pie_chart' },
    { title: 'Zero-Based Budgeting', desc: 'Assign every dollar a specific job before month starts', icon: 'balance' },
    { title: 'Pay Yourself First', desc: 'Transfer savings immediately when income hits', icon: 'payments' },
    { title: 'Envelope Method', desc: 'Set strict digital caps per spending category', icon: 'mail' },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-[#f7f9fb] dark:bg-[#121517] flex flex-col justify-center items-center p-4 selection:bg-[#89f5e7] selection:text-[#00201d]">
      
      {/* Background ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#89f5e7]/20 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#dae2fd]/30 blur-[130px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[540px] bg-white/95 dark:bg-[#1e2326]/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-gray-800 transition-all">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00685f] text-white flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <span className="font-extrabold text-sm text-[#191c1e] dark:text-white tracking-tight">Smart Budget Planner</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] font-bold text-[0.65rem] tracking-wider uppercase">
            Onboarding setup
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-5">
          <div
            className="bg-[#00685f] dark:bg-[#6bd8cb] h-full transition-all duration-500 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#00685f] dark:text-[#6bd8cb]">
            Question {step} of {totalSteps}
          </span>
          <span className="text-xs text-gray-400 font-mono font-semibold">
            {Math.round((step / totalSteps) * 100)}% Completed
          </span>
        </div>

        {/* --- QUESTION 1: PRIMARY FINANCIAL GOAL --- */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                1. What is your primary financial goal?
              </h2>
              <p className="text-xs text-[#565e74] dark:text-gray-400 mt-1">
                We'll customize your dashboard widgets based on your focus.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {goalsList.map(g => (
                <button
                  key={g.title}
                  type="button"
                  onClick={() => setGoal(g.title)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all border flex items-center gap-3.5 cursor-pointer ${
                    goal === g.title
                      ? 'border-[#00685f] bg-[#f4fffc] dark:bg-[#005049]/30 text-[#00685f] dark:text-[#6bd8cb] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    goal === g.title ? 'bg-[#00685f] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]">{g.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#191c1e] dark:text-white">{g.title}</div>
                    <div className="text-xs text-[#565e74] dark:text-gray-400 mt-0.5">{g.desc}</div>
                  </div>
                  {goal === g.title && (
                    <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[20px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- QUESTION 2: PRIMARY CURRENCY (LOCATION AUTO-DETECTED) --- */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                  2. Select your primary currency
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[0.65rem] font-bold uppercase">
                  Auto-Detected
                </span>
              </div>
              <p className="text-xs text-[#565e74] dark:text-gray-400 mt-1">
                Detected based on your geographical location. You can change this anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {SUPPORTED_CURRENCIES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCurrencySelect(c)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    currency.code === c.code
                      ? 'border-[#00685f] bg-[#f4fffc] dark:bg-[#005049]/30 text-[#00685f] dark:text-[#6bd8cb] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-2xl shrink-0">{c.flag}</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-[#191c1e] dark:text-white">{c.code} ({c.symbol})</span>
                    <span className="text-[10px] text-gray-400 truncate">{c.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- QUESTION 3: TARGET MONTHLY SAVINGS GOAL --- */}
        {step === 3 && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                3. What is your monthly savings target?
              </h2>
              <p className="text-xs text-[#565e74] dark:text-gray-400 mt-1">
                Select what percentage of monthly net income you aim to save.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {savingsRatesList.map(s => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setSavingsRate(s.title)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all border flex items-center gap-3.5 cursor-pointer ${
                    savingsRate === s.title
                      ? 'border-[#00685f] bg-[#f4fffc] dark:bg-[#005049]/30 text-[#00685f] dark:text-[#6bd8cb] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    savingsRate === s.title ? 'bg-[#00685f] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]">{s.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#191c1e] dark:text-white">{s.title}</div>
                    <div className="text-xs text-[#565e74] dark:text-gray-400 mt-0.5">{s.desc}</div>
                  </div>
                  {savingsRate === s.title && (
                    <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[20px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- QUESTION 4: EXPENSE TRACKING PREFERENCE --- */}
        {step === 4 && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                4. How do you plan to track expenses?
              </h2>
              <p className="text-xs text-[#565e74] dark:text-gray-400 mt-1">
                Choose how you'd like transactions to be recorded into your vault.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {trackingMethodsList.map(t => (
                <button
                  key={t.title}
                  type="button"
                  onClick={() => setTrackingMethod(t.title)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all border flex items-center gap-3.5 cursor-pointer ${
                    trackingMethod === t.title
                      ? 'border-[#00685f] bg-[#f4fffc] dark:bg-[#005049]/30 text-[#00685f] dark:text-[#6bd8cb] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    trackingMethod === t.title ? 'bg-[#00685f] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]">{t.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#191c1e] dark:text-white">{t.title}</div>
                    <div className="text-xs text-[#565e74] dark:text-gray-400 mt-0.5">{t.desc}</div>
                  </div>
                  {trackingMethod === t.title && (
                    <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[20px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- QUESTION 5: BUDGETING STRATEGY --- */}
        {step === 5 && !isCompleted && (
          <div className="animate-fadeIn space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                5. What is your preferred budgeting strategy?
              </h2>
              <p className="text-xs text-[#565e74] dark:text-gray-400 mt-1">
                Select a methodology for auto-allocating your monthly budget caps.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {budgetStrategiesList.map(b => (
                <button
                  key={b.title}
                  type="button"
                  onClick={() => setBudgetStrategy(b.title)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all border flex items-center gap-3.5 cursor-pointer ${
                    budgetStrategy === b.title
                      ? 'border-[#00685f] bg-[#f4fffc] dark:bg-[#005049]/30 text-[#00685f] dark:text-[#6bd8cb] shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    budgetStrategy === b.title ? 'bg-[#00685f] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]">{b.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#191c1e] dark:text-white">{b.title}</div>
                    <div className="text-xs text-[#565e74] dark:text-gray-400 mt-0.5">{b.desc}</div>
                  </div>
                  {budgetStrategy === b.title && (
                    <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[20px]">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- COMPLETION ANIMATION --- */}
        {isCompleted && (
          <div className="animate-fadeIn flex flex-col items-center justify-center text-center py-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#f4fffc] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] flex items-center justify-center shadow-lg animate-bounce">
              <span className="material-symbols-outlined text-[40px]">check_circle</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
              Onboarding Completed!
            </h2>
            <p className="text-xs text-[#565e74] dark:text-gray-300 max-w-xs">
              Configuring your personalized financial command center...
            </p>
          </div>
        )}

        {/* Navigation Actions */}
        {!isCompleted && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Back</span>
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-6 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold shadow-md shadow-[#00685f]/25 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Next Question</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="w-full py-3 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white text-xs font-bold shadow-md shadow-[#00685f]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Complete Setup & Go to Dashboard</span>
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
