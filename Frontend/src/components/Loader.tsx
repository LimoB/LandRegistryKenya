import React from "react";

/* ================================
   TYPES
================================ */
type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  size?: LoaderSize;
  className?: string;
}

/* ================================
   COMPONENT
================================ */
const Loader: React.FC<LoaderProps> = ({
  size = "md",
  className = "",
}) => {
  const sizes: Record<LoaderSize, string> = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-4",
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full 
          border-slate-300 border-t-blue-600
          ${sizes[size]}
        `}
      />
    </div>
  );
};

export default Loader;