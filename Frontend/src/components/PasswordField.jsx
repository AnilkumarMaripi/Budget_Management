import React, { useState } from 'react';

export default function PasswordField({
  id,
  name,
  label = 'Password',
  placeholder = '••••••••••••',
  value,
  onChange,
  error = '',
  required = false,
  autoComplete = 'current-password'
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        htmlFor={id}
        className="text-xs font-bold uppercase tracking-wider text-[#3d4947] dark:text-gray-300"
      >
        {label}
      </label>

      <div className="relative flex items-center w-full">
        <span className="material-symbols-outlined absolute left-3.5 text-[#3d4947] dark:text-gray-400 text-[20px] pointer-events-none">
          lock
        </span>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full h-12 min-h-[48px] pl-11 pr-11 py-3 bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white text-base rounded-lg outline-none transition-all duration-200 placeholder:text-[#3d4947]/50 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 ${
            error
              ? 'ring-2 ring-[#ba1a1a] focus:ring-[#ba1a1a]'
              : 'focus:ring-[#00685f]'
          }`}
        />

        <button
          type="button"
          id={`${id}-toggle`}
          aria-label="Toggle password visibility"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 text-[#3d4947] dark:text-gray-400 hover:text-[#191c1e] dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00685f] p-1.5 rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] flex items-center justify-center">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>

      {error && (
        <span className="text-xs text-[#ba1a1a] font-medium flex items-center gap-1 mt-0.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </span>
      )}
    </div>
  );
}
