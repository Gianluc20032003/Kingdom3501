// pages/modules/KvKPage.jsx
import React, { useState, useEffect } from "react";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import ImageModal from "../../components/ui/ImageModal";
import KvKHeader from "../../components/kvk/KvKHeader";
import KvKTabs from "../../components/kvk/KvKTabs";
import PreKvkTab from "../../components/kvk/PreKvkTab";
import InitialDataTab from "../../components/kvk/InitialDataTab";
import HonorTab from "../../components/kvk/HonorTab";
import BattlesTab from "../../components/kvk/BattlesTab";
import SummaryTab from "../../components/kvk/SummaryTab";
import { useKvKData } from "../../hooks/useKvKData";
import { useKvKSettings } from "../../hooks/useKvKSettings";

const KvKPage = () => {
  const [activeTab, setActiveTab] = useState("prekvk");
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");

  const {
    loading,
    saving,
    setSaving,
    kvkData,
    honorData,
    preKvkData,
    rankingData, // NUEVO
    puntuacion,
    etapas,
    batallas,
    etapaActiva,
    initialForm,
    setInitialForm,
    honorForm,
    setHonorForm,
    preKvkForm,
    setPreKvkForm,
    battleForm,
    setBattleForm,
    loadModuleData,
    loadBattleData,
  } = useKvKData();

  const { settings, loadingSettings } = useKvKSettings();

  useEffect(() => {
    loadModuleData();
  }, []);

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  if (loading || loadingSettings) {
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
          <KvKHeader puntuacion={puntuacion} />
          <div className="bg-white rounded-xl shadow-lg">
            <KvKTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="p-6">
              {activeTab === "prekvk" && (
                <PreKvkTab
                  preKvkData={preKvkData}
                  preKvkForm={preKvkForm}
                  setPreKvkForm={setPreKvkForm}
                  saving={saving}
                  setSaving={setSaving}
                  onDataSaved={loadModuleData}
                  onImageClick={openImageModal}
                  rankingData={rankingData} // NUEVO
                  isLocked={settings.prekvk_bloqueado}
                  lockMessage={settings.mensaje_prekvk}
                />
              )}
              {activeTab === "initial" && (
                <InitialDataTab
                  kvkData={kvkData}
                  initialForm={initialForm}
                  setInitialForm={setInitialForm}
                  saving={saving}
                  setSaving={setSaving}
                  onDataSaved={loadModuleData}
                  onImageClick={openImageModal}
                  isLocked={settings.initial_data_bloqueado}
                  lockMessage={settings.mensaje_initial_data}
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
                  isLocked={settings.honor_bloqueado}
                  lockMessage={settings.mensaje_honor}
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
                  isLocked={settings.batallas_bloqueado}
                  lockMessage={settings.mensaje_batallas}
                />
              )}
              {activeTab === "summary" && (
                <SummaryTab
                  puntuacion={puntuacion}
                  kvkData={kvkData}
                  honorData={honorData}
                  preKvkData={preKvkData}
                  batallas={batallas}
                  onImageClick={openImageModal}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <ImageModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        imageSrc={modalImage}
      />
    </div>
  );
};

export default KvKPage;