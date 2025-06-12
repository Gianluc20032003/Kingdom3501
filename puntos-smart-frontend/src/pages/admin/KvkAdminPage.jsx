// pages/admin/KvkAdminPage.jsx - VERSIÓN MODULARIZADA

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ImageModal from "../../components/ui/ImageModal";

// Componentes modularizados
import KvkRankingTab from "../../components/admin/KvkRankingTab";
import KvkEtapasTab from "../../components/admin/KvkEtapasTab";
import KvkSettingsTab from "../../components/admin/KvkSettingsTab";

const KvkAdminPage = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [etapas, setEtapas] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [activeView, setActiveView] = useState("ranking");

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

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  const renderTabNavigation = () => (
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
        <button
          onClick={() => setActiveView("configuraciones")}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeView === "configuraciones"
              ? "border-red-500 text-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          🔧 Configuraciones
        </button>
      </nav>
    </div>
  );

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
              ⚙️ Administración KvK
            </h1>
            <p className="text-gray-600">
              Gestiona etapas, revisa rankings y configura módulos
            </p>
          </div>

          {/* Contenido con pestañas */}
          <div className="bg-white rounded-xl shadow-lg">
            {renderTabNavigation()}

            <div className="p-6">
              {/* Vista de Ranking */}
              {activeView === "ranking" && (
                <KvkRankingTab
                  ranking={ranking}
                  onImageClick={openImageModal}
                />
              )}

              {/* Vista de Gestión de Etapas */}
              {activeView === "etapas" && (
                <KvkEtapasTab
                  etapas={etapas}
                  onEtapasChange={loadData}
                />
              )}

              {/* Vista de Configuraciones */}
              {activeView === "configuraciones" && (
                <KvkSettingsTab />
              )}
            </div>
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

export default KvkAdminPage