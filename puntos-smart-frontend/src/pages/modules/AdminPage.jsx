import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { adminAPI, mgeAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';
import ImageModal from '../../components/ui/ImageModal';

const AdminPage = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('mge');
  const [mgePostulaciones, setMgePostulaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  
  // Estados para configuración MGE
  const [mgeConfig, setMgeConfig] = useState({
    tipo_tropa: 'arqueria',
    loading: false
  });

  useEffect(() => {
    if (activeTab === 'mge-postulaciones') {
      loadMGEPostulaciones();
    }
  }, [activeTab]);

  const loadMGEPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await mgeAPI.getPostulaciones();
      setMgePostulaciones(response.data || []);
    } catch (error) {
      console.error('Error loading MGE postulations:', error);
      showAlert('Error al cargar postulaciones: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMGEConfig = async (e) => {
    e.preventDefault();
    setMgeConfig(prev => ({ ...prev, loading: true }));

    try {
      const response = await adminAPI.setMGEConfig(mgeConfig.tipo_tropa);
      if (response.success) {
        showAlert('Configuración MGE guardada exitosamente', 'success');
      } else {
        showAlert(response.message || 'Error al guardar configuración', 'error');
      }
    } catch (error) {
      console.error('Error setting MGE config:', error);
      showAlert('Error al configurar MGE: ' + error.message, 'error');
    } finally {
      setMgeConfig(prev => ({ ...prev, loading: false }));
    }
  };

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowModal(true);
  };

  const getTipoTropaIcon = (tipo) => {
    const iconos = {
      'arqueria': '🏹',
      'infanteria': '🛡️',
      'caballeria': '🐎',
      'liderazgo': '👑',
      'ingenieros': '🔧'
    };
    return iconos[tipo] || '⚔️';
  };

  const renderMGEConfig = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🏆 Configurar Evento MGE
      </h2>
      
      <form onSubmit={handleMGEConfig} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tipo de Tropa para el Evento
          </label>
          <select
            value={mgeConfig.tipo_tropa}
            onChange={(e) => setMgeConfig(prev => ({ ...prev, tipo_tropa: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="arqueria">🏹 Arquería</option>
            <option value="infanteria">🛡️ Infantería</option>
            <option value="caballeria">🐎 Caballería</option>
            <option value="liderazgo">👑 Liderazgo</option>
            <option value="ingenieros">🔧 Ingenieros</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Esto determinará qué tipo de MGE se está ejecutando actualmente
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mgeConfig.loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {mgeConfig.loading && <ButtonSpinner />}
            <span>Configurar Evento MGE</span>
          </button>
        </div>
      </form>
    </div>
  );

  const renderMGEPostulaciones = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📋 Postulaciones MGE
        </h2>
        <button
          onClick={loadMGEPostulaciones}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i>Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : mgePostulaciones.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tipo</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Comandante Principal</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Comandante Pareja</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Equipamiento</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Inscripciones</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Comandantes</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cabezas</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {mgePostulaciones.map((postulacion, index) => (
                <tr key={index} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-gray-800">
                      {postulacion.nombre_usuario}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      <span className="mr-1">{getTipoTropaIcon(postulacion.tipo_tropa)}</span>
                      {postulacion.tipo_tropa_display}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-medium">{postulacion.comandante_principal}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-gray-600">
                      {postulacion.comandante_pareja || 'No especificado'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {postulacion.foto_equipamiento_url ? (
                      <img
                        src={`http://localhost:8000/uploads/${postulacion.foto_equipamiento_url}`}
                        alt="Equipamiento"
                        className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(`http://localhost:8000/uploads/${postulacion.foto_equipamiento_url}`)}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin foto</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {postulacion.foto_inscripciones_url ? (
                      <img
                        src={`http://localhost:8000/uploads/${postulacion.foto_inscripciones_url}`}
                        alt="Inscripciones"
                        className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(`http://localhost:8000/uploads/${postulacion.foto_inscripciones_url}`)}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin foto</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {postulacion.foto_comandantes_url ? (
                      <img
                        src={`http://localhost:8000/uploads/${postulacion.foto_comandantes_url}`}
                        alt="Comandantes"
                        className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(`http://localhost:8000/uploads/${postulacion.foto_comandantes_url}`)}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin foto</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {postulacion.foto_cabezas_url ? (
                      <img
                        src={`http://localhost:8000/uploads/${postulacion.foto_cabezas_url}`}
                        alt="Cabezas"
                        className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(`http://localhost:8000/uploads/${postulacion.foto_cabezas_url}`)}
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin foto</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-gray-600">
                      {new Date(postulacion.fecha_postulacion).toLocaleDateString('es-ES')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay postulaciones MGE
          </h3>
          <p className="text-gray-500">
            Los usuarios pueden postularse una vez que configures un evento MGE
          </p>
        </div>
      )}
    </div>
  );

  if (!user?.es_admin) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Acceso Denegado</h3>
              <p className="text-red-600">No tienes permisos para acceder al panel de administración</p>
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
              ⚙️ Panel de Administración
            </h1>
            <p className="text-gray-600">
              Gestiona configuraciones y supervisa las actividades del sistema
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('mge')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'mge'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  🏆 Configurar MGE
                </button>
                <button
                  onClick={() => setActiveTab('mge-postulaciones')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'mge-postulaciones'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Ver Postulaciones MGE
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'mge' && renderMGEConfig()}
              {activeTab === 'mge-postulaciones' && renderMGEPostulaciones()}
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

export default AdminPage;