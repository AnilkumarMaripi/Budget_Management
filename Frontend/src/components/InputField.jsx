import React from 'react';

export default function InputField({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  icon = 'mail',
  valid = false,
  error = '',
  required = false,
  autoComplete
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-wider text-[#3d4947] dark:text-gray-300"
        >
          {label}
        </label>
        {valid && (
          <span className="inline-flex items-center gap-1 text-[#006947] dark:text-[#6ffbbe] text-xs font-semibold animate-fadeIn">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Valid
          </span>
        )}
      </div>

      <div className="relative flex items-center w-full">
        {icon && (
          <span className="material-symbols-outlined absolute left-3.5 text-[#3d4947] dark:text-gray-400 text-[20px] pointer-events-none transition-colors group-focus-within:text-[#00685f]">
            {icon}
          </span>
        )}

        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full h-12 min-h-[48px] ${
            icon ? 'pl-11' : 'pl-4'
          } ${valid ? 'pr-11' : 'pr-4'} py-3 bg-[#f2f4f6] dark:bg-[#262b2f] text-[#191c1e] dark:text-white text-base rounded-lg outline-none transition-all duration-200 placeholder:text-[#3d4947]/50 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-[#1e2326] focus:ring-2 ${
            error
              ? 'ring-2 ring-[#ba1a1a] focus:ring-[#ba1a1a]'
              : 'focus:ring-[#00685f]'
          }`}
        />

        {valid && (
          <span className="material-symbols-outlined absolute right-3.5 text-[#006947] dark:text-[#6ffbbe] text-[20px] pointer-events-none">
            check
          </span>
        )}
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
