// components/admin/KvkGlobalStats.jsx
import React from "react";

const KvkGlobalStats = ({ ranking, parseNumberSafely, formatNumber }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">📈 Estadísticas Globales</h2>

      {/* GRID DE 6 COLUMNAS - 2 FILAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* FILA 1: MÉTRICAS PRINCIPALES */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-700">Usuarios Participando</p>
          <p className="text-2xl font-bold text-purple-600">{ranking.length}</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-green-700">Total Kills T4</p>
          <p className="text-2xl font-bold text-green-600">
            {(() => {
              const total = ranking.reduce((sum, user) => {
                const value = parseNumberSafely(user.total_kill_t4_batallas);
                return sum + value;
              }, 0);
              return formatNumber(total);
            })()}
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-700">Total Kills T5</p>
          <p className="text-2xl font-bold text-blue-600">
            {(() => {
              const total = ranking.reduce((sum, user) => {
                const value = parseNumberSafely(user.total_kill_t5_batallas);
                return sum + value;
              }, 0);
              return formatNumber(total);
            })()}
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <p className="text-sm text-red-700">Total Muertes T4</p>
          <p className="text-2xl font-bold text-red-600">
            {(() => {
              const total = ranking.reduce((sum, user) => {
                const value = parseNumberSafely(user.total_muertes_t4_batallas);
                return sum + value;
              }, 0);
              return formatNumber(total);
            })()}
          </p>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4">
          <p className="text-sm text-pink-700">Total Muertes T5</p>
          <p className="text-2xl font-bold text-pink-600">
            {(() => {
              const total = ranking.reduce((sum, user) => {
                const value = parseNumberSafely(user.total_muertes_t5_batallas);
                return sum + value;
              }, 0);
              return formatNumber(total);
            })()}
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-sm text-orange-700">Total Honor</p>
          <p className="text-2xl font-bold text-orange-600">
            {(() => {
              const total = ranking.reduce((sum, user) => {
                const value = parseNumberSafely(user.honor_cantidad);
                return sum + value;
              }, 0);
              return formatNumber(total);
            })()}
          </p>
        </div>
      </div>

      {/* ESTADÍSTICAS ADICIONALES */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Métricas Calculadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* RATIO KILLS/MUERTES T4 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">Ratio Kills/Muertes T4</p>
            <p className="text-xl font-bold text-gray-800">
              {(() => {
                const totalKillsT4 = ranking.reduce(
                  (sum, user) => sum + parseNumberSafely(user.total_kill_t4_batallas),
                  0
                );
                const totalMuertesT4 = ranking.reduce(
                  (sum, user) => sum + parseNumberSafely(user.total_muertes_t4_batallas),
                  0
                );
                const ratio =
                  totalMuertesT4 > 0
                    ? (totalKillsT4 / totalMuertesT4).toFixed(2)
                    : "∞";
                return `${ratio}:1`;
              })()}
            </p>
          </div>

          {/* RATIO KILLS/MUERTES T5 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">Ratio Kills/Muertes T5</p>
            <p className="text-xl font-bold text-gray-800">
              {(() => {
                const totalKillsT5 = ranking.reduce(
                  (sum, user) => sum + parseNumberSafely(user.total_kill_t5_batallas),
                  0
                );
                const totalMuertesT5 = ranking.reduce(
                  (sum, user) => sum + parseNumberSafely(user.total_muertes_t5_batallas),
                  0
                );
                const ratio =
                  totalMuertesT5 > 0
                    ? (totalKillsT5 / totalMuertesT5).toFixed(2)
                    : "∞";
                return `${ratio}:1`;
              })()}
            </p>
          </div>

          {/* PROMEDIO HONOR POR USUARIO */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700">Honor Promedio</p>
            <p className="text-xl font-bold text-gray-800">
              {(() => {
                const totalHonor = ranking.reduce(
                  (sum, user) => sum + parseNumberSafely(user.honor_cantidad),
                  0
                );
                const promedio =
                  ranking.length > 0 ? Math.round(totalHonor / ranking.length) : 0;
                return formatNumber(promedio);
              })()}
            </p>
          </div>

          {/* PUNTUACIÓN TOTAL */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <p className="text-sm text-yellow-700">Puntuación Total</p>
            <p className="text-xl font-bold text-yellow-600">
              {(() => {
                const totalPuntos = ranking.reduce(
                  (sum, user) => sum + parseNumberSafely(user.puntuacion_total),
                  0
                );
                return formatNumber(totalPuntos);
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KvkGlobalStats;