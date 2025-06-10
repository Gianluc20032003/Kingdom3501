// pages/modules/KvKPage.jsx - Archivo principal refactorizado

import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import ImageModal from "../../components/ui/ImageModal";
import KvKHeader from "../../components/kvk/KvKHeader";
import KvKTabs from "../../components/kvk/KvKTabs";
import InitialDataTab from "../../components/kvk/InitialDataTab";
import HonorTab from "../../components/kvk/HonorTab";
import BattlesTab from "../../components/kvk/BattlesTab";
import SummaryTab from "../../components/kvk/SummaryTab";
import { useKvKData } from "../../hooks/useKvKData";

const KvKPage = () => {
  const [activeTab, setActiveTab] = useState("initial");
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const {
    loading,
    saving,
    setSaving,
    kvkData,
    honorData,
    puntuacion,
    etapas,
    batallas,
    etapaActiva,
    initialForm,
    setInitialForm,
    honorForm,
    setHonorForm,
    battleForm,
    setBattleForm,
    loadModuleData,
    loadBattleData,
  } = useKvKData();

  useEffect(() => {
    loadModuleData();
  }, []);

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
          {/* Header con Puntuación */}
          <KvKHeader puntuacion={puntuacion} />

          {/* Pestañas */}
          <div className="bg-white rounded-xl shadow-lg">
            <KvKTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="p-6">
              {activeTab === "initial" && (
                <InitialDataTab
                  kvkData={kvkData}
                  initialForm={initialForm}
                  setInitialForm={setInitialForm}
                  saving={saving}
                  setSaving={setSaving}
                  onDataSaved={loadModuleData}
                  onImageClick={openImageModal}
                />
              )}

              {activeTab === "honor" && (
                <HonorTab
                  honorData={honorData}
                  honorForm={honorForm}
                  setHonorForm={setHonorForm}
                  saving={saving}
                  setSaving={setSaving}
                  onDataSaved={loadModuleData}
                  onImageClick={openImageModal}
                />
              )}

              {activeTab === "battles" && (
                <BattlesTab
                  etapaActiva={etapaActiva}
                  batallas={batallas}
                  battleForm={battleForm}
                  setBattleForm={setBattleForm}
                  saving={saving}
                  setSaving={setSaving}
                  onDataSaved={loadModuleData}
                  onImageClick={openImageModal}
                />
              )}

              {activeTab === "summary" && (
                <SummaryTab
                  puntuacion={puntuacion}
                  kvkData={kvkData}
                  honorData={honorData}
                  batallas={batallas}
                  onImageClick={openImageModal}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de imagen */}
      <ImageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        imageSrc={modalImage}
      />
    </div>
  );
};

export default KvKPage;