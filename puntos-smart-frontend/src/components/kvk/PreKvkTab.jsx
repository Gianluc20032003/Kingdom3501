// components/kvk/PreKvkTab.jsx
import React, { useEffect } from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useAlert } from "../../contexts/AlertContext";
import { validateFile, createFormData, getImageUrl } from "../../utils/helpers";
import { kvkAPI } from "../../services/api";
import { ButtonSpinner } from "../ui/LoadingSpinner";

// Función auxiliar para obtener el ícono del ranking (similar a la tabla de movilización)
const getRankingIcon = (index) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return index + 1;
};

// Función auxiliar para formatear la fecha (ajusta según tu formato deseado)
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString();
};

const PreKvkTab = ({
  preKvkData,
  preKvkForm,
  setPreKvkForm,
  saving,
  setSaving,
  onDataSaved,
  onImageClick,
  rankingData, // Datos del ranking
  isLocked = false,
  lockMessage = "El registro de Pre-KvK está temporalmente deshabilitado",
}) => {
  const { t, formatNumber } = useTranslation();
  const { showAlert } = useAlert();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "foto_puntos_kvk" && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(", "), "error");
        e.target.value = "";
        return;
      }

      setPreKvkForm((prev) => ({ ...prev, [name]: file }));
    } else {
      setPreKvkForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      showAlert("No puedes registrar Pre-KvK en este momento", "error");
      return;
    }

    if (!preKvkForm.puntos_kvk || preKvkForm.puntos_kvk < 0) {
      showAlert(t("kvk.validPreKvkPoints"), "error");
      return;
    }

    const isNewRecord = !preKvkData;
    if (isNewRecord && !preKvkForm.foto_puntos_kvk) {
      showAlert(t("kvk.preKvkPhotoRequired"), "error");
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData(
        {
          puntos_kvk: preKvkForm.puntos_kvk,
          foto_puntos_kvk: preKvkForm.foto_puntos_kvk,
        },
        ["foto_puntos_kvk"]
      );

      const response = await kvkAPI.savePreKvk(submitData);

      if (response.success) {
        showAlert(t("kvk.dataSaved"), "success");
        onDataSaved();
      } else {
        showAlert(response.message || t("kvk.saveError"), "error");
      }
    } catch (error) {
      console.error("Error saving pre-kvk data:", error);
      showAlert(t("errors.savingData") + ": " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">
        🎯 {t("kvk.preKvkTitle")}
      </h3>

      {/* Mensaje de bloqueo */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-3">
              <h4 className="text-red-800 font-semibold">Registro Bloqueado</h4>
              <p className="text-red-700 text-sm mt-1">{lockMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          <span className="font-semibold">💡 </span>
          {t("kvk.preKvkDescription")}
        </p>
      </div>

      {/* Formulario */}
      <div className={`relative ${isLocked ? "pointer-events-none" : ""}`}>
        {isLocked && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-75 rounded-lg z-10 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl text-gray-400">🔒</span>
              <p className="text-gray-600 font-semibold mt-2">
                Temporalmente Deshabilitado
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("kvk.preKvkPoints")}
              </label>
              <input
                type="number"
                name="puntos_kvk"
                value={preKvkForm.puntos_kvk}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isLocked ? "bg-gray-100 text-gray-500" : ""
                }`}
                placeholder="Ex: 150000"
                min="0"
                required
                disabled={isLocked}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("kvk.preKvkPhoto")}
              </label>
              <input
                type="file"
                name="foto_puntos_kvk"
                onChange={handleInputChange}
                accept="image/*"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isLocked ? "bg-gray-100 text-gray-500" : ""
                }`}
                required={!preKvkData}
                disabled={isLocked}
              />
              <p className="text-sm text-gray-500 mt-1">
                {t("kvk.preKvkPhotoDesc")}
              </p>
              <div className="mt-3 flex items-start space-x-6">
                <div>
                  <p className="text-base text-white mb-2 font-semibold bg-red-600 rounded-md text-center">
                    {t("common.example")}:
                  </p>
                  <img
                    src="https://servicios.puntossmart.com/img/puntos-ejemplo.jpg"
                    alt={t("kvk.preKvkPhoto")}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      onImageClick(
                        "https://servicios.puntossmart.com/img/puntos-ejemplo.jpg"
                      )
                    }
                  />
                </div>
                {preKvkData?.foto_puntos_kvk_url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {t("common.currentImage")}:
                    </p>
                    <img
                      src={getImageUrl(preKvkData.foto_puntos_kvk_url)}
                      alt={t("kvk.preKvkPhoto")}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        onImageClick(
                          getImageUrl(preKvkData.foto_puntos_kvk_url)
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
              onClick={() => window.location.reload()}
              className={`px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLocked}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving || isLocked}
              className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                isLocked ? "cursor-not-allowed" : ""
              }`}
            >
              {saving && <ButtonSpinner />}
              <span>
                {isLocked
                  ? "🔒 Bloqueado"
                  : preKvkData
                  ? t("common.update")
                  : t("common.register") + " " + t("kvk.preKvk")}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de ranking */}
      <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🏆 {t("kvk.preKvkRanking")}
        </h2>

        {rankingData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t("common.position")}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t("common.user")}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {t("kvk.preKvkPoints")}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    {t("kvk.preKvkPhoto")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankingData.map((player, index) => (
                  <tr
                    key={player.usuario_id}
                    className={`border-t hover:bg-gray-50 transition-colors ${
                      player.es_usuario_actual
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {getRankingIcon(index)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className={`font-semibold ${
                          player.es_usuario_actual
                            ? "text-blue-600"
                            : "text-gray-800"
                        }`}
                      >
                        {player.username}
                        {player.es_usuario_actual && (
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {t("common.you")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-lg font-bold">
                        {formatNumber(player.puntos_kvk)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {player.foto_puntos_kvk_url ? (
                        <img
                          src={getImageUrl(player.foto_puntos_kvk_url)}
                          alt={`${player.username}'s photo`}
                          className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            onImageClick(
                              getImageUrl(player.foto_puntos_kvk_url)
                            )
                          }
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {t("common.noPhoto")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t("kvk.noRankingData")}
            </h3>
            <p className="text-gray-500">{t("kvk.noRankingDesc")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreKvkTab;
