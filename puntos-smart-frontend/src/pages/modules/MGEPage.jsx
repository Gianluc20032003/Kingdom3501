import React, { useState, useEffect } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { useTranslation } from "../../contexts/TranslationContext";
import { mgeAPI } from "../../services/api";
import { validateFile, createFormData } from "../../utils/helpers";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import ImageModal from "../../components/ui/ImageModal";
import { getImageUrl } from "../../utils/helpers";

const MGEPage = () => {
  const { showAlert } = useAlert();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [formData, setFormData] = useState({
    comandante_principal: "",
    comandante_pareja: "",
    foto_equipamiento: null,
    foto_inscripciones: null,
    foto_comandantes: null,
    foto_cabezas: null,
  });

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    try {
      setLoading(true);

      const [configResponse, userResponse] = await Promise.all([
        mgeAPI.getConfig(),
        mgeAPI.getUserData(),
      ]);

      setConfig(configResponse.data);
      setUserData(userResponse.data);

      if (userResponse.data) {
        setFormData((prev) => ({
          ...prev,
          comandante_principal: userResponse.data.comandante_principal || "",
          comandante_pareja: userResponse.data.comandante_pareja || "",
        }));
      }
    } catch (error) {
      console.error("Error loading MGE data:", error);
      if (error.message.includes("No hay eventos MGE activos")) {
        showAlert(t("mge.noActiveEvents"), "info");
      } else {
        showAlert(t("errors.loadingData") + ": " + error.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(", "), "error");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.comandante_principal.trim()) {
      showAlert(t("mge.mainCommanderRequired"), "error");
      return;
    }

    const isNewRecord = !userData;
    const fotoFields = {
      foto_equipamiento: t("mge.equipmentPhoto"),
      foto_inscripciones: t("mge.inscriptionsPhoto"),
      foto_comandantes: t("mge.commandersPhoto"),
      foto_cabezas: t("mge.legendaryHeadsPhoto"),
    };

    if (isNewRecord) {
      for (const [field, fieldName] of Object.entries(fotoFields)) {
        if (!formData[field]) {
          showAlert(
            t("mge.photoRequired", { photo: fieldName.toLowerCase() }),
            "error"
          );
          return;
        }
      }
    }

    try {
      setSaving(true);

      const submitData = createFormData(
        {
          comandante_principal: formData.comandante_principal,
          comandante_pareja: formData.comandante_pareja,
          foto_equipamiento: formData.foto_equipamiento,
          foto_inscripciones: formData.foto_inscripciones,
          foto_comandantes: formData.foto_comandantes,
          foto_cabezas: formData.foto_cabezas,
        },
        [
          "foto_equipamiento",
          "foto_inscripciones",
          "foto_comandantes",
          "foto_cabezas",
        ]
      );

      const response = await mgeAPI.save(submitData);

      if (response.success) {
        showAlert(t("mge.dataSaved"), "success");
        await loadModuleData();
      } else {
        showAlert(response.message || t("errors.savingData"), "error");
      }
    } catch (error) {
      console.error("Error saving MGE data:", error);
      showAlert(t("errors.savingData") + ": " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  const getTipoTropaIcon = (tipo) => {
    const iconos = {
      arqueria: "🏹",
      infanteria: "🛡️",
      caballeria: "🐎",
      liderazgo: "👑",
      ingenieros: "🔧",
    };
    return iconos[tipo] || "⚔️";
  };

  const getTipoTropaColor = (tipo) => {
    const colores = {
      arqueria: "text-green-600 bg-green-50",
      infanteria: "text-blue-600 bg-blue-50",
      caballeria: "text-purple-600 bg-purple-50",
      liderazgo: "text-yellow-600 bg-yellow-50",
      ingenieros: "text-gray-600 bg-gray-50",
    };
    return colores[tipo] || "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
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

  if (!config) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {t("mge.title")}
              </h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="text-4xl mb-4">⏳</div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  {t("mge.noActiveEvents")}
                </h3>
                <p className="text-yellow-700">{t("mge.noActiveEventsDesc")}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isUpdate = userData;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  🏆 {t("mge.title")}
                </h1>
                <p className="text-gray-600">{t("mge.subtitle")}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {t("mge.eventType")}
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getTipoTropaColor(
                    config.tipo_tropa
                  )}`}
                >
                  <span className="mr-1">
                    {getTipoTropaIcon(config.tipo_tropa)}
                  </span>
                  {config.tipo_tropa_display}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ➕{" "}
              {isUpdate
                ? t("mge.updateApplication")
                : t("mge.registerApplication")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Comandantes */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("mge.commanders")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {t("mge.mainCommander")} *
                    </label>
                    <input
                      type="text"
                      name="comandante_principal"
                      value={formData.comandante_principal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t("mge.mainCommanderPlaceholder")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      {t("mge.pairCommander")}
                    </label>
                    <input
                      type="text"
                      name="comandante_pareja"
                      value={formData.comandante_pareja}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder={t("mge.pairCommanderPlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Fotos */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("mge.requiredEvidence")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Equipamiento */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      🛡️ {t("mge.equipmentPhoto")} *
                    </label>
                    <input
                      type="file"
                      name="foto_equipamiento"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={!isUpdate}
                    />
                    <div className="mt-3 flex items-start space-x-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t("common.example")}:
                        </p>
                        <img
                          src="https://servicios.puntossmart.com/img/equip.jpg"
                          alt={t("kvk.ownDeathsPhoto")}
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            openImageModal(
                              "https://servicios.puntossmart.com/img/equip.jpg"
                            )
                          }
                        />
                      </div>
                      {userData?.foto_equipamiento_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">
                            {t("common.currentImage")}:
                          </p>
                          <img
                            src={getImageUrl(userData.foto_equipamiento_url)}
                            alt={t("mge.equipmentPhoto")}
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              openImageModal(
                                getImageUrl(userData.foto_equipamiento_url)
                              )
                            }
                          />
                        </div>
                      )}{" "}
                    </div>
                  </div>

                  {/* Inscripciones */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      📋 {t("mge.inscriptionsPhoto")} *
                    </label>
                    <input
                      type="file"
                      name="foto_inscripciones"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={!isUpdate}
                    />
                    <div className="mt-3 flex items-start space-x-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t("common.example")}:
                        </p>
                        <img
                          src="https://servicios.puntossmart.com/img/inscrip.jpg"
                          alt={t("kvk.ownDeathsPhoto")}
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            openImageModal(
                              "https://servicios.puntossmart.com/img/inscrip.jpg"
                            )
                          }
                        />
                      </div>
                      {userData?.foto_inscripciones_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">
                            {t("common.currentImage")}:
                          </p>
                          <img
                            src={getImageUrl(userData.foto_inscripciones_url)}
                            alt={t("mge.inscriptionsPhoto")}
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              openImageModal(
                                getImageUrl(userData.foto_inscripciones_url)
                              )
                            }
                          />
                        </div>
                      )}{" "}
                    </div>
                  </div>

                  {/* Comandantes */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      👨‍💼 {t("mge.commandersPhoto")} *
                    </label>
                    <input
                      type="file"
                      name="foto_comandantes"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={!isUpdate}
                    />
                    <div className="mt-3 flex items-start space-x-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t("common.example")}:
                        </p>
                        <img
                          src="https://servicios.puntossmart.com/img/cmr.jpg"
                          alt={t("kvk.ownDeathsPhoto")}
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            openImageModal(
                              "https://servicios.puntossmart.com/img/cmr.jpg"
                            )
                          }
                        />
                      </div>
                      {userData?.foto_comandantes_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">
                            {t("common.currentImage")}:
                          </p>
                          <img
                            src={getImageUrl(userData.foto_comandantes_url)}
                            alt={t("mge.commandersPhoto")}
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              openImageModal(
                                getImageUrl(userData.foto_comandantes_url)
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cabezas Legendarias */}
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      💀 {t("mge.legendaryHeadsPhoto")} *
                    </label>
                    <input
                      type="file"
                      name="foto_cabezas"
                      onChange={handleInputChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required={!isUpdate}
                    />

                    <div className="mt-3 flex items-start space-x-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          {t("common.example")}:
                        </p>
                        <img
                          src="https://servicios.puntossmart.com/img/head.jpg"
                          alt={t("kvk.ownDeathsPhoto")}
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            openImageModal(
                              "https://servicios.puntossmart.com/img/head.jpg"
                            )
                          }
                        />
                      </div>
                      {userData?.foto_cabezas_url && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-1">
                            {t("common.currentImage")}:
                          </p>
                          <img
                            src={getImageUrl(userData.foto_cabezas_url)}
                            alt={t("mge.legendaryHeadsPhoto")}
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              openImageModal(
                                getImageUrl(userData.foto_cabezas_url)
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving && <ButtonSpinner />}
                  <span>
                    {isUpdate
                      ? t("mge.updateApplication")
                      : t("mge.registerApplication")}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Info adicional */}
          {userData && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {t("mge.applicationRegistered")}
                  </h3>
                  <p className="text-green-700">
                    {t("mge.applicationRegisteredDesc", {
                      type: config.tipo_tropa_display,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
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

export default MGEPage;
