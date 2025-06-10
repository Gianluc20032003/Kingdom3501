import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ImageModal from "../../components/ui/ImageModal";
import { formatNumber, formatDate } from "../../utils/helpers";
import { getImageUrl } from "../../utils/helpers";

const KvkAdminPage = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [etapas, setEtapas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre_etapa: "",
    orden_etapa: "",
  });
  const [editingEtapa, setEditingEtapa] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [activeView, setActiveView] = useState("ranking"); // 'ranking', 'etapas'

  useEffect(() => {
    if (!user?.es_admin) {
      showAlert("Acceso denegado: Solo administradores", "error");
      return;
    }
    loadData();
  }, [user, showAlert]);

  const parseNumberSafely = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      // Remover comas y convertir a número
      const cleaned = value.replace(/,/g, "");
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [etapasResponse, rankingResponse] = await Promise.all([
        adminAPI.getKvkEtapas(),
        adminAPI.getKvkRanking(),
      ]);

      if (etapasResponse.success) {
        setEtapas(etapasResponse.data.etapas);
      } else {
        showAlert(etapasResponse.message || "Error al cargar etapas", "error");
      }

      if (rankingResponse.success) {
        setRanking(rankingResponse.data.ranking);
      } else {
        showAlert(
          rankingResponse.message || "Error al cargar ranking",
          "error"
        );
      }
    } catch (error) {
      showAlert("Error al cargar datos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId, userName) => {
    try {
      setLoading(true);
      const response = await adminAPI.getKvkUserData();

      if (response.success) {
        const userDetails = response.data.users.find((u) => u.id === userId);
        if (userDetails) {
          setSelectedUser(userDetails);
        } else {
          showAlert("Usuario no encontrado", "error");
        }
      }
    } catch (error) {
      showAlert(
        "Error al cargar detalles del usuario: " + error.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.nombre_etapa ||
      !formData.orden_etapa ||
      formData.orden_etapa <= 0
    ) {
      showAlert(
        "Nombre y orden de etapa son requeridos y el orden debe ser mayor a 0",
        "error"
      );
      return;
    }

    try {
      setLoading(true);
      if (editingEtapa) {
        const response = await adminAPI.updateKvKEtapa(editingEtapa.id, {
          nombre_etapa: formData.nombre_etapa,
          orden_etapa: parseInt(formData.orden_etapa),
          activa: editingEtapa.activa,
        });
        if (response.success) {
          showAlert("Etapa actualizada exitosamente", "success");
        } else {
          showAlert(response.message || "Error al actualizar etapa", "error");
        }
      } else {
        const response = await adminAPI.createKvKEtapa({
          nombre_etapa: formData.nombre_etapa,
          orden_etapa: parseInt(formData.orden_etapa),
        });
        if (response.success) {
          showAlert("Etapa creada exitosamente", "success");
        } else {
          showAlert(response.message || "Error al crear etapa", "error");
        }
      }
      setFormData({ nombre_etapa: "", orden_etapa: "" });
      setEditingEtapa(null);
      await loadData();
    } catch (error) {
      showAlert("Error al guardar etapa: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (etapa) => {
    setEditingEtapa(etapa);
    setFormData({
      nombre_etapa: etapa.nombre_etapa,
      orden_etapa: etapa.orden_etapa,
    });
  };

  const handleToggleActive = async (etapa) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateKvKEtapa(etapa.id, {
        nombre_etapa: etapa.nombre_etapa,
        orden_etapa: etapa.orden_etapa,
        activa: !etapa.activa,
      });
      if (response.success) {
        showAlert(
          `Etapa ${etapa.activa ? "desactivada" : "activada"} exitosamente`,
          "success"
        );
        await loadData();
      } else {
        showAlert(response.message || "Error al actualizar estado", "error");
      }
    } catch (error) {
      showAlert("Error al actualizar estado: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (etapaId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta etapa?")) return;
    try {
      setLoading(true);
      const response = await adminAPI.deleteKvKEtapa(etapaId);
      if (response.success) {
        showAlert("Etapa eliminada exitosamente", "success");
        await loadData();
      } else {
        showAlert(response.message || "Error al eliminar etapa", "error");
      }
    } catch (error) {
      showAlert("Error al eliminar etapa: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  const exportToCSV = () => {
    const headers = [
      "Posición",
      "Usuario",
      "Honor",
      "Kills T4 Total",
      "Kills T5 Total",
      "Muertes T4 Total",
      "Muertes T5 Total",
      "Poder Inicial",
      "Puntos Honor",
      "Puntos Kills T4",
      "Puntos Kills T5",
      "Puntos Muertes T4",
      "Puntos Muertes T5",
      "Puntuación Total",
    ];

    const rows = ranking.map((user, index) => [
      index + 1,
      user.nombre_usuario,
      user.honor_cantidad || 0,
      user.total_kill_t4_batallas || 0,
      user.total_kill_t5_batallas || 0,
      user.total_muertes_t4_batallas || 0,
      user.total_muertes_t5_batallas || 0,
      user.current_power || 0, // NUEVO CAMPO
      user.puntos_honor || 0,
      user.puntos_kill_t4 || 0,
      user.puntos_kill_t5 || 0,
      user.puntos_muertes_t4 || 0,
      user.puntos_muertes_t5 || 0,
      user.puntuacion_total || 0,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `kvk_ranking_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRanking = ranking.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(ranking.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (!user?.es_admin) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Acceso Denegado
              </h3>
              <p className="text-red-600">
                No tienes permisos para acceder al panel de administración
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ⚙️ Administración KvK
            </h1>
            <p className="text-gray-600">
              Gestiona etapas, revisa rankings y analiza el desempeño de
              usuarios
            </p>
          </div>

          {/* Navegación de pestañas */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveView("ranking")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === "ranking"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  🏆 Ranking y Puntuaciones
                </button>
                <button
                  onClick={() => setActiveView("etapas")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === "etapas"
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  ⚙️ Gestión de Etapas
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Vista de Ranking */}
              {activeView === "ranking" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      🏆 Ranking de Usuarios
                    </h2>
                    <button
                      onClick={exportToCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <span>📊</span>
                      <span>Exportar CSV</span>
                    </button>
                  </div>

                  {selectedUser ? (
                    /* Detalles del Usuario Seleccionado */
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          📋 Detalles de {selectedUser.nombre_usuario}
                        </h3>
                        <button
                          onClick={() => setSelectedUser(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Volver al Ranking
                        </button>
                      </div>

                      {/* Resumen de Puntuación del Usuario */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                        <h4 className="font-bold text-gray-800 mb-4">
                          🏆 Desglose de Puntuación
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-500">Honor</p>
                            <p className="text-xl font-bold text-purple-600">
                              +
                              {formatNumber(
                                selectedUser.puntuacion?.puntos_honor || 0
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatNumber(
                                selectedUser.puntuacion?.honor_cantidad || 0
                              )}{" "}
                              × 5
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-500">Kills T4</p>
                            <p className="text-xl font-bold text-green-600">
                              +
                              {formatNumber(
                                selectedUser.puntuacion?.puntos_kill_t4 || 0
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatNumber(
                                selectedUser.puntuacion
                                  ?.total_kill_t4_batallas || 0
                              )}{" "}
                              × 10
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-500">Kills T5</p>
                            <p className="text-xl font-bold text-green-600">
                              +
                              {formatNumber(
                                selectedUser.puntuacion?.puntos_kill_t5 || 0
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatNumber(
                                selectedUser.puntuacion
                                  ?.total_kill_t5_batallas || 0
                              )}{" "}
                              × 20
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-500">Muertes T4</p>
                            <p className="text-xl font-bold text-red-600">
                              {formatNumber(
                                selectedUser.puntuacion?.puntos_muertes_t4 || 0
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatNumber(
                                selectedUser.puntuacion
                                  ?.total_muertes_t4_batallas || 0
                              )}{" "}
                              × -5
                            </p>
                          </div>

                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-sm text-gray-500">Muertes T5</p>
                            <p className="text-xl font-bold text-red-600">
                              {formatNumber(
                                selectedUser.puntuacion?.puntos_muertes_t5 || 0
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatNumber(
                                selectedUser.puntuacion
                                  ?.total_muertes_t5_batallas || 0
                              )}{" "}
                              × -10
                            </p>
                          </div>

                          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
                            <p className="text-sm opacity-90">TOTAL</p>
                            <p className="text-2xl font-bold">
                              {formatNumber(
                                selectedUser.puntuacion?.puntuacion_total || 0
                              )}
                            </p>
                            <p className="text-xs opacity-90">puntos</p>
                          </div>
                        </div>
                      </div>

                      {/* Datos Iniciales */}
                      {selectedUser.initial && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-3">
                            📊 Datos Iniciales
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Kill T4 Iniciales
                              </p>
                              <p className="text-lg font-bold">
                                {formatNumber(
                                  selectedUser.initial.kill_t4_iniciales
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Kill T5 Iniciales
                              </p>
                              <p className="text-lg font-bold">
                                {formatNumber(
                                  selectedUser.initial.kill_t5_iniciales
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Muertes Iniciales
                              </p>
                              <p className="text-lg font-bold">
                                {formatNumber(
                                  selectedUser.initial.muertes_propias_iniciales
                                )}
                              </p>
                            </div>
                            {/* NUEVO CAMPO: Poder Inicial */}
                            {selectedUser.initial.current_power && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  💪 Poder Inicial
                                </p>
                                <p className="text-lg font-bold text-blue-600">
                                  {formatNumber(
                                    selectedUser.initial.current_power
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-4 mt-3">
                            {selectedUser.initial.foto_inicial_url && (
                              <img
                                src={getImageUrl(
                                  selectedUser.initial.foto_inicial_url
                                )}
                                alt="Kills iniciales"
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    getImageUrl(
                                      selectedUser.initial.foto_inicial_url
                                    )
                                  )
                                }
                              />
                            )}
                            {selectedUser.initial
                              .foto_muertes_iniciales_url && (
                              <img
                                src={getImageUrl(
                                  selectedUser.initial
                                    .foto_muertes_iniciales_url
                                )}
                                alt="Muertes iniciales"
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  openImageModal(
                                    getImageUrl(
                                      selectedUser.initial
                                        .foto_muertes_iniciales_url
                                    )
                                  )
                                }
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Honor */}
                      {selectedUser.honor &&
                        selectedUser.honor.honor_cantidad && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              🏆 Honor
                            </h4>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-yellow-600">
                                  {formatNumber(
                                    selectedUser.honor.honor_cantidad
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {selectedUser.honor.fecha_registro &&
                                    formatDate(
                                      selectedUser.honor.fecha_registro
                                    )}
                                </p>
                              </div>
                              {selectedUser.honor.foto_honor_url && (
                                <img
                                  src={getImageUrl(
                                    selectedUser.honor.foto_honor_url
                                  )}
                                  alt="Honor"
                                  className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() =>
                                    openImageModal(
                                      getImageUrl(
                                        selectedUser.honor.foto_honor_url
                                      )
                                    )
                                  }
                                />
                              )}
                            </div>
                          </div>
                        )}

                      {/* Batallas */}
                      <div className="bg-white rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          ⚔️ Batallas por Etapa
                        </h4>
                        {selectedUser.batallas &&
                        selectedUser.batallas.length > 0 ? (
                          <div className="space-y-4">
                            {selectedUser.batallas.map((batalla) => (
                              <div
                                key={batalla.etapa_id}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="font-semibold">
                                    {batalla.nombre_etapa}
                                  </h5>
                                  <span className="text-sm text-gray-500">
                                    {formatDate(batalla.fecha_registro)}
                                  </span>
                                </div>

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
                                      -
                                      {formatNumber(
                                        batalla.muertes_propias_t4 * 5
                                      )}{" "}
                                      pts
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Muertes T5</p>
                                    <p className="font-semibold">
                                      {formatNumber(batalla.muertes_propias_t5)}
                                    </p>
                                    <p className="text-xs text-red-600">
                                      -
                                      {formatNumber(
                                        batalla.muertes_propias_t5 * 10
                                      )}{" "}
                                      pts
                                    </p>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center mt-3">
                                  <div className="flex space-x-2">
                                    {batalla.foto_batalla_url && (
                                      <img
                                        src={getImageUrl(
                                          batalla.foto_batalla_url
                                        )}
                                        alt="Batalla"
                                        className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                                        onClick={() =>
                                          openImageModal(
                                            getImageUrl(
                                              batalla.foto_batalla_url
                                            )
                                          )
                                        }
                                      />
                                    )}
                                    {batalla.foto_muertes_url && (
                                      <img
                                        src={getImageUrl(
                                          batalla.foto_muertes_url
                                        )}
                                        alt="Muertes"
                                        className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                                        onClick={() =>
                                          openImageModal(
                                            getImageUrl(
                                              batalla.foto_muertes_url
                                            )
                                          )
                                        }
                                      />
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                      Puntos batalla
                                    </p>
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
                  ) : (
                    /* Tabla de Ranking */
                    <div className="space-y-4">
                      {ranking.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-4xl mb-4">📊</div>
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">
                            No hay datos de ranking
                          </h3>
                          <p className="text-gray-500">
                            Los usuarios deben registrar sus datos en el módulo
                            KvK
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="overflow-x-auto">
                            <table className="w-full table-auto bg-white rounded-lg shadow">
                              <thead>
                                <tr className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                  <th className="p-3 text-left font-semibold">
                                    Pos.
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Usuario
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Honor
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Kills T4
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Kills T5
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Muertes T4
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Muertes T5
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Poder Inicial
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Puntuación
                                  </th>
                                  <th className="p-3 text-left font-semibold">
                                    Acciones
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentRanking.map((user, index) => {
                                  const globalPosition =
                                    indexOfFirstItem + index + 1;
                                  const getMedalEmoji = (position) => {
                                    if (position === 1) return "🥇";
                                    if (position === 2) return "🥈";
                                    if (position === 3) return "🥉";
                                    return position;
                                  };

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
                                            {formatNumber(
                                              user.honor_cantidad || 0
                                            )}
                                          </div>
                                          <div className="text-xs text-purple-600">
                                            +
                                            {formatNumber(
                                              user.puntos_honor || 0
                                            )}{" "}
                                            pts
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <div className="font-semibold">
                                            {formatNumber(
                                              user.total_kill_t4_batallas || 0
                                            )}
                                          </div>
                                          <div className="text-xs text-green-600">
                                            +
                                            {formatNumber(
                                              user.puntos_kill_t4 || 0
                                            )}{" "}
                                            pts
                                          </div>
                                        </div>
                                      </td>
                                      {/* NUEVA COLUMNA: Kills T5 */}
                                      <td className="p-3">
                                        <div>
                                          <div className="font-semibold">
                                            {formatNumber(
                                              user.total_kill_t5_batallas || 0
                                            )}
                                          </div>
                                          <div className="text-xs text-green-600">
                                            +
                                            {formatNumber(
                                              user.puntos_kill_t5 || 0
                                            )}{" "}
                                            pts
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <div className="font-semibold">
                                            {formatNumber(
                                              user.total_muertes_t4_batallas ||
                                                0
                                            )}
                                          </div>
                                          <div className="text-xs text-red-600">
                                            {formatNumber(
                                              user.puntos_muertes_t4 || 0
                                            )}{" "}
                                            pts
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div>
                                          <div className="font-semibold">
                                            {formatNumber(
                                              user.total_muertes_t5_batallas ||
                                                0
                                            )}
                                          </div>
                                          <div className="text-xs text-red-600">
                                            {formatNumber(
                                              user.puntos_muertes_t5 || 0
                                            )}{" "}
                                            pts
                                          </div>
                                        </div>
                                      </td>
                                      {/* NUEVA COLUMNA: Poder Inicial */}
                                      <td className="p-3">
                                        <div className="font-semibold text-blue-600">
                                          💪{" "}
                                          {formatNumber(
                                            user.current_power || 0
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <div className="text-xl font-bold text-red-600">
                                          {formatNumber(
                                            user.puntuacion_total || 0
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <button
                                          onClick={() =>
                                            loadUserDetails(
                                              user.usuario_id,
                                              user.nombre_usuario
                                            )
                                          }
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

                          {/* Paginación - se mantiene igual */}
                          {totalPages > 1 && (
                            <div className="flex justify-between items-center">
                              <p className="text-gray-600">
                                Mostrando {indexOfFirstItem + 1} a{" "}
                                {Math.min(indexOfLastItem, ranking.length)} de{" "}
                                {ranking.length} usuarios
                              </p>
                              <div className="flex space-x-2">
                                {Array.from(
                                  { length: totalPages },
                                  (_, i) => i + 1
                                ).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => paginate(page)}
                                    className={`px-3 py-1 rounded-lg ${
                                      currentPage === page
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Vista de Gestión de Etapas */}
              {activeView === "etapas" && (
                <div className="space-y-6">
                  {/* Form to Create/Update Stage */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                      {editingEtapa ? "Editar Etapa" : "Crear Nueva Etapa"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Nombre de la Etapa
                          </label>
                          <input
                            type="text"
                            name="nombre_etapa"
                            value={formData.nombre_etapa}
                            onChange={handleInputChange}
                            placeholder="Ej: Etapa Paso nivel 5"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Orden de la Etapa
                          </label>
                          <input
                            type="number"
                            name="orden_etapa"
                            value={formData.orden_etapa}
                            onChange={handleInputChange}
                            placeholder="Ej: 1"
                            min="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-4">
                        {editingEtapa && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingEtapa(null);
                              setFormData({
                                nombre_etapa: "",
                                orden_etapa: "",
                              });
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {editingEtapa ? "Actualizar Etapa" : "Crear Etapa"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Lista de Etapas */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Lista de Etapas
                    </h2>
                    {etapas.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚙️</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No hay etapas configuradas
                        </h3>
                        <p className="text-gray-500">
                          Crea una nueva etapa usando el formulario de arriba
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full table-auto bg-white rounded-lg shadow">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-3 text-left text-gray-700 font-semibold">
                                Nombre
                              </th>
                              <th className="p-3 text-left text-gray-700 font-semibold">
                                Orden
                              </th>
                              <th className="p-3 text-left text-gray-700 font-semibold">
                                Estado
                              </th>
                              <th className="p-3 text-left text-gray-700 font-semibold">
                                Fecha Creación
                              </th>
                              <th className="p-3 text-left text-gray-700 font-semibold">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {etapas.map((etapa) => (
                              <tr
                                key={etapa.id}
                                className="border-t border-gray-200 hover:bg-gray-50"
                              >
                                <td className="p-3 font-semibold">
                                  {etapa.nombre_etapa}
                                </td>
                                <td className="p-3">{etapa.orden_etapa}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded text-sm font-medium ${
                                      etapa.activa
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {etapa.activa ? "Activa" : "Inactiva"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {formatDate(etapa.fecha_creacion)}
                                </td>
                                <td className="p-3">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEdit(etapa)}
                                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                                      title="Editar"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleToggleActive(etapa)}
                                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                      title={
                                        etapa.activa ? "Desactivar" : "Activar"
                                      }
                                    >
                                      {etapa.activa ? "Desactivar" : "Activar"}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(etapa.id)}
                                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                      title="Eliminar"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas de Etapas */}
                  {etapas.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        📊 Estadísticas de Etapas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">
                            Total de Etapas
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {etapas.length}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">
                            Etapas Activas
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            {etapas.filter((e) => e.activa).length}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-sm text-gray-500">
                            Etapas Inactivas
                          </p>
                          <p className="text-2xl font-bold text-red-600">
                            {etapas.filter((e) => !e.activa).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas Globales del Ranking */}
          {ranking.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                📈 Estadísticas Globales
              </h2>

              {/* DEBUG TEMPORAL */}
              {console.log("🔍 DEBUG - Primer usuario:", ranking[0])}
              {console.log(
                "🔍 DEBUG - T4 del primer usuario:",
                ranking[0]?.total_kill_t4_batallas
              )}
              {console.log(
                "🔍 DEBUG - Tipo de T4:",
                typeof ranking[0]?.total_kill_t4_batallas
              )}

              {/* GRID DE 6 COLUMNAS - 2 FILAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* FILA 1: MÉTRICAS PRINCIPALES */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <p className="text-sm text-purple-700">
                    Usuarios Participando
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {ranking.length}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <p className="text-sm text-green-700">Total Kills T4</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const total = ranking.reduce((sum, user) => {
                        const value = parseNumberSafely(
                          user.total_kill_t4_batallas
                        );
                        return sum + value;
                      }, 0);
                      console.log("📊 TOTAL Kills T4:", total);
                      return formatNumber(total);
                    })()}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <p className="text-sm text-blue-700">Total Kills T5</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {(() => {
                      const total = ranking.reduce((sum, user) => {
                        const value = parseNumberSafely(
                          user.total_kill_t5_batallas
                        );
                        return sum + value;
                      }, 0);
                      console.log("📊 TOTAL Kills T5:", total);
                      return formatNumber(total);
                    })()}
                  </p>
                </div>

                {/* NUEVOS CAMPOS: MUERTES T4 Y T5 */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
                  <p className="text-sm text-red-700">Total Muertes T4</p>
                  <p className="text-2xl font-bold text-red-600">
                    {(() => {
                      const total = ranking.reduce((sum, user) => {
                        const value = parseNumberSafely(
                          user.total_muertes_t4_batallas
                        );
                        return sum + value;
                      }, 0);
                      console.log("📊 TOTAL Muertes T4:", total);
                      return formatNumber(total);
                    })()}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4">
                  <p className="text-sm text-pink-700">Total Muertes T5</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {(() => {
                      const total = ranking.reduce((sum, user) => {
                        const value = parseNumberSafely(
                          user.total_muertes_t5_batallas
                        );
                        return sum + value;
                      }, 0);
                      console.log("📊 TOTAL Muertes T5:", total);
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
                      console.log("📊 TOTAL Honor:", total);
                      return formatNumber(total);
                    })()}
                  </p>
                </div>
              </div>

              {/* ESTADÍSTICAS ADICIONALES (OPCIONAL) */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📊 Métricas Calculadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* RATIO KILLS/MUERTES T4 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Ratio Kills/Muertes T4
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {(() => {
                        const totalKillsT4 = ranking.reduce(
                          (sum, user) =>
                            sum +
                            parseNumberSafely(user.total_kill_t4_batallas),
                          0
                        );
                        const totalMuertesT4 = ranking.reduce(
                          (sum, user) =>
                            sum +
                            parseNumberSafely(user.total_muertes_t4_batallas),
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
                    <p className="text-sm text-gray-700">
                      Ratio Kills/Muertes T5
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {(() => {
                        const totalKillsT5 = ranking.reduce(
                          (sum, user) =>
                            sum +
                            parseNumberSafely(user.total_kill_t5_batallas),
                          0
                        );
                        const totalMuertesT5 = ranking.reduce(
                          (sum, user) =>
                            sum +
                            parseNumberSafely(user.total_muertes_t5_batallas),
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
                          (sum, user) =>
                            sum + parseNumberSafely(user.honor_cantidad),
                          0
                        );
                        const promedio =
                          ranking.length > 0
                            ? Math.round(totalHonor / ranking.length)
                            : 0;
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
                          (sum, user) =>
                            sum + parseNumberSafely(user.puntuacion_total),
                          0
                        );
                        return formatNumber(totalPuntos);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={modalImage}
      />
    </div>
  );
};

export default KvkAdminPage;
