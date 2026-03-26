import React, { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col w-full group">
      {label && (
        <label className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors group-focus-within:text-blue-600">
          {label}
        </label>
      )}
      
      <input
        className={`
          w-full px-4 py-2.5 
          bg-white dark:bg-slate-800 
          border ${error ? "border-red-500" : "border-slate-200 dark:border-slate-700"} 
          rounded-xl text-slate-900 dark:text-slate-100 text-sm
          placeholder:text-slate-400
          transition-all duration-200
          hover:border-slate-300
          focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <span className="text-red-500 text-[11px] font-medium mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;