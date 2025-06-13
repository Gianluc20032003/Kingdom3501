// components/admin/KvkRankingTab.jsx
import React, { useState, useMemo } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: 'current_power',
    direction: 'desc'
  });

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

  // Filtrar y ordenar datos - TODA la data, no solo la paginada
  const filteredAndSortedRanking = useMemo(() => {
    let filtered = ranking.filter(user =>
      user.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Ordenar
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });

    return filtered;
  }, [ranking, searchTerm, sortConfig]);

  // Resetear página cuando se busca
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  // Pagination logic aplicada a los datos filtrados
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRanking = filteredAndSortedRanking.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedRanking.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    // Exportar datos filtrados, no todos los datos
    const dataToExport = searchTerm ? filteredAndSortedRanking : ranking;
    
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

    const rows = dataToExport.map((user, index) => [
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
    const fileName = searchTerm 
      ? `kvk_ranking_filtered_${searchTerm}_${new Date().toISOString().split("T")[0]}.csv`
      : `kvk_ranking_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <span>Exportar CSV{searchTerm && " (Filtrado)"}</span>
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
              {/* Buscador y controles */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  {/* Buscador */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Buscar usuario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Información de resultados */}
                  <div className="text-sm text-gray-600">
                    {searchTerm ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {filteredAndSortedRanking.length} de {ranking.length} usuarios
                      </span>
                    ) : (
                      <span>{ranking.length} usuarios totales</span>
                    )}
                  </div>
                </div>
              </div>

              <KvkRankingTable
                ranking={currentRanking}
                indexOfFirstItem={indexOfFirstItem}
                onUserSelect={loadUserDetails}
                formatNumber={formatNumber}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
                showSearchAndSort={false} // Deshabilitamos búsqueda interna
              />

              {/* Paginación mejorada */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <p className="text-gray-600 text-sm">
                    Mostrando {indexOfFirstItem + 1} a{" "}
                    {Math.min(indexOfLastItem, filteredAndSortedRanking.length)} de{" "}
                    {filteredAndSortedRanking.length} usuarios
                    {searchTerm && ` (filtrados de ${ranking.length})`}
                  </p>
                  <div className="flex space-x-1">
                    {/* Botón anterior */}
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ←
                    </button>

                    {/* Números de página */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === page
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    {/* Botón siguiente */}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}

              {/* Estadísticas Globales - basadas en datos filtrados si hay búsqueda */}
              <KvkGlobalStats 
                ranking={searchTerm ? filteredAndSortedRanking : ranking}
                parseNumberSafely={parseNumberSafely}
                formatNumber={formatNumber}
                isFiltered={!!searchTerm}
                filterText={searchTerm}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default KvkRankingTab;