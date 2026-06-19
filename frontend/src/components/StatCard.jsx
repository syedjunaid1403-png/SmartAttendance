import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, description, trend, type = 'primary' }) => {
  const borderColors = {
    primary: 'border-l-primary-500',
    info: 'border-l-blue-500',
    warning: 'border-l-amber-500',
    danger: 'border-l-red-500',
  };

  const textColors = {
    primary: 'text-primary-600 dark:text-primary-400',
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  const bgColors = {
    primary: 'bg-primary-50 dark:bg-primary-950/20',
    info: 'bg-blue-50 dark:bg-blue-950/20',
    warning: 'bg-amber-50 dark:bg-amber-950/20',
    danger: 'bg-red-50 dark:bg-red-950/20',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className={`glass-panel border-l-4 ${borderColors[type]} p-5 rounded-2xl flex items-center justify-between transition-all`}
    >
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <h3 className="text-3xl font-extrabold font-sans mt-2 tracking-tight text-gray-900 dark:text-gray-100">
          {value}
        </h3>
        <div className="flex items-center gap-1.5 mt-2.5">
          {trend && (
            <span className={`text-xs font-bold ${trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.value}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {description}
          </span>
        </div>
      </div>
      
      <div className={`p-3.5 rounded-xl ${bgColors[type]} ${textColors[type]} flex items-center justify-center`}>
        {icon}
      </div>
    </motion.div>
  );
};

export default StatCard;
