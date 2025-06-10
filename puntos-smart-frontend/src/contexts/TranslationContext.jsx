// contexts/TranslationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('es');
  const [translations, setTranslations] = useState({});

  // Cargar traducciones al cambiar idioma
  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'es';
    setLanguage(savedLanguage);
  }, []);

  const loadTranslations = async (lang) => {
    try {
      const module = await import(`../locales/${lang}.js`);
      setTranslations(module.default);
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Fallback a español si falla cargar
      if (lang !== 'es') {
        const fallback = await import('../locales/es.js');
        setTranslations(fallback.default);
      }
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  // Función para obtener traducción con fallback
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let translation = translations;
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key; // Retorna la clave si no encuentra traducción
    }
    
    // Reemplazar parámetros en la traducción
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return translation;
  };

  // Función para formatear números según el idioma
  const formatNumber = (number) => {
    if (number === null || number === undefined || number === '') return '0';
    return new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US').format(number);
  };
  
  // Función para formatear fechas según el idioma
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Función para formatear fechas cortas
  const formatShortDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US');
  };

  const value = {
    language,
    changeLanguage,
    t,
    translations,
    formatNumber,
    formatDate,
    formatShortDate
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook personalizado alternativo (opcional)
export const useTranslationHook = () => {
  const { t, language, changeLanguage, formatNumber, formatDate, formatShortDate } = useTranslation();
  
  return {
    t,
    language,
    changeLanguage,
    formatNumber,
    formatDate,
    formatShortDate
  };
};