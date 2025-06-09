import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { fortalezasAPI } from '../../services/api';
import { formatNumber, formatDate, getCurrentWeekNumber, validateFile, createFormData } from '../../utils/helpers';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';
import ImageModal from '../../components/ui/ImageModal';

const FortalezasPage = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [formData, setFormData] = useState({
    cantidad_cofres: '',
    foto_cofres: null
  });

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      const [userResponse, rankingResponse] = await Promise.all([
        fortalezasAPI.getUserData(),
        fortalezasAPI.getRanking()
      ]);

      setUserData(userResponse.data);
      setRankingData(rankingResponse.data || []);

      // Llenar formulario si hay datos existentes
      if (userResponse.data?.current_week) {
        setFormData(prev => ({
          ...prev,
          cantidad_cofres: userResponse.data.current_week.cantidad_cofres || ''
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showAlert('Error al cargar los datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'foto_cofres' && files[0]) {
      const file = files[0];
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        showAlert(errors.join(', '), 'error');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({ ...prev, [name]: file }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.cantidad_cofres || formData.cantidad_cofres < 0) {
      showAlert('La cantidad de cofres debe ser un número válido', 'error');
      return;
    }

    const isNewRecord = !userData?.current_week;
    if (isNewRecord && !formData.foto_cofres) {
      showAlert('La foto es requerida para el registro inicial', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = createFormData({
        cantidad_cofres: formData.cantidad_cofres,
        foto_cofres: formData.foto_cofres
      }, ['foto_cofres']);

      const response = await fortalezasAPI.save(submitData);
      
      if (response.success) {
        showAlert('Datos guardados exitosamente', 'success');
        await loadModuleData(); // Recargar datos
      } else {
        showAlert(response.message || 'Error al guardar datos', 'error');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      showAlert('Error al guardar los datos: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  const getRankingIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getDifferenceColor = (diferencia) => {
    if (diferencia > 0) return 'text-green-600';
    if (diferencia < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isUpdate = userData?.current_week;

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
                  🏰 Ranking Fortalezas Bárbaras
                </h1>
                <p className="text-gray-600">
                  Registra tus cofres semanales y compite con otros jugadores
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Semana Actual</div>
                <div className="text-2xl font-bold text-purple-600">
                  {getCurrentWeekNumber()}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ➕ {isUpdate ? 'Actualizar' : 'Registrar'} Cofres de la Semana
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Cantidad de Cofres
                  </label>
                  <input
                    type="number"
                    name="cantidad_cofres"
                    value={formData.cantidad_cofres}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ej: 15000"
                    min="0"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Ingresa la cantidad total de cofres obtenidos
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Foto de Cofres
                  </label>
                  <input
                    type="file"
                    name="foto_cofres"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={!isUpdate}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sube una captura de pantalla como evidencia
                  </p>

                  {/* Preview de imagen actual */}
                  {userData?.current_week?.foto_url && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                      <img
                        src={`/uploads/${userData.current_week.foto_url}`}
                        alt="Foto actual"
                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(`/uploads/${userData.current_week.foto_url}`)}
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving && <ButtonSpinner />}
                  <span>{isUpdate ? 'Actualizar' : 'Registrar'} Cofres</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🏆 Ranking de Fortalezas
            </h2>

            {rankingData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Posición</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sem. Pasada</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Foto Anterior</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Sem. Actual</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Foto Actual</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingData.map((player, index) => (
                      <tr
                        key={player.nombre_usuario}
                        className={`border-t hover:bg-gray-50 transition-colors ${
                          player.es_usuario_actual ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getRankingIcon(index)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`font-semibold ${
                            player.es_usuario_actual ? 'text-blue-600' : 'text-gray-800'
                          }`}>
                            {player.nombre_usuario}
                            {player.es_usuario_actual && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                Tú
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium">
                            {formatNumber(player.cofres_semana_pasada || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {player.foto_semana_pasada ? (
                            <img
                              src={`/uploads/${player.foto_semana_pasada}`}
                              alt="Foto semana pasada"
                              className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`/uploads/${player.foto_semana_pasada}`)}
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">Sin foto</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium">
                            {formatNumber(player.cofres_semana_actual || 0)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {player.foto_semana_actual ? (
                            <img
                              src={`/uploads/${player.foto_semana_actual}`}
                              alt="Foto semana actual"
                              className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`/uploads/${player.foto_semana_actual}`)}
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">Sin foto</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`font-bold ${getDifferenceColor(player.diferencia)}`}>
                            {player.diferencia > 0 ? '+' : ''}{formatNumber(player.diferencia || 0)}
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
                  No hay datos de ranking
                </h3>
                <p className="text-gray-500">
                  Sé el primero en registrar tus cofres de fortaleza
                </p>
              </div>
            )}
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

export default FortalezasPage;