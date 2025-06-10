// components/kvk/InitialDataTab.jsx - Tab de datos iniciales con poder actual

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useAlert } from "../../contexts/AlertContext";
import { validateFile, createFormData } from "../../utils/helpers";
import { kvkAPI } from "../../services/api";
import { ButtonSpinner } from "../ui/LoadingSpinner";

const InitialDataTab = ({
  kvkData,
  initialForm,
  setInitialForm,
  saving,
  setSaving,
  onDataSaved,
  onImageClick,
}) => {
  const { t } = useTranslation();
  const { showAlert } = useAlert();

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
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
    // NUEVA VALIDACIÓN PARA PODER ACTUAL
    if (!initialForm.current_power || initialForm.current_power < 0) {
      showAlert(t("kvk.validCurrentPower"), "error");
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
          kill_t4_iniciales: initialForm.initial_t4_kills,
          kill_t5_iniciales: initialForm.initial_t5_kills,
          muertes_propias_iniciales: initialForm.initial_own_deaths,
          current_power: initialForm.current_power,
          foto_inicial: initialForm.initial_kills_photo,
          foto_muertes_iniciales: initialForm.initial_deaths_photo,
        },
        ["foto_inicial", "foto_muertes_iniciales"]
      );

      const response = await kvkAPI.saveInitial(submitData);

      if (response.success) {
        showAlert(t("kvk.dataSaved"), "success");
        onDataSaved();
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">
        {t("kvk.killsAndDeathsBeforeKvk")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fotos */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t("kvk.initialKillsPhoto")}
            </label>
            <input
              type="file"
              name="initial_kills_photo"
              onChange={handleInputChange}
              accept="image/*"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required={!kvkData}
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("kvk.initialKillsDesc")}
            </p>

            <div className="mt-3 flex items-start space-x-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {t("common.example")}:
                </p>
                <img
                  src="https://servicios.puntossmart.com/img/illsexample.jpg"
                  alt={t("kvk.initialKillsPhoto")}
                  className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    onImageClick(
                      "https://servicios.puntossmart.com/img/illsexample.jpg"
                    )
                  }
                />
              </div>

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
                      onImageClick(
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
              onChange={handleInputChange}
              accept="image/*"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required={!kvkData}
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("kvk.ownDeathsDesc")}
            </p>

            <div className="mt-3 flex items-start space-x-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {t("common.example")}:
                </p>
                <img
                  src="https://servicios.puntossmart.com/img/eathexample.jpg"
                  alt={t("kvk.ownDeathsPhoto")}
                  className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    onImageClick(
                      "https://servicios.puntossmart.com/img/eathexample.jpg"
                    )
                  }
                />
              </div>

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
                      onImageClick(
                        `http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Campos numéricos - reorganizados */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              {t("kvk.initialT4Kills")}
            </label>
            <input
              type="number"
              name="initial_t4_kills"
              value={initialForm.initial_t4_kills}
              onChange={handleInputChange}
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
              {t("kvk.initialT5Kills")}
            </label>
            <input
              type="number"
              name="initial_t5_kills"
              value={initialForm.initial_t5_kills}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: 25000"
              min="0"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("kvk.initialT5KillsDesc")}
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
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: 50000"
              min="0"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("kvk.initialOwnDeathsDesc")}
            </p>
          </div>

          {/* NUEVO CAMPO: Poder Actual */}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              💪 {t("kvk.currentPower")}
            </label>
            <input
              type="number"
              name="current_power"
              value={initialForm.current_power}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Ex: 120000000"
              min="0"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              {t("kvk.currentPowerDesc")}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
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
  );
};

export default InitialDataTab;
