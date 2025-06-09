import React from 'react';

const LoadingSpinner = ({ size = 'large', message = 'Cargando...', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  };

  const containerClasses = {
    small: 'p-2',
    medium: 'p-4',
    large: 'p-8',
    xlarge: 'p-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-100 ${className}`}>
      <div className={`${containerClasses[size]} text-center`}>
        {/* Spinner principal */}
        <div className="relative">
          <div className={`${sizeClasses[size]} mx-auto mb-4`}>
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
          </div>
          
          {/* Corona en el centro (logo) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-2">
            <svg 
              className="w-6 h-6 text-purple-600" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
        
        {/* Mensaje */}
        {message && (
          <p className="text-gray-600 font-medium animate-pulse">
            {message}
          </p>
        )}
        
        {/* Puntos animados */}
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

// Componente más simple para usar en botones
export const ButtonSpinner = ({ size = 'small', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
      <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
    </div>
  );
};

// Componente para loading en línea
export const InlineSpinner = ({ message = 'Cargando...', className = '' }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="w-5 h-5 relative">
        <div className="absolute inset-0 border-2 border-purple-200 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
      </div>
      <span className="text-gray-600">{message}</span>
    </div>
  );
};

export default LoadingSpinner;