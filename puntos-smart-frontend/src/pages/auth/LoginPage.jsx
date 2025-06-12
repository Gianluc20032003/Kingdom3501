import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';
import { validateForm } from '../../utils/helpers';
import LanguageSelector from '../../components/common/LanguageSelector';

const LoginPage = () => {
  const { login, register } = useAuth();
  const { showAlert } = useAlert();
  const { t } = useTranslation();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    user_id: '',
    passwordConfirm: '',
    remember: false
  });
  const [errors, setErrors] = useState({});

  // Cargar usuario recordado al montar el componente
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setFormData(prev => ({
        ...prev,
        username: rememberedUser,
        remember: true
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateLoginForm = () => {
    const rules = {
      username: {
        required: true,
        label: t("auth.username"),
        minLength: 3
      },
      password: {
        required: true,
        label: t("auth.password"),
        minLength: 6
      }
    };
    
    return validateForm(formData, rules);
  };

  const validateRegisterForm = () => {
    const rules = {
      user_id: {
        required: true,
        label: t("auth.rokProfileId"),
        minLength: 3,
        maxLength: 20,
        custom: (value) => {
          if (!/^[0-9]+$/.test(value)) {
            return t("validation.rokProfileIdInvalid");
          }
          return null;
        }
      },
      username: {
        required: true,
        label: t("auth.username"),
        minLength: 3,
        maxLength: 100
      },
      password: {
        required: true,
        label: t("auth.password"),
        minLength: 6
      },
      passwordConfirm: {
        required: true,
        label: t("auth.confirmPassword"),
        custom: (value) => {
          if (value !== formData.password) {
            return t("validation.passwordMismatch");
          }
          return null;
        }
      }
    };
    
    return validateForm(formData, rules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        // Validar formulario de login
        const validationErrors = validateLoginForm();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }

        const result = await login(formData.username, formData.password, formData.remember);
        
        if (!result.success) {
          showAlert(result.message || t("auth.loginError"), 'error');
        }
        // Si es exitoso, AuthContext se encarga de la redirección
        
      } else {
        // Validar formulario de registro
        const validationErrors = validateRegisterForm();
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }

        const userData = {
          user_id: formData.user_id,
          username: formData.username,
          password: formData.password
        };

        const result = await register(userData);
        
        if (result.success) {
          showAlert(t("auth.registrationSuccess"), 'success');
          setIsLogin(true);
          setFormData(prev => ({
            ...prev,
            user_id: '',
            passwordConfirm: ''
          }));
        } else {
          showAlert(result.message || t("auth.registerError"), 'error');
        }
      }
    } catch (error) {
      showAlert(t("auth.connectionError") + ': ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData(prev => ({
      ...prev,
      user_id: '',
      passwordConfirm: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Selector de idioma en la esquina superior derecha */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4 shadow-2xl">
            <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Kingdom Smart
          </h1>
          <p className="text-purple-200 text-lg">Reino 3501</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registro: ID de Usuario */}
            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {t("auth.rokProfileId")}
                </label>
                <input
                  type="text"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  onInput={(e) => {
                    // Solo permitir números
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange(e);
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.user_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t("auth.rokProfileIdPlaceholder")}
                  maxLength="15"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("auth.rokProfileIdDesc")}
                </p>
                {errors.user_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>
                )}
              </div>
            )}

            {/* Login/Registro: Nombre de Usuario */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {isLogin ? t("auth.enterUserIdOrUsername") : t("auth.username")}
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={isLogin ? t("auth.enterUserIdOrUsername") : t("auth.enterUsername")}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("auth.password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t("auth.enterPassword")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Registro: Confirmar Contraseña */}
            {!isLogin && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  {t("auth.repeatPassword")}
                </label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={t("auth.repeatYourPassword")}
                />
                {errors.passwordConfirm && (
                  <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm}</p>
                )}
              </div>
            )}

            {/* Login: Recordar dispositivo */}
            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  checked={formData.remember}
                  onChange={handleInputChange}
                  className="mr-2 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-700">
                  {t("auth.rememberDevice")}
                </label>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                isLogin
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105`}
            >
              {loading && <ButtonSpinner />}
              <span>{isLogin ? t("auth.login") : t("auth.register")}</span>
            </button>
          </form>

          {/* Switch entre Login/Register */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
              <button
                onClick={switchMode}
                className="ml-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
              >
                {isLogin ? t("auth.register") : t("auth.login")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;