// hooks/useKvKData.js - Hook personalizado con mapeo de campos

import { useState, useEffect } from "react";
import { useAlert } from "../contexts/AlertContext";
import { kvkAPI } from "../services/api";
import { validateFile, createFormData } from "../utils/helpers";

export const useKvKData = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kvkData, setKvkData] = useState(null);
  const [honorData, setHonorData] = useState(null);
  const [puntuacion, setPuntuacion] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [batallas, setBatallas] = useState([]);

  // Estados para formularios
  const [initialForm, setInitialForm] = useState({
    initial_t4_kills: "",
    initial_t5_kills: "",
    initial_own_deaths: "",
    current_power: "", // NUEVO CAMPO
    initial_kills_photo: null,
    initial_deaths_photo: null,
  });

  const [honorForm, setHonorForm] = useState({
    honor_amount: "",
    honor_photo: null,
  });

  const [battleForm, setBattleForm] = useState({
    kill_t4: "",
    kill_t5: "",
    own_deaths_t4: "",
    own_deaths_t5: "",
    battle_photo: null,
    deaths_photo: null,
  });

  // Obtener la etapa activa
  const etapaActiva = etapas.find(
    (etapa) =>
      parseInt(etapa.activa) === 1 ||
      etapa.activa === true ||
      etapa.activa === "1"
  );

  const loadModuleData = async () => {
    try {
      setLoading(true);
      const response = await kvkAPI.getUserData();

      if (response.success) {
        const data = response.data;
        setKvkData(data.kvk_inicial);
        setHonorData(data.honor_data);
        setPuntuacion(data.puntuacion);
        setEtapas(data.etapas || []);
        setBatallas(data.batallas || []);

        console.log("Etapas cargadas:", data.etapas); // Debug

        // Llenar formulario inicial si hay datos - MAPEO DE CAMPOS BD A FRONTEND
        if (data.kvk_inicial) {
          setInitialForm((prev) => ({
            ...prev,
            initial_t4_kills: data.kvk_inicial.kill_t4_iniciales || "",
            initial_t5_kills: data.kvk_inicial.kill_t5_iniciales || "",
            initial_own_deaths: data.kvk_inicial.muertes_propias_iniciales || "",
            current_power: data.kvk_inicial.current_power || "", // DIRECTO - MISMO NOMBRE
          }));
        }

        // Llenar formulario de honor si hay datos - MAPEO DE CAMPOS BD A FRONTEND
        if (data.honor_data) {
          setHonorForm((prev) => ({
            ...prev,
            honor_amount: data.honor_data.honor_cantidad || "", // BD: honor_cantidad -> Frontend: honor_amount
          }));
        }

        // Cargar datos de batalla para la etapa activa si existe
        if (data.etapas && data.etapas.length > 0) {
          const etapaActiva = data.etapas.find(
            (etapa) =>
              parseInt(etapa.activa) === 1 ||
              etapa.activa === true ||
              etapa.activa === "1"
          );
          console.log("Etapa activa encontrada:", etapaActiva); // Debug

          if (etapaActiva) {
            loadBattleData(etapaActiva.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading KvK data:", error);
      showAlert("Error cargando datos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBattleData = (etapaId) => {
    const batalla = batallas.find((b) => b.etapa_id === parseInt(etapaId));
    if (batalla) {
      // MAPEO DE CAMPOS BD A FRONTEND PARA BATALLAS
      setBattleForm({
        kill_t4: batalla.kill_t4 || "",
        kill_t5: batalla.kill_t5 || "",
        own_deaths_t4: batalla.muertes_propias_t4 || "", // BD: muertes_propias_t4 -> Frontend: own_deaths_t4
        own_deaths_t5: batalla.muertes_propias_t5 || "", // BD: muertes_propias_t5 -> Frontend: own_deaths_t5
        battle_photo: null,
        deaths_photo: null,
      });
    } else {
      setBattleForm({
        kill_t4: "",
        kill_t5: "",
        own_deaths_t4: "",
        own_deaths_t5: "",
        battle_photo: null,
        deaths_photo: null,
      });
    }
  };

  return {
    // Estados
    loading,
    saving,
    setSaving,
    kvkData,
    honorData,
    puntuacion,
    etapas,
    batallas,
    etapaActiva,
    
    // Formularios
    initialForm,
    setInitialForm,
    honorForm,
    setHonorForm,
    battleForm,
    setBattleForm,
    
    // Funciones
    loadModuleData,
    loadBattleData,
  };
};
