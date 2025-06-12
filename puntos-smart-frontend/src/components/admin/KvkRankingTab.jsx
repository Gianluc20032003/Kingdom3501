// components/admin/KvkRankingTab.jsx
import React, { useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import { formatNumber, formatDate } from "../../utils/helpers";
import { getImageUrl } from "../../utils/helpers";
import KvkUserDetails from "./KvkUserDetails";
import KvkRankingTable from "./KvkRankingTable";
import KvkGlobalStats from "./KvkGlobalStats";

const KvkRankingTab = ({ ranking, onImageClick }) => {
  const { showAlert } = useAlert();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const parseNumberSafely = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/,/g, "");
      const parsed = parseInt(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
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
      user.current_power || 0,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🏆 Ranking de Usuarios</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Exportar CSV</span>
        </button>
      </div>

      {selectedUser ? (
        <KvkUserDetails
          user={selectedUser}
          onBack={() => setSelectedUser(null)}
          onImageClick={onImageClick}
          formatNumber={formatNumber}
          formatDate={formatDate}
          getImageUrl={getImageUrl}
        />
      ) : (
        <>
          {ranking.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No hay datos de ranking
              </h3>
              <p className="text-gray-500">
                Los usuarios deben registrar sus datos en el módulo KvK
              </p>
            </div>
          ) : (
            <>
              <KvkRankingTable
                ranking={currentRanking}
                indexOfFirstItem={indexOfFirstItem}
                onUserSelect={loadUserDetails}
                formatNumber={formatNumber}
              />

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">
                    Mostrando {indexOfFirstItem + 1} a{" "}
                    {Math.min(indexOfLastItem, ranking.length)} de{" "}
                    {ranking.length} usuarios
                  </p>
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
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
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Estadísticas Globales */}
              <KvkGlobalStats 
                ranking={ranking} 
                parseNumberSafely={parseNumberSafely}
                formatNumber={formatNumber}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default KvkRankingTab;