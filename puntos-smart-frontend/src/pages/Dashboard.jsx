// pages/Dashboard.jsx - Versión actualizada con traductor
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { modulesAPI } from '../services/api';
import { useAlert } from '../contexts/AlertContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

const Dashboard = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const { t } = useTranslation();
  const [moduleConfigs, setModuleConfigs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModuleConfigs();
  }, []);

  const loadModuleConfigs = async () => {
    try {
      const response = await modulesAPI.getConfig();
      if (response.success) {
        setModuleConfigs(response.data.modules);
      }
    } catch (error) {
      console.error('Error loading module configs:', error);
      showAlert(t('errors.loadingData'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      key: 'fortalezas_barbaras',
      name: t('nav.fortresses'),
      description: t('fortresses.subtitle'),
      icon: '🏰',
      color: 'purple',
      path: '/fortalezas',
      hasRanking: true
    },
    {
      key: 'movilizacion',
      name: t('nav.mobilization'),
      description: t('mobilization.subtitle'),
      icon: '🛒',
      color: 'blue',
      path: '/movilizacion',
      hasRanking: true
    },
    {
      key: 'kvk',
      name: t('nav.kvk'),
      description: t('kvk.subtitle'),
      icon: '⚔️',
      color: 'red',
      path: '/kvk',
      hasRanking: false
    },
    {
      key: 'mge',
      name: t('nav.mge'),
      description: t('mge.subtitle'),
      icon: '🏆',
      color: 'yellow',
      path: '/mge',
      hasRanking: false
    },
    {
      key: 'aoo',
      name: t('nav.aoo'),
      description: t('aoo.subtitle'),
      icon: '👥',
      color: 'green',
      path: '/aoo',
      hasRanking: false
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800',
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800',
      red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-800',
      yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-800',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800'
    };
    return colors[color] || colors.purple;
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          {/* Bienvenida */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {t('dashboard.welcome', { username: user?.nombre_usuario })}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('dashboard.subtitle')}
              </p>
              
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="font-semibold text-gray-800">{t('dashboard.rankings')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.rankingsDesc')}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-semibold text-gray-800">{t('dashboard.progress')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.progressDesc')}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">👥</div>
                  <h3 className="font-semibold text-gray-800">{t('dashboard.alliance')}</h3>
                  <p className="text-sm text-gray-600">{t('dashboard.allianceDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Módulos disponibles */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {t('dashboard.availableModules')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules
                .filter(module => moduleConfigs[module.key]?.habilitado !== false)
                .map((module) => (
                  <Link
                    key={module.key}
                    to={module.path}
                    className={`block p-6 border-2 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${getColorClasses(module.color)}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{module.icon}</div>
                      <h3 className="font-bold text-lg mb-2">{module.name}</h3>
                      <p className="text-sm opacity-80 mb-3">{module.description}</p>
                      
                      {module.hasRanking && (
                        <div className="inline-flex items-center text-xs bg-white bg-opacity-50 rounded-full px-3 py-1">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" />
                          </svg>
                          {t('dashboard.withRanking')}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
            
            {/* Mensaje si no hay módulos */}
            {Object.keys(moduleConfigs).length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {t('dashboard.noModules')}
                </h3>
                <p className="text-gray-500">
                  {t('dashboard.noModulesDesc')}
                </p>
              </div>
            )}
          </div>

          {/* Admin panel link */}
          {user?.es_admin && (
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 mt-8">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('dashboard.adminPanel')}</h3>
                  <p className="opacity-80">{t('dashboard.adminPanelDesc')}</p>
                </div>
                <Link
                  to="/admin"
                  className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  {t('dashboard.goToAdmin')}
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;