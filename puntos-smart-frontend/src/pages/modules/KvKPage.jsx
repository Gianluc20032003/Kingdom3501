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
  const [userData, setUserData] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [batallas, setBatallas] = useState({});
  const [progreso, setProgreso] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [activeTab, setActiveTab] = useState('inicial');
  
  // Estados para formularios
  const [formInicial, setFormInicial] = useState({
    kill_points_iniciales: '',
    foto_inicial: null
  });
  
  const [formBatalla, setFormBatalla] = useState({
    etapa_id: '',
    kill_points: '',
    kill_t4: '',
    kill_t5: '',
    muertes_propias: '',
    foto_batalla: null,
    foto_muertes: null
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
        setUserData(data.kvk_inicial);
        setEtapas(data.etapas || []);
        setBatallas(data.batallas || {});
        setProgreso(data.progreso || {});
        
        // Llenar formulario inicial si hay datos
        if (data.kvk_inicial) {
          setFormInicial(prev => ({
            ...prev,
            kill_points_iniciales: data.kvk_inicial.kill_points_iniciales || ''
          }));
        }
        
        // Establecer tab inicial basado en progreso
        if (!data.kvk_inicial) {
          setActiveTab('inicial');
        } else if (data.etapas.length > 0) {
          setActiveTab('batallas');
        }
      }
    } catch (error) {
      console.error('Error loading KvK data:', error);
      showAlert('Error al cargar los datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInicialInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'foto_inicial' && files[0]) {
      const file = files[0];
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        e.target.value = '';
        return;
      }
      
      setFormInicial(prev => ({ ...prev, [name]: file }));
    } else {
      setFormInicial(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBatallaInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if ((name === 'foto_batalla' || name === 'foto_muertes') && files[0]) {
      const file = files[0];
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        e.target.value = '';
        return;
      }
      
      setFormBatalla(prev => ({ ...prev, [name]: file }));
    } else {
      setFormBatalla(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitInicial = async (e) => {
    e.preventDefault();
    
    if (!formInicial.kill_points_iniciales || formInicial.kill_points_iniciales < 0) {
      showAlert('Los Kill Points deben ser un número válido', 'error');
      return;
    }

    const isNewRecord = !userData;
    if (isNewRecord && !formInicial.foto_inicial) {
      showAlert('La foto es requerida para el registro inicial', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = createFormData({
        kill_points_iniciales: formInicial.kill_points_iniciales,
        foto_inicial: formInicial.foto_inicial
      }, ['foto_inicial']);

      const response = await kvkAPI.saveInitial(submitData);
      
      if (response.success) {
        showAlert('Kill Points iniciales guardados exitosamente', 'success');
        await loadModuleData();
        setActiveTab('batallas');
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

  const handleSubmitBatalla = async (e) => {
    e.preventDefault();
    
    if (!formBatalla.etapa_id) {
      showAlert('Debe seleccionar una etapa', 'error');
      return;
    }
    
    if (!formBatalla.kill_points || formBatalla.kill_points < 0) {
      showAlert('Los Kill Points deben ser un número válido', 'error');
      return;
    }

    const existingBatalla = batallas[formBatalla.etapa_id];
    if (!existingBatalla && !formBatalla.foto_batalla) {
      showAlert('La foto de batalla es requerida', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = createFormData({
        etapa_id: formBatalla.etapa_id,
        kill_points: formBatalla.kill_points,
        kill_t4: formBatalla.kill_t4 || 0,
        kill_t5: formBatalla.kill_t5 || 0,
        muertes_propias: formBatalla.muertes_propias || 0,
        foto_batalla: formBatalla.foto_batalla,
        foto_muertes: formBatalla.foto_muertes
      }, ['foto_batalla', 'foto_muertes']);

      const response = await kvkAPI.saveBattle(submitData);
      
      if (response.success) {
        showAlert('Datos de batalla guardados exitosamente', 'success');
        await loadModuleData();
        // Limpiar formulario
        setFormBatalla({
          etapa_id: '',
          kill_points: '',
          kill_t4: '',
          kill_t5: '',
          muertes_propias: '',
          foto_batalla: null,
          foto_muertes: null
        });
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

  const selectBatallaForEdit = (etapaId) => {
    const batalla = batallas[etapaId];
    if (batalla) {
      setFormBatalla({
        etapa_id: etapaId,
        kill_points: batalla.kill_points,
        kill_t4: batalla.kill_t4 || '',
        kill_t5: batalla.kill_t5 || '',
        muertes_propias: batalla.muertes_propias || '',
        foto_batalla: null,
        foto_muertes: null
      });
    } else {
      setFormBatalla(prev => ({ ...prev, etapa_id: etapaId }));
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
                  Registra tus Kill Points iniciales y datos de cada batalla
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Progreso</div>
                <div className="text-2xl font-bold text-red-600">
                  {progreso.porcentaje_completado || 0}%
                </div>
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso del KvK
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {progreso.etapas_completadas || 0} / {progreso.etapas_totales || 0} etapas
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-red-500 to-orange-500"
                  style={{
                    width: `${progreso.porcentaje_completado || 0}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">
                  {userData ? '✅ Datos iniciales' : '⏳ Pendiente inicial'}
                </span>
                <span className="text-sm font-semibold text-red-600">
                  {progreso.porcentaje_completado === 100 ? '🏆 Completado' : '📊 En progreso'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('inicial')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'inicial'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Kill Points Iniciales
                {userData && <span className="ml-2 text-green-500">✅</span>}
              </button>
              <button
                onClick={() => setActiveTab('batallas')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'batallas'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚔️ Batallas ({progreso.etapas_completadas || 0}/{progreso.etapas_totales || 0})
              </button>
              <button
                onClick={() => setActiveTab('resumen')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'resumen'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📈 Resumen
              </button>
            </div>

            <div className="p-6">
              {/* Tab: Kill Points Iniciales */}
              {activeTab === 'inicial' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    📊 Kill Points Iniciales
                  </h2>
                  
                  <form onSubmit={handleSubmitInicial} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Kill Points Iniciales
                        </label>
                        <input
                          type="number"
                          name="kill_points_iniciales"
                          value={formInicial.kill_points_iniciales}
                          onChange={handleInicialInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Ej: 1500000"
                          min="0"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Kill Points antes de iniciar el KvK
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Foto de Kill Points
                        </label>
                        <input
                          type="file"
                          name="foto_inicial"
                          onChange={handleInicialInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          required={!userData}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Captura antes de iniciar el KvK
                        </p>

                        {/* Preview imagen actual */}
                        {userData?.foto_inicial_url && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                            <img
                              src={`http://localhost:8000/uploads/${userData.foto_inicial_url}`}
                              alt="Foto actual"
                              className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`http://localhost:8000/uploads/${userData.foto_inicial_url}`)}
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
                        <span>{userData ? 'Actualizar' : 'Guardar'} Kill Points</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Batallas */}
              {activeTab === 'batallas' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      ⚔️ Batallas del KvK
                    </h2>
                    
                    {!userData && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800">
                          ⚠️ Primero debes registrar tus Kill Points iniciales
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Lista de etapas */}
                  {etapas.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {etapas.map((etapa) => {
                        const batalla = batallas[etapa.id];
                        const isCompleted = !!batalla;
                        
                        return (
                          <div
                            key={etapa.id}
                            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            } ${
                              formBatalla.etapa_id == etapa.id ? 'ring-2 ring-red-500' : ''
                            }`}
                            onClick={() => selectBatallaForEdit(etapa.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-800">{etapa.nombre_etapa}</h3>
                              {isCompleted && <span className="text-green-500">✅</span>}
                            </div>
                            {batalla && (
                              <div className="text-sm text-gray-600">
                                <p>Kill Points: {formatNumber(batalla.kill_points)}</p>
                                <p>Fecha: {formatDate(batalla.fecha_registro)}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Formulario de batalla */}
                  <form onSubmit={handleSubmitBatalla} className="space-y-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {formBatalla.etapa_id && batallas[formBatalla.etapa_id] ? 'Actualizar' : 'Registrar'} Batalla
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Etapa
                        </label>
                        <select
                          name="etapa_id"
                          value={formBatalla.etapa_id}
                          onChange={handleBatallaInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        >
                          <option value="">Seleccionar etapa...</option>
                          {etapas.map((etapa) => (
                            <option key={etapa.id} value={etapa.id}>
                              {etapa.nombre_etapa} {batallas[etapa.id] ? '✅' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Kill Points
                        </label>
                        <input
                          type="number"
                          name="kill_points"
                          value={formBatalla.kill_points}
                          onChange={handleBatallaInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Ej: 2500000"
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
                          value={formBatalla.kill_t4}
                          onChange={handleBatallaInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                          value={formBatalla.kill_t5}
                          onChange={handleBatallaInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Muertes Propias (T4+T5)
                        </label>
                        <input
                          type="number"
                          name="muertes_propias"
                          value={formBatalla.muertes_propias}
                          onChange={handleBatallaInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                          onChange={handleBatallaInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required={!formBatalla.etapa_id || !batallas[formBatalla.etapa_id]}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                          Foto de Muertes <span className="text-gray-500">(Opcional)</span>
                        </label>
                        <input
                          type="file"
                          name="foto_muertes"
                          onChange={handleBatallaInputChange}
                          accept="image/*"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setFormBatalla({
                          etapa_id: '',
                          kill_points: '',
                          kill_t4: '',
                          kill_t5: '',
                          muertes_propias: '',
                          foto_batalla: null,
                          foto_muertes: null
                        })}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Limpiar
                      </button>
                      <button
                        type="submit"
                        disabled={saving || !userData}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saving && <ButtonSpinner />}
                        <span>Guardar Batalla</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Resumen */}
              {activeTab === 'resumen' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    📈 Resumen del KvK
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Datos iniciales */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3">Kill Points Iniciales</h3>
                      {userData ? (
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatNumber(userData.kill_points_iniciales)}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatDate(userData.fecha_registro)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-blue-600">No registrado</p>
                      )}
                    </div>

                    {/* Total kills */}
                    <div className="bg-red-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-800 mb-3">Total Kills</h3>
                      <div>
                        <p className="text-lg font-bold text-red-600">
                          T4: {formatNumber(Object.values(batallas).reduce((sum, b) => sum + (b.kill_t4 || 0), 0))}
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          T5: {formatNumber(Object.values(batallas).reduce((sum, b) => sum + (b.kill_t5 || 0), 0))}
                        </p>
                      </div>
                    </div>

                    {/* Kill Points finales */}
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-800 mb-3">Kill Points Actuales</h3>
                      {Object.keys(batallas).length > 0 ? (
                        <p className="text-2xl font-bold text-green-600">
                          {formatNumber(Math.max(...Object.values(batallas).map(b => b.kill_points)))}
                        </p>
                      ) : (
                        <p className="text-green-600">Sin batallas</p>
                      )}
                    </div>
                  </div>

                  {/* Lista de batallas */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Batallas</h3>
                    {Object.keys(batallas).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Etapa</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Kill Points</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Kills T4</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Kills T5</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Muertes</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(batallas).map((batalla) => (
                              <tr key={batalla.etapa_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-4 font-medium">{batalla.nombre_etapa}</td>
                                <td className="px-4 py-4 text-center">{formatNumber(batalla.kill_points)}</td>
                                <td className="px-4 py-4 text-center">{formatNumber(batalla.kill_t4 || 0)}</td>
                                <td className="px-4 py-4 text-center">{formatNumber(batalla.kill_t5 || 0)}</td>
                                <td className="px-4 py-4 text-center">{formatNumber(batalla.muertes_propias || 0)}</td>
                                <td className="px-4 py-4 text-center">{formatDate(batalla.fecha_registro)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚔️</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          No hay batallas registradas
                        </h3>
                        <p className="text-gray-500">
                          Comienza registrando tus batallas en la pestaña anterior
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