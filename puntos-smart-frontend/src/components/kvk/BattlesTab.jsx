// components/kvk/BattlesTab.jsx - Tab de batallas

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useAlert } from "../../contexts/AlertContext";
import { validateFile, createFormData } from "../../utils/helpers";
import { kvkAPI } from "../../services/api";
import { ButtonSpinner } from "../ui/LoadingSpinner";

const BattlesTab = ({ 
  etapaActiva, 
  batallas, 
  battleForm, 
  setBattleForm, 
  saving, 
  setSaving, 
  onDataSaved,
  onImageClick 
}) => {
  const { t, formatNumber } = useTranslation();
  const { showAlert } = useAlert();

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
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
        onDataSaved();
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

  const clearForm = () => {
    setBattleForm({
      kill_t4: "",
      kill_t5: "",
      own_deaths_t4: "",
      own_deaths_t5: "",
      battle_photo: null,
      deaths_photo: null,
    });
  };

  // Calcular puntos de preview
  const calculatePreviewPoints = () => {
    const puntosKillT4 = (battleForm.kill_t4 || 0) * 10;
    const puntosKillT5 = (battleForm.kill_t5 || 0) * 20;
    const puntosMuertesT4 = (battleForm.own_deaths_t4 || 0) * 5;
    const puntosMuertesT5 = (battleForm.own_deaths_t5 || 0) * 10;
    return puntosKillT4 + puntosKillT5 + puntosMuertesT4 + puntosMuertesT5;
  };

  const hasPreviewData = battleForm.kill_t4 || battleForm.kill_t5 || 
                        battleForm.own_deaths_t4 || battleForm.own_deaths_t5;

  return (
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {t("kvk.t4KillsThisStage")}
              </label>
              <input
                type="number"
                name="kill_t4"
                value={battleForm.kill_t4}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {battleForm.kill_t4 && (
                <p className="text-sm text-green-600 mt-1">
                  {t("common.points")}: +{formatNumber(battleForm.kill_t4 * 10)}
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
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {battleForm.own_deaths_t4 && (
                <p className="text-sm text-green-600 mt-1">
                  {t("common.points")}: +{formatNumber(battleForm.own_deaths_t4 * 5)}
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
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {battleForm.kill_t5 && (
                <p className="text-sm text-green-600 mt-1">
                  {t("common.points")}: +{formatNumber(battleForm.kill_t5 * 20)}
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
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {battleForm.own_deaths_t5 && (
                <p className="text-sm text-green-600 mt-1">
                  {t("common.points")}: +{formatNumber(battleForm.own_deaths_t5 * 10)}
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
                onChange={handleInputChange}
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t("kvk.battlePhotoDesc")}
              </p>
              <div className="mt-3">
                <p className="text-base text-white mb-2 font-semibold bg-red-600 rounded-md text-center">
                  {t("common.example")}:
                </p>
                <img
                  src="https://servicios.puntossmart.com/img/illsexample.jpg"
                  alt={t("kvk.battlePhoto")}
                  className="w-40 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onImageClick("https://servicios.puntossmart.com/img/illsexample.jpg")}
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
                onChange={handleInputChange}
                accept="image/*"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {t("kvk.deathsPhotoDesc")}
              </p>
              <div className="mt-3">
                <p className="text-base text-white mb-2 font-semibold bg-red-600 rounded-md text-center">
                  {t("common.example")}:
                </p>
                <img
                  src="https://servicios.puntossmart.com/img/hero.jpg"
                  alt={t("kvk.deathsPhoto")}
                  className="w-40 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onImageClick("https://servicios.puntossmart.com/img/hero.jpg")}
                />
              </div>
            </div>
          </div>

          {/* Preview de puntos de esta batalla */}
          {hasPreviewData && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                {t("kvk.battlePoints")}
              </h4>
              <div className="text-lg font-bold text-center">
                <span className="text-green-600">
                  +{formatNumber(calculatePreviewPoints())} {t("common.points")}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={clearForm}
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
  );
};

export default BattlesTab;