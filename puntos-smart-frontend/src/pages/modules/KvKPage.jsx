import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { kvkAPI } from '../../services/api';
import { formatNumber, formatDate, validateFile, createFormData } from '../../utils/helpers';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';
import ImageModal from '../../components/ui/ImageModal';

const KvKPage = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('inicial');
  const [kvkData, setKvkData] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [batallas, setBatallas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');

  // Estados para formularios
  const [initialForm, setInitialForm] = useState({
    kill_points_iniciales: '',
    muertes_propias_iniciales: '',
    foto_inicial: null,
    foto_muertes_iniciales: null,
  });

  const [battleForm, setBattleForm] = useState({
    etapa_id: '',
    kill_points: '',
    kill_t4: '',
    kill_t5: '',
    muertes_propias_t4: '',
    muertes_propias_t5: '',
    foto_batalla: null,
    foto_muertes: null,
  });

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      const response = await kvkAPI.getUserData();

      if (response.success) {
        const data = response.data;
        setKvkData(data.kvk_inicial);
        setEtapas(data.etapas || []);
        setBatallas(data.batallas || []);

        // Llenar formulario inicial si hay datos
        if (data.kvk_inicial) {
          setInitialForm(prev => ({
            ...prev,
            kill_points_iniciales: data.kvk_inicial.kill_points_iniciales || '',
            muertes_propias_iniciales: data.kvk_inicial.muertes_propias_iniciales || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading KvK data:', error);
      showAlert('Error al cargar los datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialInputChange = (e) => {
    const { name, value, files } = e.target;

    if ((name === 'foto_inicial' || name === 'foto_muertes_iniciales') && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        e.target.value = '';
        return;
      }

      setInitialForm(prev => ({ ...prev, [name]: file }));
    } else {
      setInitialForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBattleInputChange = (e) => {
    const { name, value, files } = e.target;

    if ((name === 'foto_batalla' || name === 'foto_muertes') && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        e.target.value = '';
        return;
      }

      setBattleForm(prev => ({ ...prev, [name]: file }));
    } else {
      setBattleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();

    if (!initialForm.kill_points_iniciales || initialForm.kill_points_iniciales < 0) {
      showAlert('Los Kill Points iniciales deben ser un número válido', 'error');
      return;
    }
    if (!initialForm.muertes_propias_iniciales || initialForm.muertes_propias_iniciales < 0) {
      showAlert('Las muertes propias iniciales deben ser un número válido', 'error');
      return;
    }

    const isNewRecord = !kvkData;
    if (isNewRecord && (!initialForm.foto_inicial || !initialForm.foto_muertes_iniciales)) {
      showAlert('Las fotos de kill points y muertes son requeridas para el registro inicial', 'error');
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData({
        kill_points_iniciales: initialForm.kill_points_iniciales,
        muertes_propias_iniciales: initialForm.muertes_propias_iniciales,
        foto_inicial: initialForm.foto_inicial,
        foto_muertes_iniciales: initialForm.foto_muertes_iniciales,
      }, ['foto_inicial', 'foto_muertes_iniciales']);

      const response = await kvkAPI.saveInitial(submitData);

      if (response.success) {
        showAlert('Kill Points iniciales guardados exitosamente', 'success');
        await loadModuleData();
      } else {
        showAlert(response.message || 'Error al guardar datos', 'error');
      }
    } catch (error) {
      console.error('Error saving initial data:', error);
      showAlert('Error al guardar los datos: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBattleSubmit = async (e) => {
    e.preventDefault();

    if (!battleForm.etapa_id) {
      showAlert('Debe seleccionar una etapa', 'error');
      return;
    }
    if (!battleForm.kill_points || battleForm.kill_points < 0) {
      showAlert('Los Kill Points deben ser un número válido', 'error');
      return;
    }
    if (battleForm.muertes_propias_t4 && battleForm.muertes_propias_t4 < 0) {
      showAlert('Las muertes propias T4 deben ser un número válido', 'error');
      return;
    }
    if (battleForm.muertes_propias_t5 && battleForm.muertes_propias_t5 < 0) {
      showAlert('Las muertes propias T5 deben ser un número válido', 'error');
      return;
    }

    const existingBattle = batallas.find(b => b.etapa_id === parseInt(battleForm.etapa_id));
    if (!existingBattle && (!battleForm.foto_batalla || !battleForm.foto_muertes)) {
      showAlert('Las fotos de batalla y muertes son requeridas', 'error');
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData({
        etapa_id: battleForm.etapa_id,
        kill_points: battleForm.kill_points,
        kill_t4: battleForm.kill_t4 || 0,
        kill_t5: battleForm.kill_t5 || 0,
        muertes_propias_t4: battleForm.muertes_propias_t4 || 0,
        muertes_propias_t5: battleForm.muertes_propias_t5 || 0,
        foto_batalla: battleForm.foto_batalla,
        foto_muertes: battleForm.foto_muertes,
      }, ['foto_batalla', 'foto_muertes']);

      const response = await kvkAPI.saveBattle(submitData);

      if (response.success) {
        showAlert('Datos de batalla guardados exitosamente', 'success');
        await loadModuleData();
        // Limpiar formulario
        setBattleForm({
          etapa_id: '',
          kill_points: '',
          kill_t4: '',
          kill_t5: '',
          muertes_propias_t4: '',
          muertes_propias_t5: '',
          foto_batalla: null,
          foto_muertes: null,
        });
        // Limpiar inputs de archivo
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');
      } else {
        showAlert(response.message || 'Error al guardar datos', 'error');
      }
    } catch (error) {
      console.error('Error saving battle data:', error);
      showAlert('Error al guardar los datos: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const loadBattleData = (etapaId) => {
    const batalla = batallas.find(b => b.etapa_id === parseInt(etapaId));
    if (batalla) {
      setBattleForm({
        etapa_id: etapaId,
        kill_points: batalla.kill_points || '',
        kill_t4: batalla.kill_t4 || '',
        kill_t5: batalla.kill_t5 || '',
        muertes_propias_t4: batalla.muertes_propias_t4 || '',
        muertes_propias_t5: batalla.muertes_propias_t5 || '',
        foto_batalla: null,
        foto_muertes: null,
      });
    } else {
      setBattleForm({
        etapa_id: etapaId,
        kill_points: '',
        kill_t4: '',
        kill_t5: '',
        muertes_propias_t4: '',
        muertes_propias_t5: '',
        foto_batalla: null,
        foto_muertes: null,
      });
    }
  };

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
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  ⚔️ Kingdom vs Kingdom (KvK)
                </h1>
                <p className="text-gray-600">
                  Registra tus Kill Points y batallas durante los eventos KvK
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Estado KvK</div>
                <div className="text-2xl font-bold text-red-600">
                  {kvkData ? 'Registrado' : 'Pendiente'}
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('inicial')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inicial'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📊 Kill Points Iniciales
                </button>
                <button
                  onClick={() => setActiveTab('batallas')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'batallas'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⚔️ Batallas
                </button>
                <button
                  onClick={() => setActiveTab('resumen')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'resumen'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📈 Resumen
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Tab: Kill Points Iniciales */}
              {activeTab === 'inicial' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Kill Points Antes del KvK
                  </h3>

                  <form onSubmit={handleInitialSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Kill Points Iniciales
                        </label>
                        <input
                          type="number"
                          name="kill_points_iniciales"
                          value={initialForm.kill_points_iniciales}
                          onChange={handleInitialInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ej: 150000000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Kill Points antes de iniciar el KvK
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Muertes Propias Iniciales (T4+T5)
                        </label>
                        <input
                          type="number"
                          name="muertes_propias_iniciales"
                          value={initialForm.muertes_propias_iniciales}
                          onChange={handleInitialInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ej: 50000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Muertes propias antes de iniciar el KvK
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Foto de Kill Points
                        </label>
                        <input
                          type="file"
                          name="foto_inicial"
                          onChange={handleInitialInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={!kvkData}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Captura de tus Kill Points iniciales
                        </p>
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">
                            Ejemplo:
                          </p>
                          <img
                            src="https://servicios.puntossmart.com/img/no-img.jpg"
                            alt="Ejemplo Kill Points"
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageModal('https://servicios.puntossmart.com/img/no-img.jpg')}
                          />
                        </div>
                        {kvkData?.foto_inicial_url && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                            <img
                              src={`http://localhost:8000/uploads/${kvkData.foto_inicial_url}`}
                              alt="Foto inicial"
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`http://localhost:8000/uploads/${kvkData.foto_inicial_url}`)}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Foto de Muertes Propias
                        </label>
                        <input
                          type="file"
                          name="foto_muertes_iniciales"
                          onChange={handleInitialInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={!kvkData}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Captura de tus muertes propias iniciales (Salón de Héroes)
                        </p>
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">
                            Ejemplo:
                          </p>
                          <img
                            src="https://servicios.puntossmart.com/img/no-img.jpg"
                            alt="Ejemplo Muertes Iniciales"
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageModal('https://servicios.puntossmart.com/img/no-img.jpg')}
                          />
                        </div>
                        {kvkData?.foto_muertes_iniciales_url && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                            <img
                              src={`http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`}
                              alt="Foto muertes iniciales"
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={loadModuleData}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving && <ButtonSpinner />}
                        <span>{kvkData ? 'Actualizar' : 'Registrar'} Kill Points</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Batallas */}
              {activeTab === 'batallas' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Registrar Batalla
                  </h3>

                  {etapas.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⚙️</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No hay etapas configuradas
                      </h3>
                      <p className="text-gray-500">
                        Contacta al administrador para configurar las etapas de KvK
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleBattleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Etapa de Batalla
                          </label>
                          <select
                            name="etapa_id"
                            value={battleForm.etapa_id}
                            onChange={(e) => {
                              handleBattleInputChange(e);
                              loadBattleData(e.target.value);
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            required
                          >
                            <option value="">Seleccionar etapa...</option>
                            {etapas.map((etapa) => (
                              <option key={etapa.id} value={etapa.id}>
                                {etapa.nombre_etapa}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Kill Points de la Batalla
                          </label>
                          <input
                            type="number"
                            name="kill_points"
                            value={battleForm.kill_points}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Ej: 175000000"
                            min="0"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Kills T4
                          </label>
                          <input
                            type="number"
                            name="kill_t4"
                            value={battleForm.kill_t4}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Kills T5
                          </label>
                          <input
                            type="number"
                            name="kill_t5"
                            value={battleForm.kill_t5}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Muertes Propias T4
                          </label>
                          <input
                            type="number"
                            name="muertes_propias_t4"
                            value={battleForm.muertes_propias_t4}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Muertes Propias T5
                          </label>
                          <input
                            type="number"
                            name="muertes_propias_t5"
                            value={battleForm.muertes_propias_t5}
                            onChange={handleBattleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Foto de Batalla
                          </label>
                          <input
                            type="file"
                            name="foto_batalla"
                            onChange={handleBattleInputChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Ejemplo:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/no-img.jpg"
                              alt="Ejemplo Batalla"
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal('https://servicios.puntossmart.com/img/no-img.jpg')}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Foto de Muertes (Salón de Héroes)
                          </label>
                          <input
                            type="file"
                            name="foto_muertes"
                            onChange={handleBattleInputChange}
                            accept="image/*"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Ejemplo:
                            </p>
                            <img
                              src="https://servicios.puntossmart.com/img/no-img.jpg"
                              alt="Ejemplo Muertes"
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal('https://servicios.puntossmart.com/img/no-img.jpg')}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setBattleForm({
                              etapa_id: '',
                              kill_points: '',
                              kill_t4: '',
                              kill_t5: '',
                              muertes_propias_t4: '',
                              muertes_propias_t5: '',
                              foto_batalla: null,
                              foto_muertes: null,
                            });
                          }}
                          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Limpiar
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {saving && <ButtonSpinner />}
                          <span>Guardar Batalla</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab: Resumen */}
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    Resumen de KvK
                  </h3>

                  {/* Kill Points Iniciales */}
                  {kvkData && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Kill Points Iniciales</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Kill Points</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(kvkData.kill_points_iniciales)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Muertes Propias</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(kvkData.muertes_propias_iniciales)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Registrado el {formatDate(kvkData.fecha_registro)}
                        </p>
                        <div className="flex space-x-4">
                          {kvkData.foto_inicial_url && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Kill Points</p>
                              <img
                                src={`http://localhost:8000/uploads/${kvkData.foto_inicial_url}`}
                                alt="Kill Points iniciales"
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageModal(`http://localhost:8000/uploads/${kvkData.foto_inicial_url}`)}
                              />
                            </div>
                          )}
                          {kvkData.foto_muertes_iniciales_url && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Muertes</p>
                              <img
                                src={`http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`}
                                alt="Muertes iniciales"
                                className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => openImageModal(`http://localhost:8000/uploads/${kvkData.foto_muertes_iniciales_url}`)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Batallas */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Batallas Registradas</h4>
                    {batallas.length > 0 ? (
                      <div className="space-y-4">
                        {batallas.map((batalla) => (
                          <div key={batalla.etapa_id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-800">{batalla.nombre_etapa}</h5>
                              <span className="text-sm text-gray-500">
                                {formatDate(batalla.fecha_registro)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                              <div>
                                <p className="text-sm text-gray-500">Kill Points</p>
                                <p className="font-semibold">{formatNumber(batalla.kill_points)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Kills T4</p>
                                <p className="font-semibold">{formatNumber(batalla.kill_t4)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Kills T5</p>
                                <p className="font-semibold">{formatNumber(batalla.kill_t5)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Muertes Propias T4</p>
                                <p className="font-semibold">{formatNumber(batalla.muertes_propias_t4)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Muertes Propias T5</p>
                                <p className="font-semibold">{formatNumber(batalla.muertes_propias_t5)}</p>
                              </div>
                            </div>

                            <div className="flex space-x-4">
                              {batalla.foto_batalla_url && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Batalla</p>
                                  <img
                                    src={`http://localhost:8000/uploads/${batalla.foto_batalla_url}`}
                                    alt="Foto batalla"
                                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openImageModal(`http://localhost:8000/uploads/${batalla.foto_batalla_url}`)}
                                  />
                                </div>
                              )}
                              {batalla.foto_muertes_url && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Muertes</p>
                                  <img
                                    src={`http://localhost:8000/uploads/${batalla.foto_muertes_url}`}
                                    alt="Foto muertes"
                                    className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => openImageModal(`http://localhost:8000/uploads/${batalla.foto_muertes_url}`)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚔️</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No hay batallas registradas
                        </h3>
                        <p className="text-gray-500">
                          Registra tus batallas en la pestaña "Batallas"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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