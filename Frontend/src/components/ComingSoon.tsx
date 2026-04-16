import React from "react";

type ComingSoonProps = {
  title?: string;
  description?: string;
  showBackButton?: boolean;
};

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "This feature is currently under development.",
  showBackButton = false,
}) => {
  return (
    <div className="h-full min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {title}
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>

        <div className="mt-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-500">
              Soon
            </span>
          </div>
        </div>

        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;