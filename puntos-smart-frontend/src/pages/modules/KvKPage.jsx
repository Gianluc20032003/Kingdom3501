// pages/modules/KvKPage.jsx
import React, { useState, useEffect } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { kvkAPI } from "../../services/api";
import { validateFile, createFormData } from "../../utils/helpers";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import ImageModal from "../../components/ui/ImageModal";

const KvKPage = () => {
  const { showAlert } = useAlert();
  const { t, formatNumber, formatDate } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("initial");
  const [kvkData, setKvkData] = useState(null);
  const [honorData, setHonorData] = useState(null);
  const [puntuacion, setPuntuacion] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [batallas, setBatallas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");

  // Estados para formularios
  const [initialForm, setInitialForm] = useState({
    initial_t4_kills: "",
    initial_t5_kills: "",
    initial_own_deaths: "",
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

  useEffect(() => {
    loadModuleData();
  }, []);

  // Obtener la etapa activa
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

        // Llenar formulario inicial si hay datos
        if (data.kvk_inicial) {
          setInitialForm((prev) => ({
            ...prev,
            initial_t4_kills: data.kvk_inicial.initial_t4_kills || "",
            initial_t5_kills: data.kvk_inicial.initial_t5_kills || "",
            initial_own_deaths: data.kvk_inicial.initial_own_deaths || "",
          }));
        }

        // Llenar formulario de honor si hay datos
        if (data.honor_data) {
          setHonorForm((prev) => ({
            ...prev,
            honor_amount: data.honor_data.honor_amount || "",
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
      showAlert(t("errors.loadingData") + ": " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Reemplaza la línea donde defines etapaActiva
  const etapaActiva = etapas.find(
    (etapa) =>
      parseInt(etapa.activa) === 1 ||
      etapa.activa === true ||
      etapa.activa === "1"
  );

  const handleInitialInputChange = (e) => {
    const { name, value, files } = e.target;

    if (
      (name === "initial_kills_photo" || name === "initial_deaths_photo") &&
      files[0]
    ) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(", "), "error");
        e.target.value = "";
        return;
      }

      setInitialForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setInitialForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleHonorInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "honor_photo" && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(", "), "error");
        e.target.value = "";
        return;
      }

      setHonorForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setHonorForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBattleInputChange = (e) => {
    const { name, value, files } = e.target;

    if ((name === "battle_photo" || name === "deaths_photo") && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(", "), "error");
        e.target.value = "";
        return;
      }

      setBattleForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setBattleForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();

    if (!initialForm.initial_t4_kills || initialForm.initial_t4_kills < 0) {
      showAlert(t("kvk.validT4Kills"), "error");
      return;
    }
    if (!initialForm.initial_t5_kills || initialForm.initial_t5_kills < 0) {
      showAlert(t("kvk.validT5Kills"), "error");
      return;
    }
    if (!initialForm.initial_own_deaths || initialForm.initial_own_deaths < 0) {
      showAlert(t("kvk.validOwnDeaths"), "error");
      return;
    }

    const isNewRecord = !kvkData;
    if (
      isNewRecord &&
      (!initialForm.initial_kills_photo || !initialForm.initial_deaths_photo)
    ) {
      showAlert(t("kvk.photosRequired"), "error");
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData(
        {
          initial_t4_kills: initialForm.initial_t4_kills,
          initial_t5_kills: initialForm.initial_t5_kills,
          initial_own_deaths: initialForm.initial_own_deaths,
          initial_kills_photo: initialForm.initial_kills_photo,
          initial_deaths_photo: initialForm.initial_deaths_photo,
        },
        ["initial_kills_photo", "initial_deaths_photo"]
      );

      const response = await kvkAPI.saveInitial(submitData);

      if (response.success) {
        showAlert(t("kvk.dataSaved"), "success");
        await loadModuleData();
      } else {
        showAlert(response.message || t("kvk.saveError"), "error");
      }
    } catch (error) {
      console.error("Error saving initial data:", error);
      showAlert(t("errors.savingData") + ": " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleHonorSubmit = async (e) => {
    e.preventDefault();

    if (!honorForm.honor_amount || honorForm.honor_amount < 0) {
      showAlert(t("kvk.validHonor"), "error");
      return;
    }

    const isNewRecord = !honorData;
    if (isNewRecord && !honorForm.honor_photo) {
      showAlert(t("kvk.honorPhotoRequired"), "error");
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData(
        {
          honor_amount: honorForm.honor_amount,
          honor_photo: honorForm.honor_photo,
        },
        ["honor_photo"]
      );

      const response = await kvkAPI.saveHonor(submitData);

      if (response.success) {
        showAlert(t("kvk.dataSaved"), "success");
        await loadModuleData();
      } else {
        showAlert(response.message || t("kvk.saveError"), "error");
      }
    } catch (error) {
      console.error("Error saving honor data:", error);
      showAlert(t("errors.savingData") + ": " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBattleSubmit = async (e) => {
    e.preventDefault();

    if (!etapaActiva) {
      showAlert(t("kvk.noActiveStage"), "error");
      return;
    }

    const existingBattle = batallas.find((b) => b.etapa_id === etapaActiva.id);
    if (
      !existingBattle &&
      (!battleForm.battle_photo || !battleForm.deaths_photo)
    ) {
      showAlert(t("kvk.battlePhotosRequired"), "error");
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData(
        {
          etapa_id: etapaActiva.id,
          kill_t4: battleForm.kill_t4 || 0,
          kill_t5: battleForm.kill_t5 || 0,
          own_deaths_t4: battleForm.own_deaths_t4 || 0,
          own_deaths_t5: battleForm.own_deaths_t5 || 0,
          battle_photo: battleForm.battle_photo,
          deaths_photo: battleForm.deaths_photo,
        },
        ["battle_photo", "deaths_photo"]
      );

      const response = await kvkAPI.saveBattle(submitData);

      if (response.success) {
        showAlert(t("kvk.dataSaved"), "success");
        await loadModuleData();
      } else {
        showAlert(response.message || t("kvk.saveError"), "error");
      }
    } catch (error) {
      console.error("Error saving battle data:", error);
      showAlert(t("errors.savingData") + ": " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const loadBattleData = (etapaId) => {
    const batalla = batallas.find((b) => b.etapa_id === parseInt(etapaId));
    if (batalla) {
      setBattleForm({
        kill_t4: batalla.kill_t4 || "",
        kill_t5: batalla.kill_t5 || "",
        own_deaths_t4: batalla.own_deaths_t4 || "",
        own_deaths_t5: batalla.own_deaths_t5 || "",
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

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
        <main className="p-6 space-y-6">
          {/* Header con Puntuación */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  ⚔️ {t("kvk.title")}
                </h1>
                <p className="text-gray-600">{t("kvk.subtitle")}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{t("kvk.totalScore")}</div>
                <div className="text-3xl font-bold text-red-600">
                  {puntuacion ? formatNumber(puntuacion.puntuacion_total) : "0"}
                </div>
                <div className="text-sm text-gray-500">{t("common.points")}</div>
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("initial")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "initial"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📊 {t("kvk.initialData")}
                </button>
                <button
                  onClick={() => setActiveTab("honor")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "honor"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  🏆 {t("kvk.honor")}
                </button>
                <button
                  onClick={() => setActiveTab("battles")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "battles"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  ⚔️ {t("kvk.battles")}
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "summary"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  📈 {t("kvk.summaryAndScore")}
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Tab: Datos Iniciales */}
              {activeTab === "initial" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {t("kvk.killsAndDeathsBeforeKvk")}
                  </h3>

                  <form onSubmit={handleInitialSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.initialKillsPhoto")}
                        </label>
                        <input
                          type="file"
                          name="initial_kills_photo"
                          onChange={handleInitialInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={!kvkData}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.initialKillsDesc")}
                        </p>

                        {/* Contenedor horizontal para las imágenes */}
                        <div className="mt-3 flex items-start space-x-6">
                          {/* Imagen de ejemplo */}
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              {t("common.example")}:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/norho.png"
                              alt={t("kvk.initialKillsPhoto")}
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(
                                  "https://servicios.puntossmart.com/img/norho.png"
                                )
                              }
                            />
                          </div>

                          {/* Imagen actual si existe */}
                          {kvkData?.foto_inicial_url && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                {t("common.currentImage")}:
                              </p>
                              <img
                                src={`http://localhost:8000/uploads/${kvkData.foto_inicial_url}`}
                                alt={t("kvk.initialKillsPhoto")}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    `http://localhost:8000/uploads/${kvkData.foto_inicial_url}`
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.ownDeathsPhoto")}
                        </label>
                        <input
                          type="file"
                          name="initial_deaths_photo"
                          onChange={handleInitialInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={!kvkData}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.ownDeathsDesc")}
                        </p>

                        {/* Contenedor horizontal para las imágenes */}
                        <div className="mt-3 flex items-start space-x-6">
                          {/* Imagen de ejemplo */}
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              {t("common.example")}:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/norho.png"
                              alt={t("kvk.ownDeathsPhoto")}
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(
                                  "https://servicios.puntossmart.com/img/norho.png"
                                )
                              }
                            />
                          </div>

                          {/* Imagen actual si existe */}
                          {kvkData?.foto_muertes_iniciales_url && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                {t("common.currentImage")}:
                              </p>
                              <img
                                src={`http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`}
                                alt={t("kvk.ownDeathsPhoto")}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    `http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.initialT4Kills")}
                        </label>
                        <input
                          type="number"
                          name="initial_t4_kills"
                          value={initialForm.initial_t4_kills}
                          onChange={handleInitialInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ex: 50000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.initialT4KillsDesc")}
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.initialOwnDeaths")}
                        </label>
                        <input
                          type="number"
                          name="initial_own_deaths"
                          value={initialForm.initial_own_deaths}
                          onChange={handleInitialInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ex: 50000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.initialOwnDeathsDesc")}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.initialT5Kills")}
                        </label>
                        <input
                          type="number"
                          name="initial_t5_kills"
                          value={initialForm.initial_t5_kills}
                          onChange={handleInitialInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ex: 25000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.initialT5KillsDesc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={loadModuleData}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving && <ButtonSpinner />}
                        <span>
                          {kvkData ? t("common.update") : t("common.register")}{" "}
                          {t("kvk.initialData")}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Honor */}
              {activeTab === "honor" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    🏆 {t("kvk.honorObtained")}
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                      <span className="font-semibold">💡 </span>
                      {t("kvk.honorScoring")}
                    </p>
                  </div>

                  <form onSubmit={handleHonorSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.honorAmount")}
                        </label>
                        <input
                          type="number"
                          name="honor_amount"
                          value={honorForm.honor_amount}
                          onChange={handleHonorInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ex: 10000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.honorAmountDesc")}
                        </p>
                        {honorForm.honor_amount && (
                          <p className="text-sm text-green-600 mt-1">
                            {t("kvk.pointsYouGet", {
                              points: formatNumber(honorForm.honor_amount * 5),
                            })}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          {t("kvk.honorPhoto")}
                        </label>
                        <input
                          type="file"
                          name="honor_photo"
                          onChange={handleHonorInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={!honorData}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {t("kvk.honorPhotoDesc")}
                        </p>
                        <div className="mt-3 flex items-start space-x-6">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              {t("common.example")}:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/norho.png"
                              alt={t("kvk.honorPhoto")}
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(
                                  "https://servicios.puntossmart.com/img/norho.png"
                                )
                              }
                            />
                          </div>
                          {honorData?.foto_honor_url && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                {t("common.currentImage")}:
                              </p>
                              <img
                                src={`http://localhost:8000/uploads/${honorData.foto_honor_url}`}
                                alt={t("kvk.honorPhoto")}
                                className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    `http://localhost:8000/uploads/${honorData.foto_honor_url}`
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={loadModuleData}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {t("common.cancel")}
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving && <ButtonSpinner />}
                        <span>
                          {honorData ? t("common.update") : t("common.register")}{" "}
                          {t("kvk.honor")}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Batallas */}
              {activeTab === "battles" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {etapaActiva
                      ? t("kvk.registerBattle", { stage: etapaActiva.nombre_etapa })
                      : t("kvk.registerBattle", { stage: "" })}
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      <span className="font-semibold">💡 </span>
                      {t("kvk.battleScoring")}
                    </p>
                  </div>

                  {!etapaActiva ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⚙️</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        {t("kvk.noActiveStage")}
                      </h3>
                      <p className="text-gray-500">{t("kvk.noActiveStageDesc")}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleBattleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("kvk.t4KillsThisStage")}
                          </label>
                          <input
                            type="number"
                            name="kill_t4"
                            value={battleForm.kill_t4}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                          {battleForm.kill_t4 && (
                            <p className="text-sm text-green-600 mt-1">
                              {t("common.points")}: +
                              {formatNumber(battleForm.kill_t4 * 10)}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("kvk.ownT4DeathsThisStage")}
                          </label>
                          <input
                            type="number"
                            name="own_deaths_t4"
                            value={battleForm.own_deaths_t4}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                          {battleForm.own_deaths_t4 && (
                            <p className="text-sm text-green-600 mt-1">
                              {t("common.points")}: +
                              {formatNumber(battleForm.own_deaths_t4 * 5)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("kvk.t5KillsThisStage")}
                          </label>
                          <input
                            type="number"
                            name="kill_t5"
                            value={battleForm.kill_t5}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                          {battleForm.kill_t5 && (
                            <p className="text-sm text-green-600 mt-1">
                              {t("common.points")}: +
                              {formatNumber(battleForm.kill_t5 * 20)}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("kvk.ownT5DeathsThisStage")}
                          </label>
                          <input
                            type="number"
                            name="own_deaths_t5"
                            value={battleForm.own_deaths_t5}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                          {battleForm.own_deaths_t5 && (
                            <p className="text-sm text-green-600 mt-1">
                              {t("common.points")}: +
                              {formatNumber(battleForm.own_deaths_t5 * 10)}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("kvk.battlePhoto")}
                          </label>
                          <input
                            type="file"
                            name="battle_photo"
                            onChange={handleBattleInputChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {t("kvk.battlePhotoDesc")}
                          </p>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              {t("common.example")}:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/illsexample.jpg"
                              alt={t("kvk.battlePhoto")}
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(
                                  "https://servicios.puntossmart.com/img/illsexample.jpg"
                                )
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            {t("kvk.deathsPhoto")}
                          </label>
                          <input
                            type="file"
                            name="deaths_photo"
                            onChange={handleBattleInputChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {t("kvk.deathsPhotoDesc")}
                          </p>
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              {t("common.example")}:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/norho.png"
                              alt={t("kvk.deathsPhoto")}
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(
                                  "https://servicios.puntossmart.com/img/norho.png"
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview de puntos de esta batalla */}
                      {(battleForm.kill_t4 ||
                        battleForm.kill_t5 ||
                        battleForm.own_deaths_t4 ||
                        battleForm.own_deaths_t5) && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">
                            {t("kvk.battlePoints")}
                          </h4>
                          <div className="text-lg font-bold text-center">
                            {(() => {
                              const puntosKillT4 = (battleForm.kill_t4 || 0) * 10;
                              const puntosKillT5 = (battleForm.kill_t5 || 0) * 20;
                              const puntosMuertesT4 =
                                (battleForm.own_deaths_t4 || 0) * 5;
                              const puntosMuertesT5 =
                                (battleForm.own_deaths_t5 || 0) * 10;
                              const total =
                                puntosKillT4 +
                                puntosKillT5 +
                                puntosMuertesT4 +
                                puntosMuertesT5;
                              return (
                                <span className="text-green-600">
                                  +{formatNumber(total)} {t("common.points")}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setBattleForm({
                              kill_t4: "",
                              kill_t5: "",
                              own_deaths_t4: "",
                              own_deaths_t5: "",
                              battle_photo: null,
                              deaths_photo: null,
                            });
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t("common.clear")}
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {saving && <ButtonSpinner />}
                          <span>{t("kvk.saveBattle")}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab: Resumen y Puntuación */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {t("kvk.summaryTitle")}
                  </h3>

                  {/* Resumen de Puntuación */}
                  {puntuacion && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        🏆 {t("kvk.detailedScore")}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">{t("kvk.honor")}</p>
                          <p className="text-xl font-bold text-purple-600">
                            +{formatNumber(puntuacion.puntos_honor)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNumber(puntuacion.honor_amount)} × 5
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">{t("kvk.t4KillsThisStage")}</p>
                          <p className="text-xl font-bold text-green-600">
                            +{formatNumber(puntuacion.puntos_kill_t4)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNumber(puntuacion.total_kill_t4_batallas)} × 10
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">{t("kvk.t5KillsThisStage")}</p>
                          <p className="text-xl font-bold text-green-600">
                            +{formatNumber(puntuacion.puntos_kill_t5)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNumber(puntuacion.total_kill_t5_batallas)} × 20
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">{t("kvk.t4Deaths")}</p>
                          <p className="text-xl font-bold text-green-600">
                            +{formatNumber(Math.abs(puntuacion.puntos_muertes_t4))}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNumber(puntuacion.total_muertes_t4_batallas)} × 5
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">{t("kvk.t5Deaths")}</p>
                          <p className="text-xl font-bold text-green-600">
                            +{formatNumber(Math.abs(puntuacion.puntos_muertes_t5))}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatNumber(puntuacion.total_muertes_t5_batallas)} × 10
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
                          <p className="text-sm opacity-90">{t("kvk.total")}</p>
                          <p className="text-2xl font-bold">
                            {formatNumber(puntuacion.puntuacion_total)}
                          </p>
                          <p className="text-xs opacity-90">{t("common.points")}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Datos Iniciales */}
                  {kvkData && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        📊 {t("kvk.initialData")}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">{t("kvk.initialT4Kills")}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatNumber(kvkData.initial_t4_kills)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t("kvk.initialT5Kills")}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatNumber(kvkData.initial_t5_kills)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{t("kvk.initialOwnDeaths")}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatNumber(kvkData.initial_own_deaths)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {t("common.register")} {formatDate(kvkData.fecha_registro)}
                        </p>
                        <div className="flex space-x-4">
                          {kvkData.foto_inicial_url && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                {t("common.points")}
                              </p>
                              <img
                                src={`http://localhost:8000/uploads/${kvkData.foto_inicial_url}`}
                                alt={t("kvk.initialKillsPhoto")}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    `http://localhost:8000/uploads/${kvkData.foto_inicial_url}`
                                  )
                                }
                              />
                            </div>
                          )}
                          {kvkData.foto_muertes_iniciales_url && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">
                                {t("kvk.ownDeathsPhoto")}
                              </p>
                              <img
                                src={`http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`}
                                alt={t("kvk.ownDeathsPhoto")}
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    `http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Honor */}
                  {honorData && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        🏆 {t("kvk.honor")}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {formatNumber(honorData.honor_amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t("common.register")} {formatDate(honorData.fecha_registro)}
                          </p>
                        </div>
                        {honorData.foto_honor_url && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{t("common.photo")}</p>
                            <img
                              src={`http://localhost:8000/uploads/${honorData.foto_honor_url}`}
                              alt={t("kvk.honorPhoto")}
                              className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() =>
                                openImageModal(
                                  `http://localhost:8000/uploads/${honorData.foto_honor_url}`
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Batallas */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      ⚔️ {t("kvk.registeredBattles")}
                    </h4>
                    {batallas.length > 0 ? (
                      <div className="space-y-4">
                        {batallas.map((batalla) => (
                          <div
                            key={batalla.etapa_id}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-800">
                                {batalla.nombre_etapa}
                              </h5>
                              <span className="text-sm text-gray-500">
                                {formatDate(batalla.fecha_registro)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {t("kvk.t4KillsThisStage")}
                                </p>
                                <p className="font-semibold">
                                  {formatNumber(batalla.kill_t4)}
                                </p>
                                <p className="text-xs text-green-600">
                                  +{formatNumber(batalla.kill_t4 * 10)} {t("common.points")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  {t("kvk.t5KillsThisStage")}
                                </p>
                                <p className="font-semibold">
                                  {formatNumber(batalla.kill_t5)}
                                </p>
                                <p className="text-xs text-green-600">
                                  +{formatNumber(batalla.kill_t5 * 20)} {t("common.points")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  {t("kvk.ownT4DeathsThisStage")}
                                </p>
                                <p className="font-semibold">
                                  {formatNumber(batalla.own_deaths_t4)}
                                </p>
                                <p className="text-xs text-green-600">
                                  +{formatNumber(batalla.own_deaths_t4 * 5)} {t("common.points")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">
                                  {t("kvk.ownT5DeathsThisStage")}
                                </p>
                                <p className="font-semibold">
                                  {formatNumber(batalla.own_deaths_t5)}
                                </p>
                                <p className="text-xs text-green-600">
                                  +{formatNumber(batalla.own_deaths_t5 * 10)} {t("common.points")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-4">
                                {batalla.foto_batalla_url && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                      {t("kvk.battlePhoto")}
                                    </p>
                                    <img
                                      src={`http://localhost:8000/uploads/${batalla.foto_batalla_url}`}
                                      alt={t("kvk.battlePhoto")}
                                      className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() =>
                                        openImageModal(
                                          `http://localhost:8000/uploads/${batalla.foto_batalla_url}`
                                        )
                                      }
                                    />
                                  </div>
                                )}
                                {batalla.foto_muertes_url && (
                                  <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                      {t("kvk.deathsPhoto")}
                                    </p>
                                    <img
                                      src={`http://localhost:8000/uploads/${batalla.foto_muertes_url}`}
                                      alt={t("kvk.deathsPhoto")}
                                      className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() =>
                                        openImageModal(
                                          `http://localhost:8000/uploads/${batalla.foto_muertes_url}`
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {t("kvk.battlePointsShort")}
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                  +
                                  {formatNumber(
                                    batalla.kill_t4 * 10 +
                                      batalla.kill_t5 * 20 +
                                      batalla.own_deaths_t4 * 5 +
                                      batalla.own_deaths_t5 * 10
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚔️</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          {t("kvk.noBattles")}
                        </h3>
                        <p className="text-gray-500">{t("kvk.noBattlesDesc")}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de imagen */}
      <ImageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        imageSrc={modalImage}
      />
    </div>
  );
};

export default KvKPage;