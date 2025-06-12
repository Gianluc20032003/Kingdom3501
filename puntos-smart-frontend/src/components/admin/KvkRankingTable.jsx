// components/admin/KvkRankingTable.jsx
import React from "react";

const KvkRankingTable = ({ ranking, indexOfFirstItem, onUserSelect, formatNumber }) => {
  const getMedalEmoji = (position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return position;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <th className="p-3 text-left font-semibold">Pos.</th>
            <th className="p-3 text-left font-semibold">Usuario</th>
            <th className="p-3 text-left font-semibold">Honor</th>
            <th className="p-3 text-left font-semibold">Kills T4</th>
            <th className="p-3 text-left font-semibold">Kills T5</th>
            <th className="p-3 text-left font-semibold">Muertes T4</th>
            <th className="p-3 text-left font-semibold">Muertes T5</th>
            <th className="p-3 text-left font-semibold">Poder Inicial</th>
            <th className="p-3 text-left font-semibold">Puntuación</th>
            <th className="p-3 text-left font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((user, index) => {
            const globalPosition = indexOfFirstItem + index + 1;

            return (
              <tr
                key={user.usuario_id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 font-bold text-lg">
                  {getMedalEmoji(globalPosition)}
                </td>
                <td className="p-3 font-semibold text-gray-800">
                  {user.nombre_usuario}
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-semibold">
                      {formatNumber(user.honor_cantidad || 0)}
                    </div>
                    <div className="text-xs text-purple-600">
                      +{formatNumber(user.puntos_honor || 0)} pts
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-semibold">
                      {formatNumber(user.total_kill_t4_batallas || 0)}
                    </div>
                    <div className="text-xs text-green-600">
                      +{formatNumber(user.puntos_kill_t4 || 0)} pts
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-semibold">
                      {formatNumber(user.total_kill_t5_batallas || 0)}
                    </div>
                    <div className="text-xs text-green-600">
                      +{formatNumber(user.puntos_kill_t5 || 0)} pts
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-semibold">
                      {formatNumber(user.total_muertes_t4_batallas || 0)}
                    </div>
                    <div className="text-xs text-red-600">
                      {formatNumber(user.puntos_muertes_t4 || 0)} pts
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-semibold">
                      {formatNumber(user.total_muertes_t5_batallas || 0)}
                    </div>
                    <div className="text-xs text-red-600">
                      {formatNumber(user.puntos_muertes_t5 || 0)} pts
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-semibold text-blue-600">
                    💪 {formatNumber(user.current_power || 0)}
                  </div>
                </td>
                <td className="p-3">
                  <div className="text-xl font-bold text-red-600">
                    {formatNumber(user.puntuacion_total || 0)}
                  </div>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => onUserSelect(user.usuario_id, user.nombre_usuario)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KvkRankingTable;