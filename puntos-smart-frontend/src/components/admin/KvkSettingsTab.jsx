// components/admin/KvkSettingsTab.jsx - CON PRE-KVK
import React, { useState, useEffect } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import { ButtonSpinner } from "../ui/LoadingSpinner";

const KvkSettingsTab = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    prekvk_bloqueado: false, // NUEVO
    honor_bloqueado: false,
    batallas_bloqueado: false,
    initial_data_bloqueado: false,
    mensaje_prekvk: "El registro de Pre-KvK está temporalmente deshabilitado", // NUEVO
    mensaje_honor: "El registro de Honor está temporalmente deshabilitado",
    mensaje_batallas: "El registro de Batallas está temporalmente deshabilitado",
    mensaje_initial_data: "El registro de Datos Iniciales está temporalmente deshabilitado"
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getKvkSettings();
      
      if (response.success) {
        const config = response.data.configuraciones;
        setSettings({
          prekvk_bloqueado: config.prekvk_bloqueado?.valor === '1', // NUEVO
          honor_bloqueado: config.honor_bloqueado?.valor === '1',
          batallas_bloqueado: config.batallas_bloqueado?.valor === '1',
          initial_data_bloqueado: config.initial_data_bloqueado?.valor === '1',
          mensaje_prekvk: config.mensaje_prekvk?.valor || settings.mensaje_prekvk, // NUEVO
          mensaje_honor: config.mensaje_honor?.valor || settings.mensaje_honor,
          mensaje_batallas: config.mensaje_batallas?.valor || settings.mensaje_batallas,
          mensaje_initial_data: config.mensaje_initial_data?.valor || settings.mensaje_initial_data
        });
      }
    } catch (error) {
      showAlert("Error al cargar configuraciones: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleMessageChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await adminAPI.updateKvkSettings({
        configuraciones: settings
      });
      
      if (response.success) {
        showAlert("Configuraciones guardadas exitosamente", "success");
      } else {
        showAlert(response.message || "Error al guardar configuraciones", "error");
      }
    } catch (error) {
      showAlert("Error al guardar configuraciones: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ⚙️ Configuraciones de Módulos KvK
        </h2>
        <p className="text-gray-600">
          Controla qué módulos están disponibles para los usuarios
        </p>
      </div>

      {/* Controles de Bloqueo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🔒 Control de Acceso a Módulos
        </h3>
        
        <div className="space-y-4">
          {/* NUEVO: Pre-KvK */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">🎯 Módulo de Pre-KvK</h4>
              <p className="text-sm text-gray-600">
                Controla si los usuarios pueden registrar puntos iniciales de KvK
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${settings.prekvk_bloqueado ? 'text-red-600' : 'text-green-600'}`}>
                {settings.prekvk_bloqueado ? 'Bloqueado' : 'Desbloqueado'}
              </span>
              <button
                onClick={() => handleToggle('prekvk_bloqueado')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  settings.prekvk_bloqueado ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.prekvk_bloqueado ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Honor */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">🏆 Módulo de Honor</h4>
              <p className="text-sm text-gray-600">
                Controla si los usuarios pueden registrar su honor
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${settings.honor_bloqueado ? 'text-red-600' : 'text-green-600'}`}>
                {settings.honor_bloqueado ? 'Bloqueado' : 'Desbloqueado'}
              </span>
              <button
                onClick={() => handleToggle('honor_bloqueado')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  settings.honor_bloqueado ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.honor_bloqueado ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Batallas */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">⚔️ Módulo de Batallas</h4>
              <p className="text-sm text-gray-600">
                Controla si los usuarios pueden registrar batallas
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${settings.batallas_bloqueado ? 'text-red-600' : 'text-green-600'}`}>
                {settings.batallas_bloqueado ? 'Bloqueado' : 'Desbloqueado'}
              </span>
              <button
                onClick={() => handleToggle('batallas_bloqueado')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  settings.batallas_bloqueado ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.batallas_bloqueado ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Datos Iniciales */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-800">📊 Módulo de Datos Iniciales</h4>
              <p className="text-sm text-gray-600">
                Controla si los usuarios pueden registrar datos iniciales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${settings.initial_data_bloqueado ? 'text-red-600' : 'text-green-600'}`}>
                {settings.initial_data_bloqueado ? 'Bloqueado' : 'Desbloqueado'}
              </span>
              <button
                onClick={() => handleToggle('initial_data_bloqueado')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  settings.initial_data_bloqueado ? 'bg-red-600' : 'bg-green-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.initial_data_bloqueado ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes Personalizados */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💬 Mensajes de Bloqueo Personalizados
        </h3>
        
        <div className="space-y-4">
          {/* NUEVO: Mensaje Pre-KvK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje para Pre-KvK Bloqueado
            </label>
            <textarea
              value={settings.mensaje_prekvk}
              onChange={(e) => handleMessageChange('mensaje_prekvk', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
              placeholder="Mensaje que verán los usuarios cuando Pre-KvK esté bloqueado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje para Honor Bloqueado
            </label>
            <textarea
              value={settings.mensaje_honor}
              onChange={(e) => handleMessageChange('mensaje_honor', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
              placeholder="Mensaje que verán los usuarios cuando Honor esté bloqueado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje para Batallas Bloqueadas
            </label>
            <textarea
              value={settings.mensaje_batallas}
              onChange={(e) => handleMessageChange('mensaje_batallas', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
              placeholder="Mensaje que verán los usuarios cuando Batallas esté bloqueado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje para Datos Iniciales Bloqueados
            </label>
            <textarea
              value={settings.mensaje_initial_data}
              onChange={(e) => handleMessageChange('mensaje_initial_data', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
              placeholder="Mensaje que verán los usuarios cuando Datos Iniciales esté bloqueado"
            />
          </div>
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {saving && <ButtonSpinner />}
          <span>Guardar Configuraciones</span>
        </button>
      </div>
    </div>
  );
};

export default KvkSettingsTab;