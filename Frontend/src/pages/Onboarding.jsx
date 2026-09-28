import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getUsers, saveUsers, saveSession } from '../lib/auth';
import { SUPPORTED_CURRENCIES, detectAutoCurrency, saveUserCurrency } from '../lib/currency';

export default function Onboarding() {
  const navigate = useNavigate();
  const session = getSession();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [currency, setCurrency] = useState(SUPPORTED_CURRENCIES[0]);
  const [goal, setGoal] = useState('');

  useEffect(() => {
    async function initCurr() {
      const detected = await detectAutoCurrency();
      setCurrency(detected);
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
      saveSession(sessionUser, true);

      // Update in sb_users too
      const users = getUsers();
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === sessionUser.email.toLowerCase()) {
          return { ...u, onboardingComplete: true };
        }
        return u;
      });
      saveUsers(updatedUsers);
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#f7f9fb] dark:bg-[#121517] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[480px] bg-white dark:bg-[#1e2326] rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-[#00685f] h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-[#00685f]">
          Step {step} of {totalSteps}
        </span>

        {step === 1 && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#191c1e] dark:text-white">
              What is your primary financial goal?
            </h2>
            <div className="flex flex-col gap-2">
              {['Save Money', 'Track Daily Expenses', 'Pay Off Debt', 'Build Investment'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`p-3 rounded-lg text-left text-sm font-semibold transition-all border cursor-pointer ${
                    goal === g
                      ? 'border-[#00685f] bg-[#f4fffc] text-[#00685f] dark:bg-[#005049]/30 dark:text-[#6bd8cb]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#191c1e] dark:text-white">
                Select your primary currency
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[0.65rem] font-bold uppercase">Auto-Detected</span>
            </div>
            <p className="text-xs text-[#565e74] dark:text-gray-400">
              We auto-detected your currency based on location. You can change it anytime.
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {SUPPORTED_CURRENCIES.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCurrencySelect(c)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    currency.code === c.code
                      ? 'border-[#00685f] bg-[#f4fffc] text-[#00685f] dark:bg-[#005049]/30 dark:text-[#6bd8cb]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <div className="flex flex-col">
                    <span>{c.code} ({c.symbol})</span>
                    <span className="text-[10px] text-gray-400 font-normal">{c.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step > 2 && step < totalSteps && (
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-[#191c1e] dark:text-white">
              Onboarding Question #{step}
            </h2>
            <p className="text-sm text-[#3d4947] dark:text-gray-300">
              Customize your Smart Budget Planner experience.
            </p>
          </div>
        )}

        {step === totalSteps && (
          <div className="mt-4 flex flex-col gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f4fffc] text-[#00685f] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-[#191c1e] dark:text-white">
              All Set!
            </h2>
            <p className="text-sm text-[#3d4947] dark:text-gray-300">
              Your personalized budget tracker is ready.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Back
            </button>
          ) : <div></div>}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-6 py-2.5 rounded-lg bg-[#00685f] text-white text-sm font-semibold shadow-md hover:bg-[#005049]"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="w-full py-3 rounded-lg bg-[#00685f] text-white text-sm font-bold shadow-md hover:bg-[#005049]"
            >
              Go to Dashboard →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
