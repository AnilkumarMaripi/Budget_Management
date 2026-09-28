import React from 'react';

export default function Logo({ size = 'md' }) {
  const isLarge = size === 'lg';
  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        {/* Soft Ambient Glow Ring */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-[#00685f] to-[#6ffbbe] rounded-2xl opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-500"></div>
        
        {/* Logo Tile - 16px border-radius (rounded-2xl) */}
        <div className={`${isLarge ? 'w-20 h-20 shadow-xl' : 'w-14 h-14 shadow-lg'} rounded-2xl bg-white dark:bg-[#1e2326] p-2.5 shadow-[#00685f]/15 flex items-center justify-center relative transition-transform duration-300 hover:scale-105`}>
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#00685f] to-[#008378] flex items-center justify-center text-white shadow-inner">
            <span className={`material-symbols-outlined ${isLarge ? 'text-[34px]' : 'text-[26px]'}`}>
              account_balance_wallet
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center text-center">
        {/* Badge Pill with Pulsing Dot */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0e3e5]/70 dark:bg-gray-800/80 text-[#3d4947] dark:text-gray-300 font-bold text-[11px] uppercase tracking-wider mb-1.5 backdrop-blur-sm shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
          Smart Wealth 2.0
        </span>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
          <span className="text-[#00685f] dark:text-[#6bd8cb]">Smart</span> Budget Planner
        </h1>
        <p className="text-xs sm:text-sm text-[#3d4947] dark:text-gray-400 mt-1 font-medium">
          Master your money, effortlessly
        </p>
      </div>
    </div>
  );
}
