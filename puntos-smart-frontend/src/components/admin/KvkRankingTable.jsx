// components/admin/KvkRankingTable.jsx
import React, { useCallback } from "react";

const KvkRankingTable = ({ 
  ranking, 
  indexOfFirstItem, 
  onUserSelect, 
  formatNumber,
  searchTerm = "",
  sortConfig = { key: 'current_power', direction: 'desc' },
  onSortChange,
  showSearchAndSort = false // Por si quieres usarlo independientemente
}) => {

  const getMedalEmoji = useCallback((position) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return position;
  }, []);

  const handleSort = (key) => {
    if (onSortChange) {
      onSortChange(prevConfig => ({
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
      }));
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'desc' ? 
      <span className="text-white">↓</span> : 
      <span className="text-white">↑</span>;
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
            <th className="p-3 text-left font-semibold">Pos.</th>
            <th className="p-3 text-left font-semibold">Usuario</th>
            <th className="p-3 text-left font-semibold">Honor</th>
            <th 
              className={`p-3 text-left font-semibold ${onSortChange ? 'cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors' : ''}`}
              onClick={() => onSortChange && handleSort('total_kill_t4_batallas')}
            >
              <div className="flex items-center gap-1">
                Kills T4 {onSortChange && getSortIcon('total_kill_t4_batallas')}
              </div>
            </th>
            <th 
              className={`p-3 text-left font-semibold ${onSortChange ? 'cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors' : ''}`}
              onClick={() => onSortChange && handleSort('total_kill_t5_batallas')}
            >
              <div className="flex items-center gap-1">
                Kills T5 {onSortChange && getSortIcon('total_kill_t5_batallas')}
              </div>
            </th>
            <th className="p-3 text-left font-semibold">Muertes T4</th>
            <th className="p-3 text-left font-semibold">Muertes T5</th>
            <th 
              className={`p-3 text-left font-semibold ${onSortChange ? 'cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors' : ''}`}
              onClick={() => onSortChange && handleSort('current_power')}
            >
              <div className="flex items-center gap-1">
                Poder Inicial {onSortChange && getSortIcon('current_power')}
              </div>
            </th>
            <th 
              className={`p-3 text-left font-semibold ${onSortChange ? 'cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors' : ''}`}
              onClick={() => onSortChange && handleSort('puntuacion_total')}
            >
              <div className="flex items-center gap-1">
                Puntuación {onSortChange && getSortIcon('puntuacion_total')}
              </div>
            </th>
            <th className="p-3 text-left font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ranking.length === 0 ? (
            <tr>
              <td colSpan="10" className="p-8 text-center text-gray-500">
                {searchTerm ? 
                  `No se encontraron usuarios que coincidan con "${searchTerm}"` : 
                  'No hay datos disponibles'
                }
              </td>
            </tr>
          ) : (
            ranking.map((user, index) => {
              const globalPosition = indexOfFirstItem + index + 1;

              return (
                <tr
                  key={user.usuario_id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 font-bold text-lg">
                    {getMedalEmoji(globalPosition)}
                  </td>
                  <td className="p-3 font-semibold text-gray-800">
                    {/* Resaltar texto buscado */}
                    {searchTerm ? (
                      <span dangerouslySetInnerHTML={{
                        __html: user.nombre_usuario.replace(
                          new RegExp(`(${searchTerm})`, 'gi'),
                          '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                        )
                      }} />
                    ) : (
                      user.nombre_usuario
                    )}
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
                      {formatNumber(user.current_power || 0)}
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
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default KvkRankingTable;