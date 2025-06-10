// components/kvk/SummaryTab.jsx - Tab de resumen y puntuación CORREGIDO

import React from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { getImageUrl } from "../../utils/helpers";

const SummaryTab = ({
  puntuacion,
  kvkData,
  honorData,
  batallas,
  onImageClick,
}) => {
  const { t, formatNumber, formatDate } = useTranslation();

  return (
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
                {formatNumber(puntuacion.honor_cantidad)} × 5
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                {t("kvk.t4KillsThisStage")}
              </p>
              <p className="text-xl font-bold text-green-600">
                +{formatNumber(puntuacion.puntos_kill_t4)}
              </p>
              <p className="text-xs text-gray-400">
                {formatNumber(puntuacion.total_kill_t4_batallas)} × 10
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                {t("kvk.t5KillsThisStage")}
              </p>
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

      {/* Datos Iniciales - CORREGIDO CON NOMBRES DE BD */}
      {kvkData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">
            📊 {t("kvk.initialData")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-500">{t("kvk.initialT4Kills")}</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(kvkData.kill_t4_iniciales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("kvk.initialT5Kills")}</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(kvkData.kill_t5_iniciales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("kvk.initialOwnDeaths")}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(kvkData.muertes_propias_iniciales)}
              </p>
            </div>
            {/* CAMPO PODER ACTUAL - CORREGIDO */}
            {kvkData.current_power && (
              <div>
                <p className="text-sm text-gray-500">
                  💪 {t("kvk.currentPower")}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(kvkData.current_power)}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t("common.register")} {formatDate(kvkData.fecha_registro)}
            </p>
            <div className="flex space-x-4">
              {kvkData.foto_inicial_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t("kvk.initialKillsPhoto")}
                  </p>
                  <img
                    src={getImageUrl(kvkData.foto_inicial_url)}
                    alt={t("kvk.initialKillsPhoto")}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      onImageClick(getImageUrl(kvkData.foto_inicial_url))
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
                    src={getImageUrl(kvkData.foto_muertes_iniciales_url)}
                    alt={t("kvk.ownDeathsPhoto")}
                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      onImageClick(
                        getImageUrl(kvkData.foto_muertes_iniciales_url)
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Honor - CORREGIDO CON NOMBRES DE BD */}
      {honorData && (
        <div className="bg-yellow-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">
            🏆 {t("kvk.honor")}
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {formatNumber(honorData.honor_cantidad)}
              </p>
              <p className="text-sm text-gray-500">
                {t("common.register")} {formatDate(honorData.fecha_registro)}
              </p>
            </div>
            {honorData.foto_honor_url && (
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t("common.photo")}
                </p>
                <img
                  src={getImageUrl(honorData.foto_honor_url)}
                  alt={t("kvk.honorPhoto")}
                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    onImageClick(getImageUrl(honorData.foto_honor_url))
                  }
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batallas - CORREGIDO CON NOMBRES DE BD */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">
          ⚔️ {t("kvk.registeredBattles")}
        </h4>
        {batallas.length > 0 ? (
          <div className="space-y-4">
            {batallas.map((batalla) => (
              <div key={batalla.etapa_id} className="bg-gray-50 rounded-lg p-4">
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
                      {formatNumber(batalla.muertes_propias_t4)}
                    </p>
                    <p className="text-xs text-green-600">
                      +{formatNumber(batalla.muertes_propias_t4 * 5)}{" "}
                      {t("common.points")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {t("kvk.ownT5DeathsThisStage")}
                    </p>
                    <p className="font-semibold">
                      {formatNumber(batalla.muertes_propias_t5)}
                    </p>
                    <p className="text-xs text-green-600">
                      +{formatNumber(batalla.muertes_propias_t5 * 10)}{" "}
                      {t("common.points")}
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
                          src={getImageUrl(batalla.foto_batalla_url)}
                          alt={t("kvk.battlePhoto")}
                          className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            onImageClick(getImageUrl(batalla.foto_batalla_url))
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
                          src={getImageUrl(batalla.foto_muertes_url)}
                          alt={t("kvk.deathsPhoto")}
                          className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            onImageClick(getImageUrl(batalla.foto_muertes_url))
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
                          batalla.muertes_propias_t4 * 5 +
                          batalla.muertes_propias_t5 * 10
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
  );
};

export default SummaryTab;
