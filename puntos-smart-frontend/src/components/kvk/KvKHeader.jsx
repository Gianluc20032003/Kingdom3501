// components/kvk/KvKHeader.jsx - Componente del header con puntuación

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";

const KvKHeader = ({ puntuacion }) => {
  const { t, formatNumber } = useTranslation();

  return (
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
  );
};

export default KvKHeader;