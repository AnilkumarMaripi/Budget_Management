import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';
import { SUPPORTED_CURRENCIES, detectAutoCurrency, saveUserCurrency } from '../lib/currency';

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Currency state
  const [currency, setCurrency] = useState(SUPPORTED_CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // User preferences from onboarding
  const prefs = session?.preferences || {
    goal: 'Save Money',
    salary: 45000,
    totalIncome: 55000,
    savingsRate: '20% of Income (Standard)',
    budgetStrategy: '50/30/20 Rule'
  };

  const monthlyIncome = prefs.totalIncome || 55000;

  // Active tab filter
  const [activeTab, setActiveTab] = useState('Overview');

  // Transactions state
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Whole Foods Market', category: 'Groceries', amount: -1240, date: 'Today, 2:30 PM', icon: 'shopping_bag', type: 'expense' },
    { id: 2, title: 'Freelance Client Payout', category: 'Income', amount: 7500, date: 'Yesterday, 6:15 PM', icon: 'payments', type: 'income' },
    { id: 3, title: 'Starbucks Coffee', category: 'Dining', amount: -350, date: '25 Sep 2026', icon: 'local_cafe', type: 'expense' },
    { id: 4, title: 'Electricity & Utilities Bill', category: 'Housing', amount: -2100, date: '24 Sep 2026', icon: 'bolt', type: 'expense' },
    { id: 5, title: 'Mutual Fund SIP Auto-Debit', category: 'Investment', amount: -5000, date: '22 Sep 2026', icon: 'trending_up', type: 'expense' }
  ]);

  // Modal State for Adding New Transaction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Groceries');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState('expense');

  useEffect(() => {
    async function initCurr() {
      const detected = await detectAutoCurrency();
      if (detected) setCurrency(detected);
    }
    initCurr();
  }, []);

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

  const handleCurrencySelect = (c) => {
    setCurrency(c);
    saveUserCurrency(c.code);
    setIsCurrencyOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    const numAmount = Number(newAmount);
    const finalAmount = newType === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount);

    const newTx = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      amount: finalAmount,
      date: 'Just now',
      icon: newType === 'income' ? 'payments' : 'shopping_cart',
      type: newType
    };

    setTransactions([newTx, ...transactions]);
    setNewTitle('');
    setNewAmount('');
    setIsModalOpen(false);
  };

  const totalSpent = Math.abs(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0)
  ) + 18460; // Baseline past spend

  const totalSavings = Math.round(monthlyIncome * 0.20);
  const totalBalance = 342850 + (monthlyIncome - totalSpent);

  return (
    <div className="min-h-screen w-full bg-[#f4f7f6] dark:bg-[#121517] text-[#191c1e] dark:text-white flex flex-col font-sans selection:bg-[#89f5e7] selection:text-[#00201d]">
      
      {/* --- TOP FULL NAVBAR --- */}
      <header className="w-full bg-white dark:bg-[#1e2326] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-[#00685f] text-white flex items-center justify-center font-bold shadow-md shadow-[#00685f]/20">
              <svg className="w-5.5 h-5.5 fill-current" viewBox="0 0 24 24">
                <path d="M5 9.2h3V19H5V9.2zm6-4h3V19h-3V5.2zm6 8h3V19h-3v-5.8zM19 4l-4.5 4.5h3.2v2h2.6V4h-1.3zM4 21h16v1.5H4V21z"></path>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#191c1e] dark:text-white">Smart Budget Planner</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] font-bold text-[0.6rem] uppercase tracking-wider">PRO 2.0</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {['Overview', 'Transactions', 'Budgets', 'Analytics', 'Settings'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#e6f7f5] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Nav Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            title="Toggle dark mode"
          >
            <span className="material-symbols-outlined text-[18px]">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full bg-[#00685f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {session?.name ? session.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-[#191c1e] dark:text-white leading-tight">
                {session?.name || 'Lakshmi Venkat'}
              </span>
              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {session?.email || 'user@domain.com'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* --- MAIN DASHBOARD BODY --- */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* HERO WELCOME STRIP */}
        <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-6 shadow-xs border border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
                Welcome back, {session?.name || 'Lakshmi Venkat'}! 👋
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#565e74] dark:text-gray-300">
              Monthly Net Income Baseline: <span className="font-bold text-[#00685f] dark:text-[#6bd8cb] font-mono">{currency.symbol}{monthlyIncome.toLocaleString()}</span> • Primary Focus: <span className="font-semibold">{prefs.goal}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-bold text-xs shadow-md shadow-[#00685f]/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* 4 KPI SUMMARY BENTO CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Net Balance */}
          <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-gray-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Net Balance</span>
              <div className="w-9 h-9 rounded-xl bg-[#e6f7f5] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#191c1e] dark:text-white">
                {currency.symbol}{totalBalance.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#006947] dark:text-[#6ffbbe] font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>+14.2% vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Income */}
          <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-gray-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Net Income</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#191c1e] dark:text-white">
                {currency.symbol}{monthlyIncome.toLocaleString()}
              </span>
              <div className="text-xs text-gray-400 mt-1">
                Fixed salary + side incomes
              </div>
            </div>
          </div>

          {/* Card 3: Monthly Expenses */}
          <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-gray-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Monthly Expenses</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#191c1e] dark:text-white">
                {currency.symbol}{totalSpent.toLocaleString()}
              </span>
              <div className="text-xs text-gray-400 mt-1">
                {Math.round((totalSpent / monthlyIncome) * 100)}% of monthly income used
              </div>
            </div>
          </div>

          {/* Card 4: Total Savings Target */}
          <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-5 shadow-xs border border-gray-200/80 dark:border-gray-800 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Savings Target (20%)</span>
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#00685f] dark:text-[#6bd8cb] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">savings</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#00685f] dark:text-[#6bd8cb]">
                {currency.symbol}{totalSavings.toLocaleString()}
              </span>
              <div className="flex items-center gap-1 mt-1 text-xs text-[#00685f] dark:text-[#6bd8cb] font-bold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>On track for monthly goal</span>
              </div>
            </div>
          </div>

        </div>

        {/* DUAL COLUMN MIDDLE SECTION: CATEGORY BUDGETS & TRANSACTIONS FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLS: Category Expense Allocation & 50/30/20 Rule */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category Limits Card */}
            <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-6 shadow-xs border border-gray-200/80 dark:border-gray-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-[#191c1e] dark:text-white">Budget Allocation & Category Limits</h3>
                  <p className="text-xs text-gray-400">Strategy: {prefs.budgetStrategy}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#e6f7f5] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] font-extrabold text-[0.65rem] uppercase">
                  Active Caps
                </span>
              </div>

              {/* Category Progress List */}
              <div className="space-y-4">
                {/* Housing */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-[#191c1e] dark:text-white">
                      <span>🏠</span> Housing & Utilities
                    </span>
                    <span className="font-mono text-gray-500">
                      {currency.symbol}12,500 / {currency.symbol}15,000 (83%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#00685f] h-full rounded-full w-[83%]"></div>
                  </div>
                </div>

                {/* Groceries */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-[#191c1e] dark:text-white">
                      <span>🛒</span> Groceries & Food
                    </span>
                    <span className="font-mono text-gray-500">
                      {currency.symbol}6,200 / {currency.symbol}8,000 (77%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#00685f] h-full rounded-full w-[77%]"></div>
                  </div>
                </div>

                {/* Transportation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-[#191c1e] dark:text-white">
                      <span>🚗</span> Transportation & Fuel
                    </span>
                    <span className="font-mono text-gray-500">
                      {currency.symbol}2,450 / {currency.symbol}4,000 (61%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[61%]"></div>
                  </div>
                </div>

                {/* Entertainment */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-[#191c1e] dark:text-white">
                      <span>🎬</span> Dining & Entertainment
                    </span>
                    <span className="font-mono text-gray-500">
                      {currency.symbol}3,000 / {currency.symbol}5,000 (60%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full w-[60%]"></div>
                  </div>
                </div>
              </div>

              {/* 50/30/20 Breakdown Summary Banner */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="block text-[0.65rem] font-bold text-gray-400 uppercase">Needs (50%)</span>
                  <span className="font-mono font-bold text-xs text-[#191c1e] dark:text-white mt-0.5 block">
                    {currency.symbol}{(monthlyIncome * 0.5).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <span className="block text-[0.65rem] font-bold text-gray-400 uppercase">Wants (30%)</span>
                  <span className="font-mono font-bold text-xs text-[#191c1e] dark:text-white mt-0.5 block">
                    {currency.symbol}{(monthlyIncome * 0.3).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#e6f7f5] dark:bg-[#005049]/30">
                  <span className="block text-[0.65rem] font-bold text-[#00685f] dark:text-[#6bd8cb] uppercase">Savings (20%)</span>
                  <span className="font-mono font-bold text-xs text-[#00685f] dark:text-[#6bd8cb] mt-0.5 block">
                    {currency.symbol}{(monthlyIncome * 0.2).toLocaleString()}
                  </span>
                </div>
              </div>

            </div>

            {/* Smart Insights Callout */}
            <div className="bg-gradient-to-r from-[#00685f] to-[#005049] text-white rounded-2xl p-5 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] text-[#89f5e7]">auto_awesome</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm tracking-tight">AI Wealth Optimization Guardrail</h4>
                <p className="text-xs text-teal-100 leading-snug">
                  You are currently saving <span className="font-bold text-white">{currency.symbol}{totalSavings.toLocaleString()}</span> monthly. Keep dining expenses under {currency.symbol}5,000 to maintain your 20% target.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLS: Recent Transactions Feed */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#1e2326] rounded-2xl p-6 shadow-xs border border-gray-200/80 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-[#191c1e] dark:text-white">Recent Activity</h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-xs font-bold text-[#00685f] dark:text-[#6bd8cb] hover:underline"
                >
                  + Add New
                </button>
              </div>

              {/* Transactions List */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        tx.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        <span className="material-symbols-outlined text-[18px]">{tx.icon}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#191c1e] dark:text-white">{tx.title}</div>
                        <div className="text-[10px] text-gray-400">{tx.category} • {tx.date}</div>
                      </div>
                    </div>

                    <span className={`font-mono text-xs font-bold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {tx.type === 'income' ? '+' : ''}{currency.symbol}{Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* --- ADD TRANSACTION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#1e2326] rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#191c1e] dark:text-white">Add New Transaction</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Title / Merchant
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Grocery Store"
                  className="w-full h-11 px-3.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#00685f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Amount ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="1200"
                    className="w-full h-11 px-3.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-[#00685f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full h-11 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#00685f]"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-11 px-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#00685f]"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Housing">Housing & Utilities</option>
                  <option value="Dining">Dining & Coffee</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Investment">Investment</option>
                  <option value="Income">Income / Salary</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="w-full text-center py-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 font-medium">
        © 2026 Smart Budget Planner. Encrypted with bank-grade privacy standards.
      </footer>
    </div>
  );
}
