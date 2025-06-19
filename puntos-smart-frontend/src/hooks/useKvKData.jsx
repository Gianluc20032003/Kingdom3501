// hooks/useKvKData.js
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
  const [preKvkData, setPreKvkData] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [puntuacion, setPuntuacion] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [batallas, setBatallas] = useState([]);

  const [initialForm, setInitialForm] = useState({
    initial_t4_kills: "",
    initial_t5_kills: "",
    initial_own_deaths: "",
    current_power: "",
    initial_kills_photo: null,
    initial_deaths_photo: null,
  });

  const [honorForm, setHonorForm] = useState({
    honor_amount: "",
    honor_photo: null,
  });

  const [preKvkForm, setPreKvkForm] = useState({
    puntos_kvk: "",
    foto_puntos_kvk: null,
  });

  const [battleForm, setBattleForm] = useState({
    kill_t4: "",
    kill_t5: "",
    own_deaths_t4: "",
    own_deaths_t5: "",
    battle_photo: null,
    deaths_photo: null,
  });

  const etapaActiva = etapas.find(
    (etapa) =>
      parseInt(etapa.activa) === 1 ||
      etapa.activa === true ||
      etapa.activa === "1"
  );

  const loadModuleData = async () => {
    try {
      setLoading(true);

      const [userDataResponse, preKvkResponse, rankingResponse] = await Promise.all([
        kvkAPI.getUserData(),
        kvkAPI.getPreKvkData().catch(() => ({ success: false, data: null })),
        kvkAPI.getPreKvkRanking().catch(() => ({ success: false, data: [] })),
      ]);

      if (userDataResponse.success) {
        const data = userDataResponse.data;
        setKvkData(data.kvk_inicial);
        setHonorData(data.honor_data);
        setPuntuacion(data.puntuacion);
        setEtapas(data.etapas || []);
        setBatallas(data.batallas || []);

        console.log("Etapas cargadas:", data.etapas);

        if (data.kvk_inicial) {
          setInitialForm((prev) => ({
            ...prev,
            initial_t4_kills: data.kvk_inicial.kill_t4_iniciales || "",
            initial_t5_kills: data.kvk_inicial.kill_t5_iniciales || "",
            initial_own_deaths: data.kvk_inicial.muertes_propias_iniciales || "",
            current_power: data.kvk_inicial.current_power || "",
          }));
        }

        if (data.honor_data) {
          setHonorForm((prev) => ({
            ...prev,
            honor_amount: data.honor_data.honor_cantidad || "",
          }));
        }

        if (data.etapas && data.etapas.length > 0) {
          const etapaActiva = data.etapas.find(
            (etapa) =>
              parseInt(etapa.activa) === 1 ||
              etapa.activa === true ||
              etapa.activa === "1"
          );
          console.log("Etapa activa encontrada:", etapaActiva);

          if (etapaActiva) {
            loadBattleData(etapaActiva.id);
          }
        }
      }

      if (preKvkResponse.success && preKvkResponse.data) {
        setPreKvkData(preKvkResponse.data);
        setPreKvkForm((prev) => ({
          ...prev,
          puntos_kvk: preKvkResponse.data.puntos_kvk || "",
        }));
      }

      if (rankingResponse.success) {
        setRankingData(rankingResponse.data);
      } else {
        console.warn("No se pudieron cargar los datos del ranking");
        showAlert("No se pudo cargar el ranking de Pre-KvK", "warning");
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
      setBattleForm({
        kill_t4: batalla.kill_t4 || "",
        kill_t5: batalla.kill_t5 || "",
        own_deaths_t4: batalla.muertes_propias_t4 || "",
        own_deaths_t5: batalla.muertes_propias_t5 || "",
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
    loading,
    saving,
    setSaving,
    kvkData,
    honorData,
    preKvkData,
    rankingData,
    puntuacion,
    etapas,
    batallas,
    etapaActiva,
    initialForm,
    setInitialForm,
    honorForm,
    setHonorForm,
    preKvkForm,
    setPreKvkForm,
    battleForm,
    setBattleForm,
    loadModuleData,
    loadBattleData,
  };
};