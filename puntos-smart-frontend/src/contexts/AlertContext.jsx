import React, { createContext, useContext, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newAlert = { id, message, type, duration };
    
    setAlerts(prev => [...prev, newAlert]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const value = {
    alerts,
    showAlert,
    removeAlert,
    clearAllAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AlertContainer alerts={alerts} removeAlert={removeAlert} />
    </AlertContext.Provider>
  );
};

// Componente para mostrar las alertas
const AlertContainer = ({ alerts, removeAlert }) => {
  if (alerts.length === 0) return null;

  const getAlertStyles = (type) => {
    const baseStyles = "px-6 py-4 rounded-lg shadow-lg flex items-center justify-between min-w-80 max-w-md";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-500 text-white`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`${getAlertStyles(alert.type)} animate-fade-in`}
        >
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => removeAlert(alert.id)}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};