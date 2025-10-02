import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center gap-3 py-8 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin`}></div>
      <span className="text-gray-500 animate-pulse">{text}</span>
    </div>
  );
};

export default LoadingSpinner;