import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getUsers, saveUsers, saveSession } from '../lib/auth';
import { SUPPORTED_CURRENCIES, detectAutoCurrency } from '../lib/currency';

export default function Onboarding() {
  const navigate = useNavigate();
  const session = getSession();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Auto-detected Currency in background (No question asked)
  const [currency, setCurrency] = useState(SUPPORTED_CURRENCIES[0]);

  // 5 Financial Questions State
  // Q1: Financial Goal
  const [goal, setGoal] = useState('Save Money');
  
  // Q2: Salary & Income (Matches screenshot design)
  const [salary, setSalary] = useState(45000);
  const [salaryDate, setSalaryDate] = useState('1st of every month');
  const [incomeType, setIncomeType] = useState('Fixed');
  const [showOtherIncome, setShowOtherIncome] = useState(true);
  const [otherIncomes, setOtherIncomes] = useState([
    { id: 1, type: 'Freelance', amount: 7500 },
    { id: 2, type: 'Rent', amount: 2500 }
  ]);

  // Q3: Target Savings Goal
  const [savingsRate, setSavingsRate] = useState('20% of Income (Standard)');

  // Q4: Expense Tracking Method
  const [trackingMethod, setTrackingMethod] = useState('Automated Bank Sync');

  // Q5: Budget Allocation Strategy
  const [budgetStrategy, setBudgetStrategy] = useState('50/30/20 Rule');

  const [isCompleted, setIsCompleted] = useState(false);

  // Auto-detect location currency in background
  useEffect(() => {
    async function initCurr() {
      const detected = await detectAutoCurrency();
      if (detected) {
        setCurrency(detected);
      }
    }
    initCurr();
  }, []);

  // Income sources math
  const handleAddIncomeSource = () => {
    setOtherIncomes(prev => [
      ...prev,
      { id: Date.now(), type: 'Business', amount: 0 }
    ]);
  };

  const handleUpdateOtherIncome = (id, field, value) => {
    setOtherIncomes(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveOtherIncome = (id) => {
    setOtherIncomes(prev => prev.filter(item => item.id !== id));
  };

  const additionalIncome = otherIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalIncome = Number(salary || 0) + additionalIncome;

  const handleComplete = () => {
    const sessionUser = getSession();
    if (sessionUser) {
      sessionUser.onboardingComplete = true;
      sessionUser.preferences = {
        goal,
        salary,
        totalIncome,
        savingsRate,
        trackingMethod,
        budgetStrategy,
        currency: currency.code
      };
      saveSession(sessionUser, true);

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

  // 5 Question Metadata (Excludes Currency)
  const stepMeta = [
    { step: 1, tag: 'STEP 01 • FINANCIAL GOAL', title: 'What is your primary financial goal?', sub: 'Tell us about your primary wealth focus so we can calibrate your automated budget rules.' },
    { step: 2, tag: 'STEP 02 • SALARY & INCOME', title: 'Your salary and income', sub: 'Tell us about your primary earnings so we can calibrate your monthly spending limits and savings targets.' },
    { step: 3, tag: 'STEP 03 • SAVINGS TARGET', title: 'Set your monthly savings target', sub: `Choose what portion of your net monthly income (${currency.symbol}${totalIncome.toLocaleString()}) you aim to reserve for wealth building.` },
    { step: 4, tag: 'STEP 04 • EXPENSE TRACKING', title: 'How do you plan to track expenses?', sub: 'Choose how you would like your daily transactions recorded into your wealth vault.' },
    { step: 5, tag: 'STEP 05 • BUDGETING STRATEGY', title: 'Choose your budgeting strategy', sub: 'Select a framework for auto-allocating your monthly spending caps.' }
  ];

  const currentMeta = stepMeta.find(m => m.step === step) || stepMeta[0];

  // Options Lists
  const goalsList = [
    { title: 'Save Money', desc: 'Build wealth and increase net worth systematically', icon: 'savings' },
    { title: 'Track Daily Expenses', desc: 'Gain 100% visibility over daily cash outflow', icon: 'analytics' },
    { title: 'Pay Off Debt', desc: 'Eliminate loans & high-interest balances fast', icon: 'credit_card_off' },
    { title: 'Build Investment Portfolio', desc: 'Allocate surplus funds into assets & stocks', icon: 'trending_up' },
    { title: 'Emergency Safety Cushion', desc: 'Build 3-6 months of liquid emergency funds', icon: 'shield_locked' },
  ];

  const savingsRatesList = [
    { title: '10% of Income', desc: `Starter savings goal (${currency.symbol}${(totalIncome * 0.1).toLocaleString()}/mo)`, icon: 'eco' },
    { title: '20% of Income (Standard)', desc: `Recommended 50/30/20 target (${currency.symbol}${(totalIncome * 0.2).toLocaleString()}/mo)`, icon: 'verified' },
    { title: '30% of Income', desc: `High saver accelerator (${currency.symbol}${(totalIncome * 0.3).toLocaleString()}/mo)`, icon: 'rocket_launch' },
    { title: '50%+ Aggressive Saver', desc: `FIRE strategy target (${currency.symbol}${(totalIncome * 0.5).toLocaleString()}/mo)`, icon: 'local_fire_department' },
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
    <div className="min-h-screen w-full bg-[#f4f7f6] dark:bg-[#121517] text-[#191c1e] dark:text-white flex flex-col justify-between selection:bg-[#89f5e7] selection:text-[#00201d] font-sans">
      
      {/* --- TOP FULL-WIDTH NAVBAR HEADER --- */}
      <header className="w-full bg-white dark:bg-[#1e2326] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              step === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-bold shadow-xs">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#191c1e] dark:text-white">Smart Budget Planner</span>
          </div>
        </div>

        {/* Right Header Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#e6f7f5] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] font-mono text-xs font-bold">
            <span>{step} / {totalSteps}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-sans font-normal">
              {totalSteps - step} question{totalSteps - step === 1 ? '' : 's'} remaining
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
            {session?.name ? session.name[0].toUpperCase() : 'A'}
          </div>
        </div>
      </header>

      {/* --- MAIN CENTERED CONTENT CONTAINER --- */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[580px] space-y-5">
          
          {/* ABOVE CARD STEP HEADER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccfbf1] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] font-extrabold text-[0.68rem] tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] dark:bg-[#6bd8cb] animate-pulse"></span>
                <span>{currentMeta.tag}</span>
              </div>
              <div className="flex items-center gap-1 text-[0.7rem] font-bold tracking-wider text-gray-400 uppercase font-mono">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                <span>Est. 1 min</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] dark:text-white tracking-tight leading-tight">
              {currentMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#565e74] dark:text-gray-300 leading-relaxed">
              {currentMeta.sub}
            </p>
          </div>

          {/* MAIN FORM CARD CONTAINER */}
          <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-gray-800 relative transition-all">
            
            {/* --- QUESTION 1: FINANCIAL GOAL --- */}
            {step === 1 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="space-y-2.5">
                  {goalsList.map(g => (
                    <button
                      key={g.title}
                      type="button"
                      onClick={() => setGoal(g.title)}
                      className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-4 cursor-pointer ${
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
                        <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[22px]">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- QUESTION 2: SALARY & INCOME (EXACT MATCH TO USER SCREENSHOT) --- */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* 1. MONTHLY TAKE-HOME SALARY */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-xs uppercase tracking-wider text-[#565e74] dark:text-gray-300">
                      Monthly Take-Home Salary
                    </label>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#00685f] dark:text-[#6bd8cb]">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      Net credited
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <div className="w-full h-14 bg-[#f4f7f9] dark:bg-[#262b2f] rounded-xl px-4 flex items-center gap-3 border border-transparent focus-within:border-[#00685f] focus-within:bg-white dark:focus-within:bg-[#1e2326] transition-all">
                      <span className="font-mono text-2xl font-extrabold text-[#191c1e] dark:text-white">{currency.symbol}</span>
                      <input
                        type="number"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="45000"
                        className="w-full h-full bg-transparent outline-none font-mono text-2xl font-extrabold text-[#191c1e] dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Quick set pills */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-gray-400 font-semibold">Quick set:</span>
                    {[15000, 25000, 50000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSalary(amt)}
                        className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                          Number(salary) === amt
                            ? 'bg-[#89f5e7] text-[#00201d] font-bold shadow-xs'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {currency.symbol}{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. SALARY CREDIT DATE & INCOME TYPE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-xs uppercase tracking-wider text-[#565e74] dark:text-gray-300 mb-1.5">
                      Salary Credit Date
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={salaryDate}
                        onChange={(e) => setSalaryDate(e.target.value)}
                        className="w-full h-11 px-3 bg-[#f4f7f9] dark:bg-[#262b2f] rounded-xl text-xs font-bold text-[#191c1e] dark:text-white outline-none appearance-none cursor-pointer border border-transparent focus:border-[#00685f]"
                      >
                        <option value="1st of every month">1st of every month</option>
                        <option value="5th of every month">5th of every month</option>
                        <option value="10th of every month">10th of every month</option>
                        <option value="15th of every month">15th of every month</option>
                        <option value="Last working day">Last working day</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 text-gray-400 text-[18px] pointer-events-none">calendar_today</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs uppercase tracking-wider text-[#565e74] dark:text-gray-300 mb-1.5">
                      Income Type
                    </label>
                    <div className="grid grid-cols-2 p-1 bg-[#f4f7f9] dark:bg-[#262b2f] rounded-xl h-11">
                      <button
                        type="button"
                        onClick={() => setIncomeType('Fixed')}
                        className={`rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                          incomeType === 'Fixed'
                            ? 'bg-white dark:bg-[#1e2326] text-[#00685f] dark:text-[#6bd8cb] shadow-xs'
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                        }`}
                      >
                        Fixed
                      </button>
                      <button
                        type="button"
                        onClick={() => setIncomeType('Variable')}
                        className={`rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                          incomeType === 'Variable'
                            ? 'bg-white dark:bg-[#1e2326] text-[#00685f] dark:text-[#6bd8cb] shadow-xs'
                            : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                        }`}
                      >
                        Variable
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. OTHER INCOME SOURCES (COLLAPSIBLE BOX) */}
                <div className="bg-[#f7fafc] dark:bg-[#262b2f]/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer select-none"
                    onClick={() => setShowOtherIncome(prev => !prev)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#89f5e7] text-[#00201d] flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#191c1e] dark:text-white">Add other income sources</span>
                        <span className="text-[11px] text-gray-400 block sm:inline sm:ml-1 font-normal">
                          Freelance, rent, business, bonus ({showOtherIncome ? 'Tap to collapse' : 'Tap to expand'})
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 text-[20px]">
                      {showOtherIncome ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </span>
                  </div>

                  {showOtherIncome && (
                    <div className="space-y-2.5 pt-1 animate-fadeIn">
                      {otherIncomes.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <select
                            value={item.type}
                            onChange={(e) => handleUpdateOtherIncome(item.id, 'type', e.target.value)}
                            className="flex-1 h-10 px-3 bg-white dark:bg-[#1e2326] rounded-xl text-xs font-bold text-[#191c1e] dark:text-white border border-gray-200 dark:border-gray-700 outline-none"
                          >
                            <option value="Freelance">Freelance</option>
                            <option value="Rent">Rent</option>
                            <option value="Business">Business</option>
                            <option value="Bonus">Bonus</option>
                            <option value="Dividends">Dividends</option>
                            <option value="Other">Other</option>
                          </select>

                          <div className="flex-1 relative flex items-center">
                            <span className="absolute left-3 text-xs font-bold text-gray-400">{currency.symbol}</span>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => handleUpdateOtherIncome(item.id, 'amount', e.target.value)}
                              className="w-full h-10 pl-7 pr-3 bg-white dark:bg-[#1e2326] rounded-xl text-xs font-bold font-mono text-[#191c1e] dark:text-white border border-gray-200 dark:border-gray-700 outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveOtherIncome(item.id)}
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddIncomeSource}
                        className="w-full py-2 rounded-xl text-xs font-bold text-[#00685f] dark:text-[#6bd8cb] hover:bg-[#e6f7f5] dark:hover:bg-[#005049]/30 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Add another source</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. AGGREGATED BASELINE CARD */}
                <div className="bg-[#e6f7f5] dark:bg-[#005049]/30 rounded-xl p-4 flex items-center justify-between border border-[#89f5e7]/50 dark:border-[#005049]">
                  <div>
                    <span className="block font-bold text-[0.65rem] uppercase tracking-wider text-[#565e74] dark:text-gray-300">
                      Aggregated Baseline
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Total monthly income:</span>
                      <span className="font-mono text-xl font-extrabold text-[#00685f] dark:text-[#6bd8cb]">
                        {currency.symbol}{totalIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {additionalIncome > 0 && (
                    <span className="px-3 py-1 rounded-full bg-[#89f5e7] text-[#00201d] font-mono text-xs font-bold">
                      +{currency.symbol}{additionalIncome.toLocaleString()} additional
                    </span>
                  )}
                </div>

              </div>
            )}

            {/* --- QUESTION 3: SAVINGS TARGET --- */}
            {step === 3 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="space-y-2.5">
                  {savingsRatesList.map(s => (
                    <button
                      key={s.title}
                      type="button"
                      onClick={() => setSavingsRate(s.title)}
                      className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-4 cursor-pointer ${
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
                        <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[22px]">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- QUESTION 4: EXPENSE TRACKING PREFERENCE --- */}
            {step === 4 && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="space-y-2.5">
                  {trackingMethodsList.map(t => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => setTrackingMethod(t.title)}
                      className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-4 cursor-pointer ${
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
                        <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[22px]">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- QUESTION 5: BUDGETING STRATEGY --- */}
            {step === 5 && !isCompleted && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="space-y-2.5">
                  {budgetStrategiesList.map(b => (
                    <button
                      key={b.title}
                      type="button"
                      onClick={() => setBudgetStrategy(b.title)}
                      className={`w-full p-4 rounded-xl text-left transition-all border flex items-center gap-4 cursor-pointer ${
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
                        <span className="material-symbols-outlined text-[#00685f] dark:text-[#6bd8cb] text-[22px]">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- COMPLETION ANIMATION --- */}
            {isCompleted && (
              <div className="animate-fadeIn flex flex-col items-center justify-center text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#e6f7f5] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] flex items-center justify-center shadow-lg animate-bounce">
                  <span className="material-symbols-outlined text-[40px]">check_circle</span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                  Setup Completed!
                </h2>
                <p className="text-xs text-[#565e74] dark:text-gray-300 max-w-xs">
                  Configuring your personalized financial command center...
                </p>
              </div>
            )}

            {/* PRIMARY CTA BUTTON (MATCHING SCREENSHOT DESIGN) */}
            {!isCompleted && (
              <div className="mt-6 pt-4 space-y-3">
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s + 1)}
                    className="w-full h-12 rounded-xl bg-[#005d54] hover:bg-[#004b44] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleComplete}
                    className="w-full h-12 rounded-xl bg-[#005d54] hover:bg-[#004b44] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Complete Setup & Go to Dashboard</span>
                    <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                  </button>
                )}

                {/* Bank-grade Security Footer Guarantee */}
                <div className="flex items-center justify-center gap-1.5 text-[0.7rem] text-[#565e74] dark:text-gray-400 font-medium text-center">
                  <span className="material-symbols-outlined text-[14px] text-[#00685f]">lock</span>
                  <span>Bank-grade 256-bit encryption. Your financial data is private and zero-knowledge protected.</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* --- PAGE FOOTER BELOW CARD --- */}
      <footer className="w-full text-center py-4 text-xs text-[#565e74] dark:text-gray-500 font-medium">
        © 2026 Smart Budget Planner. Encrypted with bank-grade privacy standards.
      </footer>
    </div>
  );
}
