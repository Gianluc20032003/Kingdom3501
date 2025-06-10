// components/kvk/HonorTab.jsx - CORREGIDO para enviar nombres correctos al backend

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useAlert } from "../../contexts/AlertContext";
import { validateFile, createFormData } from "../../utils/helpers";
import { kvkAPI } from "../../services/api";
import { ButtonSpinner } from "../ui/LoadingSpinner";

const HonorTab = ({ 
  honorData, 
  honorForm, 
  setHonorForm, 
  saving, 
  setSaving, 
  onDataSaved,
  onImageClick 
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

      // MAPEAR NOMBRES DEL FRONTEND A LOS QUE ESPERA EL BACKEND
      const submitData = createFormData(
        {
          honor_cantidad: honorForm.honor_amount,  // Frontend: honor_amount → Backend: honor_cantidad
          foto_honor: honorForm.honor_photo,       // Frontend: honor_photo → Backend: foto_honor
        },
        ["foto_honor"]  // Cambiar aquí también el nombre
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          <span className="font-semibold">💡 </span>
          {t("kvk.honorScoring")}
        </p>
      </div>

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
              onChange={handleInputChange}
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
                  onClick={() => onImageClick("https://servicios.puntossmart.com/img/norho.png")}
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
                    onClick={() => onImageClick(`http://localhost:8000/uploads/${honorData.foto_honor_url}`)}
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
  );
};

export default HonorTab;