// pages/admin/MovilizacionAdminPage.jsx - Solo en español
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ImageModal from "../../components/ui/ImageModal";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import { formatNumber, formatDate } from "../../utils/helpers";
import { getImageUrl } from "../../utils/helpers";

const MovilizacionAdminPage = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rankingData, setRankingData] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [settings, setSettings] = useState({
    activo: false
  });
  const [stats, setStats] = useState({
    total_participantes: 0,
    participantes_completaron: 0,
    puntos_totales: 0,
    promedio_puntos: 0
  });

  useEffect(() => {
    if (!user?.es_admin) {
      showAlert("Acceso denegado: Solo administradores", "error");
      return;
    }
    loadData();
  }, [user, showAlert]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsResponse, rankingResponse, statsResponse] = await Promise.all([
        adminAPI.getMovilizacionSettings(),
        adminAPI.getMovilizacionRanking(),
        adminAPI.getMovilizacionStats(),
      ]);

      if (settingsResponse.success) {
        setSettings(settingsResponse.data);
      }

      if (rankingResponse.success) {
        setRankingData(rankingResponse.data || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      showAlert("Error al cargar datos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.toggleMovilizacion(!settings.activo);
      
      if (response.success) {
        setSettings(prev => ({ ...prev, activo: !prev.activo }));
        showAlert(
          `Evento ${!settings.activo ? "activado" : "desactivado"} exitosamente`,
          "success"
        );
      } else {
        showAlert(response.message || "Error al cambiar estado", "error");
      }
    } catch (error) {
      showAlert("Error al cambiar estado: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = async () => {
    const confirmMessage = `¿Estás COMPLETAMENTE SEGURO de que deseas eliminar TODOS los datos de movilización?\n\nEsto incluye:\n- Todos los registros de puntos\n- Todas las fotos subidas\n- Todo el historial del evento\n\nEsta acción NO SE PUEDE DESHACER.`;
    
    if (!window.confirm(confirmMessage)) return;

    // Doble confirmación para acción destructiva
    const doubleConfirm = window.prompt(
      'Para confirmar, escribe "ELIMINAR TODO" (sin comillas):'
    );
    
    if (doubleConfirm !== "ELIMINAR TODO") {
      showAlert("Operación cancelada", "info");
      return;
    }

    try {
      setSaving(true);
      const response = await adminAPI.clearMovilizacionData();
      
      if (response.success) {
        showAlert("Todos los datos han sido eliminados exitosamente", "success");
        await loadData(); // Recargar datos
      } else {
        showAlert(response.message || "Error al eliminar datos", "error");
      }
    } catch (error) {
      showAlert("Error al eliminar datos: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Posición",
      "Usuario",
      "Puntos",
      "Cumple Mínimo",
      "Fecha Registro"
    ];

    const rows = rankingData.map((user, index) => [
      index + 1,
      user.nombre_usuario,
      user.puntos,
      user.cumple_minimo ? "Sí" : "No",
      formatDate(user.fecha_registro)
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
      `movilizacion_ranking_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  const getRankingIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}`;
  };

  // Renders para acceso denegado y loading
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
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🛒 Administración de Movilización
            </h1>
            <p className="text-gray-600">
              Gestiona el evento de movilización de alianza
            </p>
          </div>

          {/* Controles Principales */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ⚙️ Controles del Evento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estado del Evento */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Estado del Evento</h3>
                    <p className="text-sm text-gray-600">
                      {settings.activo ? "El evento está activo" : "El evento está desactivado"}
                    </p>
                  </div>
                  <div className={`text-3xl ${settings.activo ? 'text-green-500' : 'text-red-500'}`}>
                    {settings.activo ? '🟢' : '🔴'}
                  </div>
                </div>
                
                <button
                  onClick={handleToggleActive}
                  disabled={saving}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    settings.activo
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50`}
                >
                  {saving && <ButtonSpinner />}
                  <span>
                    {settings.activo ? '🛑 Desactivar Evento' : '✅ Activar Evento'}
                  </span>
                </button>
              </div>

              {/* Limpieza de Datos */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Gestión de Datos</h3>
                    <p className="text-sm text-gray-600">
                      Eliminar todos los datos del evento
                    </p>
                  </div>
                  <div className="text-3xl text-red-500">🗑️</div>
                </div>
                
                <button
                  onClick={handleClearData}
                  disabled={saving}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving && <ButtonSpinner />}
                  <span>🗑️ Eliminar Todos los Datos</span>
                </button>
                <p className="text-xs text-red-600 mt-2 text-center">
                  ⚠️ Esta acción no se puede deshacer
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Estadísticas del Evento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700">Total Participantes</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_participantes}
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700">Completaron Meta</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.participantes_completaron}
                </p>
                <p className="text-xs text-green-600">
                  ({stats.total_participantes > 0 
                    ? Math.round((stats.participantes_completaron / stats.total_participantes) * 100)
                    : 0}%)
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-700">Puntos Totales</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatNumber(stats.puntos_totales)}
                </p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">Promedio por Usuario</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatNumber(Math.round(stats.promedio_puntos))}
                </p>
              </div>
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                🏆 Ranking de Participantes
              </h2>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Exportar CSV</span>
              </button>
            </div>

            {rankingData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto bg-white rounded-lg shadow">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                      <th className="p-3 text-left font-semibold">Pos.</th>
                      <th className="p-3 text-left font-semibold">Usuario</th>
                      <th className="p-3 text-center font-semibold">Puntos</th>
                      <th className="p-3 text-center font-semibold">Estado</th>
                      <th className="p-3 text-center font-semibold">Foto</th>
                      <th className="p-3 text-center font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((player, index) => (
                      <tr
                        key={player.nombre_usuario}
                        className="border-t border-gray-200 hover:bg-gray-50"
                      >
                        <td className="p-3 font-bold text-lg">
                          {getRankingIcon(index)}
                        </td>
                        <td className="p-3 font-semibold text-gray-800">
                          {player.nombre_usuario}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-lg font-bold">
                            {formatNumber(player.puntos)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {player.cumple_minimo ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              Completado
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {player.foto_url ? (
                            <img
                              src={getImageUrl(player.foto_url)}
                              alt="Foto"
                              className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(getImageUrl(player.foto_url))}
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">Sin foto</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-sm text-gray-600">
                            {formatDate(player.fecha_registro)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No hay participantes
                </h3>
                <p className="text-gray-500">
                  Los usuarios aparecerán aquí cuando registren sus puntos
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de imagen */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={modalImage}
      />
    </div>
  );
};

export default MovilizacionAdminPage;