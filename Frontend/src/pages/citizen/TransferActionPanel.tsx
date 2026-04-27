import React from "react";
import { ArrowRightLeft } from "lucide-react";

/**
 * Define the structure of the API error response 
 * to satisfy the ESLint rule.
 */
interface ApiError {
  data?: {
    error?: string;
    message?: string;
  };
  status?: number;
}

interface ActionPanelProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isError: boolean;
  // Replaced 'any' with a union of ApiError and unknown
  error: ApiError | null | unknown; 
  isOwnLandSelected: boolean | null;
  isDisabled: boolean;
}

const TransferActionPanel: React.FC<ActionPanelProps> = ({
  onSubmit,
  isLoading,
  isError,
  error,
  isOwnLandSelected,
  isDisabled,
}) => {
  /* ================================
     HELPER TO EXTRACT ERROR MESSAGE
  ================================ */
  const getErrorMessage = () => {
    if (!isError || !error) return null;

    // Check if the error matches our ApiError structure
    const apiErr = error as ApiError;
    if (apiErr.data?.error) return apiErr.data.error;
    if (apiErr.data?.message) return apiErr.data.message;

    return "Transfer failed";
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="border rounded-2xl p-6 bg-white dark:bg-slate-950 space-y-6">
        <h3 className="font-bold flex items-center gap-2">
          <ArrowRightLeft size={18} />
          Purchase Request
        </h3>

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-xs rounded-xl text-yellow-800 dark:text-yellow-200">
          This will create a transfer request pending officer approval.
        </div>

        {/* SELF TRANSFER WARNING */}
        {isOwnLandSelected && (
          <p className="text-red-500 text-xs font-medium">
            You cannot initiate transfer on your own land.
          </p>
        )}

        {/* ERROR MESSAGE */}
        {isError && (
          <p className="text-red-500 text-xs italic">
            {getErrorMessage()}
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-opacity hover:bg-blue-700 active:scale-[0.98]"
        >
          {isLoading ? "Creating request..." : "Initiate Purchase"}
        </button>
      </div>
    </form>
  );
};

export default TransferActionPanel;