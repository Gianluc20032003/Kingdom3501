// components/kvk/HonorTab.jsx - CON SISTEMA DE BLOQUEO

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useAlert } from "../../contexts/AlertContext";
import { validateFile, createFormData } from "../../utils/helpers";
import { kvkAPI } from "../../services/api";
import { ButtonSpinner } from "../ui/LoadingSpinner";
import { getImageUrl } from "../../utils/helpers";

const HonorTab = ({
  honorData,
  honorForm,
  setHonorForm,
  saving,
  setSaving,
  onDataSaved,
  onImageClick,
  isLocked = false, // NUEVO: Prop para saber si está bloqueado
  lockMessage = "El registro de Honor está temporalmente deshabilitado", // NUEVO: Mensaje personalizable
}) => {
  const { t, formatNumber } = useTranslation();
  const { showAlert } = useAlert();

  const handleInputChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NUEVO: Verificar si está bloqueado antes de procesar
    if (isLocked) {
      showAlert("No puedes registrar Honor en este momento", "error");
      return;
    }

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
          honor_cantidad: honorForm.honor_amount,
          foto_honor: honorForm.honor_photo,
        },
        ["foto_honor"]
      );

      const response = await kvkAPI.saveHonor(submitData);

      if (response.success) {
        showAlert(t("kvk.dataSaved"), "success");
        onDataSaved();
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

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">
        🏆 {t("kvk.honorObtained")}
      </h3>

      {/* NUEVO: Mensaje de bloqueo */}
      {isLocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="ml-3">
              <h4 className="text-red-800 font-semibold">
                Registro Bloqueado
              </h4>
              <p className="text-red-700 text-sm mt-1">
                {lockMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          <span className="font-semibold">💡 </span>
          {t("kvk.honorScoring")}
        </p>
      </div>

      {/* NUEVO: Overlay de bloqueo sobre el formulario */}
      <div className={`relative ${isLocked ? 'pointer-events-none' : ''}`}>
        {/* NUEVO: Overlay visual cuando está bloqueado */}
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
                {t("kvk.honorAmount")}
              </label>
              <input
                type="number"
                name="honor_amount"
                value={honorForm.honor_amount}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isLocked ? 'bg-gray-100 text-gray-500' : ''
                }`}
                placeholder="Ex: 10000"
                min="0"
                required
                disabled={isLocked} // NUEVO: Deshabilitar cuando está bloqueado
              />
              <p className="text-sm text-gray-500 mt-1">
                {t("kvk.honorAmountDesc")}
              </p>
              {honorForm.honor_amount && !isLocked && (
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
                onChange={handleInputChange}
                accept="image/*"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  isLocked ? 'bg-gray-100 text-gray-500' : ''
                }`}
                required={!honorData}
                disabled={isLocked} // NUEVO: Deshabilitar cuando está bloqueado
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
                      onImageClick(
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
                      src={getImageUrl(honorData.foto_honor_url)}
                      alt={t("kvk.honorPhoto")}
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        onImageClick(getImageUrl(honorData.foto_honor_url))
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
                isLocked ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLocked} // NUEVO: Deshabilitar cuando está bloqueado
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving || isLocked} // NUEVO: Deshabilitar cuando está bloqueado
              className={`px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2 ${
                isLocked ? 'cursor-not-allowed' : ''
              }`}
            >
              {saving && <ButtonSpinner />}
              <span>
                {isLocked ? '🔒 Bloqueado' : (
                  <>
                    {honorData ? t("common.update") : t("common.register")}{" "}
                    {t("kvk.honor")}
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HonorTab;