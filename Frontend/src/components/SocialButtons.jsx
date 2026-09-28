import React from 'react';

export default function SocialButtons({ onGoogleAuth, onPhoneAuth }) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Divider */}
      <div className="relative my-1 flex items-center justify-center">
        <div className="w-full h-px bg-[#e6e8ea] dark:bg-gray-700"></div>
        <span className="absolute px-3 bg-white dark:bg-[#1e2326] text-[#3d4947] dark:text-gray-400 font-bold text-[11px] uppercase tracking-wider">
          or continue with
        </span>
      </div>

      {/* Social Providers Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google Sign In */}
        <button
          type="button"
          onClick={onGoogleAuth}
          className="flex items-center justify-center gap-2 h-12 min-h-[48px] px-4 rounded-lg bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] text-[#191c1e] dark:text-white font-medium text-sm transition-all duration-200 active:scale-[0.98] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00685f]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              fill="#4285F4"
            ></path>
            <path
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              fill="#34A853"
            ></path>
            <path
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              fill="#FBBC05"
            ></path>
            <path
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              fill="#EA4335"
            ></path>
          </svg>
          <span>Google</span>
        </button>

        {/* Phone Sign In */}
        <button
          type="button"
          onClick={onPhoneAuth}
          className="flex items-center justify-center gap-2 h-12 min-h-[48px] px-4 rounded-lg bg-[#f2f4f6] dark:bg-[#262b2f] hover:bg-[#e6e8ea] dark:hover:bg-[#31373c] text-[#191c1e] dark:text-white font-medium text-sm transition-all duration-200 active:scale-[0.98] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#00685f]"
        >
          <span className="material-symbols-outlined text-[20px] text-[#3d4947] dark:text-gray-300">
            smartphone
          </span>
          <span>Phone</span>
        </button>
      </div>
    </div>
  );
}
