import React, { type ButtonHTMLAttributes } from "react";
import Loader from "./Loader";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  loading, 
  variant = "primary", 
  className, 
  disabled,
  ...props 
}) => {
  
  const baseStyles = "relative flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl px-6 py-3 text-sm";
  
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-200",
    outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader size="sm" className="!border-t-current" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;