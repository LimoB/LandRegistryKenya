import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors duration-200">
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
        {title}
      </p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </h3>
    </div>
    
    {/* Icon Container with specific background sizing */}
    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      {icon}
    </div>
  </div>
);

export default StatCard;