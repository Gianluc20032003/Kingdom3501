import React, { useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import { formatNumber, formatDate, getImageUrl } from "../../utils/helpers";

const KvkUserDetails = ({
  user,
  onBack,
  onImageClick,
  formatNumber,
  formatDate,
  getImageUrl,
}) => {
  const { showAlert } = useAlert();
  const [editInitial, setEditInitial] = useState(false);
  const [editBattles, setEditBattles] = useState({});
  const [initialData, setInitialData] = useState({
    kill_t4_iniciales: user.initial?.kill_t4_iniciales || 0,
    kill_t5_iniciales: user.initial?.kill_t5_iniciales || 0,
    muertes_propias_iniciales: user.initial?.muertes_propias_iniciales || 0,
    current_power: user.initial?.current_power || 0,
    foto_inicial: null,
    foto_muertes_iniciales: null,
  });
  const [battleData, setBattleData] = useState(
    user.batallas?.reduce(
      (acc, batalla) => ({
        ...acc,
        [batalla.etapa_id]: {
          kill_t4: batalla.kill_t4 || 0,
          kill_t5: batalla.kill_t5 || 0,
          muertes_propias_t4: batalla.muertes_propias_t4 || 0,
          muertes_propias_t5: batalla.muertes_propias_t5 || 0,
          foto_batalla: null,
          foto_muertes: null,
        },
      }),
      {}
    ) || {}
  );
  const [loading, setLoading] = useState(false);

  const handleInitialChange = (e) => {
    const { name, value, files } = e.target;
    setInitialData((prev) => ({
      ...prev,
      [name]: files ? files[0] : Math.max(0, parseInt(value) || 0),
    }));
  };

  const handleBattleChange = (etapaId, e) => {
    const { name, value, files } = e.target;
    setBattleData((prev) => ({
      ...prev,
      [etapaId]: {
        ...prev[etapaId],
        [name]: files ? files[0] : Math.max(0, parseInt(value) || 0),
      },
    }));
  };

  const saveInitialData = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("kill_t4_iniciales", initialData.kill_t4_iniciales);
      formData.append("kill_t5_iniciales", initialData.kill_t5_iniciales);
      formData.append(
        "muertes_propias_iniciales",
        initialData.muertes_propias_iniciales
      );
      formData.append("current_power", initialData.current_power);
      if (initialData.foto_inicial)
        formData.append("foto_inicial", initialData.foto_inicial);
      if (initialData.foto_muertes_iniciales)
        formData.append(
          "foto_muertes_iniciales",
          initialData.foto_muertes_iniciales
        );

      const response = await adminAPI.updateKvkUserInitial(user.id, formData);
      if (response.success) {
        showAlert("Datos iniciales actualizados correctamente", "success");
        setEditInitial(false);
        onBack(); // Trigger reload of user details
      } else {
        showAlert("Error al actualizar datos iniciales", "error");
      }
    } catch (error) {
      showAlert("Error: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const saveBattleData = async (etapaId) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      formData.append("etapa_id", etapaId);
      formData.append("kill_t4", battleData[etapaId].kill_t4);
      formData.append("kill_t5", battleData[etapaId].kill_t5);
      formData.append(
        "muertes_propias_t4",
        battleData[etapaId].muertes_propias_t4
      );
      formData.append(
        "muertes_propias_t5",
        battleData[etapaId].muertes_propias_t5
      );
      if (battleData[etapaId].foto_batalla)
        formData.append("foto_batalla", battleData[etapaId].foto_batalla);
      if (battleData[etapaId].foto_muertes)
        formData.append("foto_muertes", battleData[etapaId].foto_muertes);

      const response = await adminAPI.updateKvkBattle(
        user.id,
        etapaId,
        formData
      );
      if (response.success) {
        showAlert("Datos de batalla actualizados correctamente", "success");
        setEditBattles((prev) => ({ ...prev, [etapaId]: false }));
        onBack(); // Trigger reload user details
      } else {
        showAlert("Error al actualizar datos de batalla", "error");
      }
    } catch (error) {
      showAlert("Error: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          📋 Detalles de {user.nombre_usuario}
        </h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Volver al Ranking
        </button>
      </div>

      {/* Score Breakdown */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h4 className="font-bold text-gray-800 mb-4">
          🏆 Desglose de Puntuación
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Honor</p>
            <p className="text-xl font-bold text-purple-600">
              +{formatNumber(user.puntuacion?.puntos_honor || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.honor_cantidad || 0)} * 5
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Kills T4</p>
            <p className="text-xl font-bold text-green-600">
              +{formatNumber(user.puntuacion?.puntos_kill_t4 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_kill_t4_batallas || 0)} * 10
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Kills T5</p>
            <p className="text-xl font-bold text-green-600">
              +{formatNumber(user.puntuacion?.puntos_kill_t5 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_kill_t5_batallas || 0)} * 20
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Muertes T4</p>
            <p className="text-xl font-bold text-red-600">
              {formatNumber(user.puntuacion?.puntos_muertes_t4 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_muertes_t4_batallas || 0)} *
              -5
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500">Muertes T5</p>
            <p className="text-xl font-bold text-red-600">
              {formatNumber(user.puntuacion?.puntos_muertes_t5 || 0)}
            </p>
            <p className="text-xs text-gray-400">
              {formatNumber(user.puntuacion?.total_muertes_t5_batallas || 0)} *
              -10
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

      {/* Initial Data */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800">📊 Datos Iniciales</h4>
          <button
            onClick={() => setEditInitial(true)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Editar
          </button>
        </div>
        {user.initial ? (
          <div>
            {/* Vista de solo lectura */}
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
                  onClick={() =>
                    onImageClick(getImageUrl(user.initial.foto_inicial_url))
                  }
                />
              )}
              {user.initial.foto_muertes_iniciales_url && (
                <img
                  src={getImageUrl(user.initial.foto_muertes_iniciales_url)}
                  alt="Muertes iniciales"
                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    onImageClick(
                      getImageUrl(user.initial.foto_muertes_iniciales_url)
                    )
                  }
                />
              )}
            </div>
            {/* Formulario de edición (se muestra debajo cuando editInitial es true) */}
            {editInitial && (
              <div className="mt-6">
                <h5 className="font-semibold text-gray-800 mb-3">
                  Editar Datos Iniciales
                </h5>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">
                        Kill T4 Iniciales
                      </label>
                      <input
                        type="number"
                        name="kill_t4_iniciales"
                        value={initialData.kill_t4_iniciales}
                        onChange={handleInitialChange}
                        className="w-full p-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        Kill T5 Iniciales
                      </label>
                      <input
                        type="number"
                        name="kill_t5_iniciales"
                        value={initialData.kill_t5_iniciales}
                        onChange={handleInitialChange}
                        className="w-full p-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        Muertes Iniciales
                      </label>
                      <input
                        type="number"
                        name="muertes_propias_iniciales"
                        value={initialData.muertes_propias_iniciales}
                        onChange={handleInitialChange}
                        className="w-full p-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        Poder Inicial
                      </label>
                      <input
                        type="number"
                        name="current_power"
                        value={initialData.current_power}
                        onChange={handleInitialChange}
                        className="w-full p-2 border rounded-lg"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">
                        Foto Kills Iniciales
                      </label>
                      <input
                        type="file"
                        name="foto_inicial"
                        accept="image/*"
                        onChange={handleInitialChange}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">
                        Foto Muertes Iniciales
                      </label>
                      <input
                        type="file"
                        name="foto_muertes_iniciales"
                        accept="image/*"
                        onChange={handleInitialChange}
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveInitialData}
                      disabled={loading}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                        loading ? "opacity-50" : ""
                      }`}
                    >
                      {loading ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={() => setEditInitial(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No hay datos iniciales registrados
          </p>
        )}
      </div>

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
              onClick={() =>
                onImageClick(getImageUrl(user.honor.foto_honor_url))
              }
            />
          )}
        </div>
      </div>

      {/* Battles by Stage */}
      <div className="bg-white rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-3">
          ⚔️ Batallas por Etapa
        </h4>
        {user.batallas && user.batallas.length > 0 ? (
          <div className="space-y-4">
            {user.batallas.map((batalla) => (
              <div key={batalla.etapa_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="font-semibold">{batalla.nombre_etapa}</h5>
                  <div className="flex items-center space-x-4">
                    {!editBattles[batalla.etapa_id] && (
                      <button
                        onClick={() =>
                          setEditBattles((prev) => ({
                            ...prev,
                            [batalla.etapa_id]: true,
                          }))
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Editar
                      </button>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(batalla.fecha_registro)}
                    </span>
                  </div>
                </div>
                {editBattles[batalla.etapa_id] ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          Kills T4
                        </label>
                        <input
                          type="number"
                          name="kill_t4"
                          value={battleData[batalla.etapa_id]?.kill_t4 || 0}
                          onChange={(e) =>
                            handleBattleChange(batalla.etapa_id, e)
                          }
                          className="w-full p-2 border rounded-lg"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Kills T5
                        </label>
                        <input
                          type="number"
                          name="kill_t5"
                          value={battleData[batalla.etapa_id]?.kill_t5 || 0}
                          onChange={(e) =>
                            handleBattleChange(batalla.etapa_id, e)
                          }
                          className="w-full p-2 border rounded-lg"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Muertes T4
                        </label>
                        <input
                          type="number"
                          name="muertes_propias_t4"
                          value={
                            battleData[batalla.etapa_id]?.muertes_propias_t4 ||
                            0
                          }
                          onChange={(e) =>
                            handleBattleChange(batalla.etapa_id, e)
                          }
                          className="w-full p-2 border rounded-lg"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Muertes T5
                        </label>
                        <input
                          type="number"
                          name="muertes_propias_t5"
                          value={
                            battleData[batalla.etapa_id]?.muertes_propias_t5 ||
                            0
                          }
                          onChange={(e) =>
                            handleBattleChange(batalla.etapa_id, e)
                          }
                          className="w-full p-2 border rounded-lg"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">
                          Foto Batalla
                        </label>
                        <input
                          type="file"
                          name="foto_batalla"
                          accept="image/*"
                          onChange={(e) =>
                            handleBattleChange(batalla.etapa_id, e)
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">
                          Foto Muertes
                        </label>
                        <input
                          type="file"
                          name="foto_muertes"
                          accept="image/*"
                          onChange={(e) =>
                            handleBattleChange(batalla.etapa_id, e)
                          }
                          className="w-full p-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => saveBattleData(batalla.etapa_id)}
                        disabled={loading}
                        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                          loading ? "opacity-50" : ""
                        }`}
                      >
                        {loading ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        onClick={() =>
                          setEditBattles((prev) => ({
                            ...prev,
                            [batalla.etapa_id]: false,
                          }))
                        }
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Kills T4</p>
                        <p className="font-semibold">
                          {formatNumber(batalla.kill_t4)}
                        </p>
                        <p className="text-xs text-green-600">
                          +{formatNumber(batalla.kill_t4 * 10)} pts
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Kills T5</p>
                        <p className="font-semibold">
                          {formatNumber(batalla.kill_t5)}
                        </p>
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
                            onClick={() =>
                              onImageClick(
                                getImageUrl(batalla.foto_batalla_url)
                              )
                            }
                          />
                        )}
                        {batalla.foto_muertes_url && (
                          <img
                            src={getImageUrl(batalla.foto_muertes_url)}
                            alt="Muertes"
                            className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                            onClick={() =>
                              onImageClick(
                                getImageUrl(batalla.foto_muertes_url)
                              )
                            }
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
                )}
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