import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout } from '../lib/auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f9fb] dark:bg-[#121517] text-[#191c1e] dark:text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center text-center gap-6 max-w-md bg-white dark:bg-[#1e2326] p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        
        {/* Animated Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#f4fffc] dark:bg-[#005049]/40 text-[#00685f] dark:text-[#6bd8cb] flex items-center justify-center shadow-inner">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        {/* User Requested Text */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191c1e] dark:text-white tracking-tight">
            login completed
          </h1>
          <p className="text-xs sm:text-sm text-[#565e74] dark:text-gray-400">
            Authenticated as <span className="font-semibold text-[#00685f] dark:text-[#6bd8cb]">{session?.email || 'user'}</span>
          </p>
        </div>

        {/* Back / Logout Action */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 px-6 py-2.5 rounded-lg bg-[#00685f] hover:bg-[#005049] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Sign Out / Back to Login</span>
        </button>
      </div>
    </div>
  );
}
