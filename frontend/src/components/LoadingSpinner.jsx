import React from 'react';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeStyles = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeStyles[size]} rounded-full border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin`}
        style={{ borderColor: 'currentColor', borderTopColor: '#22c55e' }}
      />
    </div>
  );
};

export default LoadingSpinner;
