// src/utils/helpers.js - Funciones utilitarias

// Configuración global - PARA VITE
export const CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/',
  UPLOAD_BASE_URL: import.meta.env.VITE_UPLOAD_BASE_URL || '/uploads/',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
};

// Formateo de números
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-ES').format(num);
};

// Formateo de fechas
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Obtener número de semana actual
export const getCurrentWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
};

// Validación de archivos
export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No se ha seleccionado ningún archivo');
    return errors;
  }
  
  // Validar tipo
  if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, GIF)');
  }
  
  // Validar tamaño
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    errors.push(`El archivo es demasiado grande. Tamaño máximo: ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }
  
  return errors;
};

// Validación de formularios
export const validateForm = (formData, rules) => {
  const errors = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];
    
    // Campo requerido
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `El campo ${rule.label || field} es requerido`;
      continue;
    }
    
    if (value && value.toString().trim() !== '') {
      // Validar tipo
      if (rule.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors[field] = `${rule.label || field} debe ser un número válido`;
          continue;
        }
        
        if (rule.min !== undefined && num < rule.min) {
          errors[field] = `${rule.label || field} debe ser mayor o igual a ${rule.min}`;
          continue;
        }
        
        if (rule.max !== undefined && num > rule.max) {
          errors[field] = `${rule.label || field} debe ser menor o igual a ${rule.max}`;
          continue;
        }
      }
      
      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field] = `${rule.label || field} debe ser un email válido`;
          continue;
        }
      }
      
      // Validar longitud
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${rule.label || field} debe tener al menos ${rule.minLength} caracteres`;
        continue;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${rule.label || field} no puede tener más de ${rule.maxLength} caracteres`;
        continue;
      }
      
      // Validación personalizada
      if (rule.custom && typeof rule.custom === 'function') {
        const customError = rule.custom(value);
        if (customError) {
          errors[field] = customError;
          continue;
        }
      }
    }
  }
  
  return errors;
};

// Debounce function
export const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Generar URL de imagen con fallback
export const getImageUrl = (imagePath, fallback = '/images/placeholder.png') => {
  if (!imagePath) return fallback;
  
  // Para desarrollo local
  if (window.location.hostname === 'localhost') {
    return `http://localhost:8000/uploads/${imagePath}`;
  }
  
  // Para producción - CAMBIAR ESTA LÍNEA
  return `${CONFIG.UPLOAD_BASE_URL}/${imagePath}`;
};

// Detectar si está en dispositivo móvil
export const isMobile = () => {
  return window.innerWidth <= 768;
};

// Scroll suave a elemento
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

// Copiar texto al portapapeles
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } else {
      // Fallback para navegadores antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true };
      } catch (err) {
        document.body.removeChild(textArea);
        return { success: false, error: 'No se pudo copiar' };
      }
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Generar ranking con medallas
export const getRankingIcon = (position) => {
  switch (position) {
    case 1:
      return { icon: '🥇', class: 'text-yellow-500' };
    case 2:
      return { icon: '🥈', class: 'text-gray-400' };
    case 3:
      return { icon: '🥉', class: 'text-orange-600' };
    default:
      return { icon: position.toString(), class: 'text-gray-600' };
  }
};

// Formatear diferencia con colores
export const formatDifference = (diferencia) => {
  if (!diferencia) diferencia = 0;
  
  let className = 'text-gray-600';
  let prefix = '';
  
  if (diferencia > 0) {
    className = 'text-green-600';
    prefix = '+';
  } else if (diferencia < 0) {
    className = 'text-red-600';
  }
  
  return {
    value: `${prefix}${formatNumber(diferencia)}`,
    className
  };
};

// Escape HTML para prevenir XSS
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Crear FormData desde objeto
export const createFormData = (data, fileFields = []) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (fileFields.includes(key) && value instanceof File) {
      formData.append(key, value);
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  
  return formData;
};

// Redimensionar imagen antes de subirla
export const resizeImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Calcular nuevas dimensiones
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convertir a blob
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};