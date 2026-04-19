import React, { type ButtonHTMLAttributes } from "react";
import Loader from "./Loader";

/* ================================
   TYPES
================================ */
type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: ButtonVariant;
}

/* ================================
   COMPONENT
================================ */
const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 " +
    "rounded-xl px-6 py-3 text-sm active:scale-[0.98] disabled:opacity-60 " +
    "disabled:cursor-not-allowed disabled:active:scale-100";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-blue-300",
    secondary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
    outline:
      "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-900",
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <Loader size="sm" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;