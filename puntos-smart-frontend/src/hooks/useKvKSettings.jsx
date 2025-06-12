// hooks/useKvKSettings.js
import { useState, useEffect } from "react";
import { kvkAPI } from "../services/api";

export const useKvKSettings = () => {
  const [settings, setSettings] = useState({
    honor_bloqueado: false,
    batallas_bloqueado: false,
    initial_data_bloqueado: false,
    mensaje_honor: "El registro de Honor está temporalmente deshabilitado",
    mensaje_batallas: "El registro de Batallas está temporalmente deshabilitado",
    mensaje_initial_data: "El registro de Datos Iniciales está temporalmente deshabilitado"
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  const loadKvKSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await kvkAPI.getSettings();
      
      if (response.success) {
        const config = response.data.configuraciones;
        setSettings({
          honor_bloqueado: config.honor_bloqueado?.valor === '1',
          batallas_bloqueado: config.batallas_bloqueado?.valor === '1',
          initial_data_bloqueado: config.initial_data_bloqueado?.valor === '1',
          mensaje_honor: config.mensaje_honor?.valor || settings.mensaje_honor,
          mensaje_batallas: config.mensaje_batallas?.valor || settings.mensaje_batallas,
          mensaje_initial_data: config.mensaje_initial_data?.valor || settings.mensaje_initial_data
        });
      }
    } catch (error) {
      console.error("Error cargando configuraciones KvK:", error);
      // En caso de error, mantener configuración por defecto (todo desbloqueado)
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadKvKSettings();
  }, []);

  return {
    settings,
    loadingSettings,
    loadKvKSettings // Por si necesitas recargar configuraciones
  };
};