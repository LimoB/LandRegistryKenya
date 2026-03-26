import React from "react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Loader: React.FC<LoaderProps> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
          animate-spin rounded-full 
          border-slate-200 border-t-blue-600
          ${sizeClasses[size]}
        `}
      ></div>
    </div>
  );
};

export default Loader;