// components/admin/KvkUserDetails.jsx
import React from "react";

const KvkUserDetails = ({ user, onBack, onImageClick, formatNumber, formatDate, getImageUrl }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          📋 Detalles de {user.nombre_usuario}
        </h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Volver al Ranking
        </button>
      </div>

      {/* Resumen de Puntuación del Usuario */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">🏆 Desglose de Puntuación</h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Honor</p>
            <p className="text-xl font-bold text-purple-600">
              +{formatNumber(user.puntuacion?.puntos_honor || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.honor_cantidad || 0)} × 5
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Kills T4</p>
            <p className="text-xl font-bold text-green-600">
              +{formatNumber(user.puntuacion?.puntos_kill_t4 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_kill_t4_batallas || 0)} × 10
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Kills T5</p>
            <p className="text-xl font-bold text-green-600">
              +{formatNumber(user.puntuacion?.puntos_kill_t5 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_kill_t5_batallas || 0)} × 20
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Muertes T4</p>
            <p className="text-xl font-bold text-red-600">
              {formatNumber(user.puntuacion?.puntos_muertes_t4 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_muertes_t4_batallas || 0)} × -5
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Muertes T5</p>
            <p className="text-xl font-bold text-red-600">
              {formatNumber(user.puntuacion?.puntos_muertes_t5 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_muertes_t5_batallas || 0)} × -10
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
            <p className="text-sm opacity-90">TOTAL</p>
            <p className="text-2xl font-bold">
              {formatNumber(user.puntuacion?.puntuacion_total || 0)}
            </p>
            <p className="text-xs opacity-90">puntos</p>
          </div>
        </div>
      </div>

      {/* Datos Iniciales */}
      {user.initial && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">📊 Datos Iniciales</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Kill T4 Iniciales</p>
              <p className="text-lg font-bold">
                {formatNumber(user.initial.kill_t4_iniciales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kill T5 Iniciales</p>
              <p className="text-lg font-bold">
                {formatNumber(user.initial.kill_t5_iniciales)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Muertes Iniciales</p>
              <p className="text-lg font-bold">
                {formatNumber(user.initial.muertes_propias_iniciales)}
              </p>
            </div>
            {user.initial.current_power && (
              <div>
                <p className="text-sm text-gray-500">💪 Poder Inicial</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatNumber(user.initial.current_power)}
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-4 mt-3">
            {user.initial.foto_inicial_url && (
              <img
                src={getImageUrl(user.initial.foto_inicial_url)}
                alt="Kills iniciales"
                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageClick(getImageUrl(user.initial.foto_inicial_url))}
              />
            )}
            {user.initial.foto_muertes_iniciales_url && (
              <img
                src={getImageUrl(user.initial.foto_muertes_iniciales_url)}
                alt="Muertes iniciales"
                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageClick(getImageUrl(user.initial.foto_muertes_iniciales_url))}
              />
            )}
          </div>
        </div>
      )}

      {/* Honor */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">🏆 Honor</h4>
        <div className="flex items-center justify-between">
          <div>
            {user.honor &&
            user.honor.honor_cantidad &&
            user.honor.honor_cantidad > 0 ? (
              <>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatNumber(user.honor.honor_cantidad)}
                </p>
                <p className="text-sm text-gray-500">
                  {user.honor.fecha_registro &&
                    formatDate(user.honor.fecha_registro)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-gray-400">Sin Honor</p>
            )}
          </div>
          {user.honor && user.honor.foto_honor_url && (
            <img
              src={getImageUrl(user.honor.foto_honor_url)}
              alt="Honor"
              className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onImageClick(getImageUrl(user.honor.foto_honor_url))}
            />
          )}
        </div>
      </div>

      {/* Batallas */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">⚔️ Batallas por Etapa</h4>
        {user.batallas && user.batallas.length > 0 ? (
          <div className="space-y-4">
            {user.batallas.map((batalla) => (
              <div key={batalla.etapa_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold">{batalla.nombre_etapa}</h5>
                  <span className="text-sm text-gray-500">
                    {formatDate(batalla.fecha_registro)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Kills T4</p>
                    <p className="font-semibold">{formatNumber(batalla.kill_t4)}</p>
                    <p className="text-xs text-green-600">
                      +{formatNumber(batalla.kill_t4 * 10)} pts
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kills T5</p>
                    <p className="font-semibold">{formatNumber(batalla.kill_t5)}</p>
                    <p className="text-xs text-green-600">
                      +{formatNumber(batalla.kill_t5 * 20)} pts
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Muertes T4</p>
                    <p className="font-semibold">
                      {formatNumber(batalla.muertes_propias_t4)}
                    </p>
                    <p className="text-xs text-red-600">
                      -{formatNumber(batalla.muertes_propias_t4 * 5)} pts
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Muertes T5</p>
                    <p className="font-semibold">
                      {formatNumber(batalla.muertes_propias_t5)}
                    </p>
                    <p className="text-xs text-red-600">
                      -{formatNumber(batalla.muertes_propias_t5 * 10)} pts
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3">
                  <div className="flex space-x-2">
                    {batalla.foto_batalla_url && (
                      <img
                        src={getImageUrl(batalla.foto_batalla_url)}
                        alt="Batalla"
                        className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => onImageClick(getImageUrl(batalla.foto_batalla_url))}
                      />
                    )}
                    {batalla.foto_muertes_url && (
                      <img
                        src={getImageUrl(batalla.foto_muertes_url)}
                        alt="Muertes"
                        className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                        onClick={() => onImageClick(getImageUrl(batalla.foto_muertes_url))}
                      />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Puntos batalla</p>
                    <p className="font-bold text-blue-600">
                      {(() => {
                        const total =
                          batalla.kill_t4 * 10 +
                          batalla.kill_t5 * 20 -
                          batalla.muertes_propias_t4 * 5 -
                          batalla.muertes_propias_t5 * 10;
                        return total >= 0 ? "+" : "";
                      })()}
                      {formatNumber(
                        batalla.kill_t4 * 10 +
                          batalla.kill_t5 * 20 -
                          batalla.muertes_propias_t4 * 5 -
                          batalla.muertes_propias_t5 * 10
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay batallas registradas
          </p>
        )}
      </div>
    </div>
  );
};

export default KvkUserDetails;