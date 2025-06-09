import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { movilizacionAPI } from '../../services/api';
import { formatNumber, formatDate, validateFile, createFormData } from '../../utils/helpers';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';
import ImageModal from '../../components/ui/ImageModal';

const MovilizacionPage = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [rankingData, setRankingData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [formData, setFormData] = useState({
    puntos: '',
    foto_puntos: null
  });

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      const [userResponse, rankingResponse] = await Promise.all([
        movilizacionAPI.getUserData(),
        movilizacionAPI.getRanking()
      ]);

      setUserData(userResponse.data);
      setRankingData(rankingResponse.data || []);

      // Llenar formulario si hay datos existentes
      if (userResponse.data) {
        setFormData(prev => ({
          ...prev,
          puntos: userResponse.data.puntos || ''
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
    
    if (name === 'foto_puntos' && files[0]) {
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
    
    if (!formData.puntos || formData.puntos < 0) {
      showAlert('Los puntos deben ser un número válido mayor o igual a 0', 'error');
      return;
    }

    const isNewRecord = !userData;
    if (isNewRecord && !formData.foto_puntos) {
      showAlert('La foto es requerida para el registro inicial', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const submitData = createFormData({
        puntos: formData.puntos,
        foto_puntos: formData.foto_puntos
      }, ['foto_puntos']);

      const response = await movilizacionAPI.save(submitData);
      
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isUpdate = userData;

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
                  🛒 Movilización de Alianza
                </h1>
                <p className="text-gray-600">
                  Registra tus puntos de movilización - Mínimo requerido: 1,000 puntos
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Meta Mínima</div>
                <div className="text-2xl font-bold text-green-600">1,000 pts</div>
              </div>
            </div>

            {/* Barra de progreso para el usuario actual */}
            {userData && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tu progreso hacia la meta
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {formatNumber(userData.puntos)} / 1,000 pts
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      userData.puntos >= 1000 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min((userData.puntos / 1000) * 100, 100)}%`
                    }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-600">0</span>
                  <span className={`text-sm font-semibold ${
                    userData.puntos >= 1000 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {userData.puntos >= 1000 ? '✅ Meta cumplida' : 'En progreso'}
                  </span>
                  <span className="text-xs text-gray-600">1,000</span>
                </div>
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              ➕ {isUpdate ? 'Actualizar' : 'Registrar'} Puntos de Movilización
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Puntos de Movilización
                  </label>
                  <input
                    type="number"
                    name="puntos"
                    value={formData.puntos}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 1500"
                    min="0"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Meta mínima: 1,000 puntos
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Foto de Puntos
                  </label>
                  <input
                    type="file"
                    name="foto_puntos"
                    onChange={handleInputChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!isUpdate}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Sube una captura de pantalla como evidencia
                  </p>

                  {/* Preview de imagen actual */}
                  {userData?.foto_url && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                      <img
                        src={`/uploads/${userData.foto_url}`}
                        alt="Foto actual"
                        className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(`/uploads/${userData.foto_url}`)}
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving && <ButtonSpinner />}
                  <span>{isUpdate ? 'Actualizar' : 'Registrar'} Puntos</span>
                </button>
              </div>
            </form>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              🏆 Ranking de Movilización
            </h2>

            {rankingData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Posición</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Puntos</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Foto</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Fecha</th>
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
                          <span className="text-lg font-bold">
                            {formatNumber(player.puntos)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {player.cumple_minimo ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ✅ Cumplido
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                              ❌ Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {player.foto_url ? (
                            <img
                              src={`/uploads/${player.foto_url}`}
                              alt="Foto de puntos"
                              className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openImageModal(`/uploads/${player.foto_url}`)}
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">Sin foto</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
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
                  No hay datos de ranking
                </h3>
                <p className="text-gray-500">
                  Sé el primero en registrar tus puntos de movilización
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

export default MovilizacionPage;