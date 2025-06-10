import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { adminAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ImageModal from '../../components/ui/ImageModal';
import { formatNumber, formatDate } from '../../utils/helpers';

const KvkAdminPage = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [etapas, setEtapas] = useState([]);
  const [userData, setUserData] = useState([]);
  const [formData, setFormData] = useState({
    nombre_etapa: '',
    orden_etapa: '',
  });
  const [editingEtapa, setEditingEtapa] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedEtapa, setSelectedEtapa] = useState(null); // Track selected stage

  useEffect(() => {
    if (!user?.es_admin) {
      showAlert('Acceso denegado: Solo administradores', 'error');
      return;
    }
    loadData();
  }, [user, showAlert]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [etapasResponse, userDataResponse] = await Promise.all([
        adminAPI.getKvkEtapas(),
        adminAPI.getKvkUserData(),
      ]);

      if (etapasResponse.success) {
        setEtapas(etapasResponse.data.etapas);
      } else {
        showAlert(etapasResponse.message || 'Error al cargar etapas', 'error');
      }

      if (userDataResponse.success) {
        setUserData(userDataResponse.data.users);
      } else {
        showAlert(userDataResponse.message || 'Error al cargar datos de usuarios', 'error');
      }
    } catch (error) {
      showAlert('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_etapa || !formData.orden_etapa || formData.orden_etapa <= 0) {
      showAlert('Nombre y orden de etapa son requeridos y el orden debe ser mayor a 0', 'error');
      return;
    }

    try {
      setLoading(true);
      if (editingEtapa) {
        const response = await adminAPI.updateKvKEtapa(editingEtapa.id, {
          nombre_etapa: formData.nombre_etapa,
          orden_etapa: parseInt(formData.orden_etapa),
          activa: editingEtapa.activa,
        });
        if (response.success) {
          showAlert('Etapa actualizada exitosamente', 'success');
        } else {
          showAlert(response.message || 'Error al actualizar etapa', 'error');
        }
      } else {
        const response = await adminAPI.createKvKEtapa({
          nombre_etapa: formData.nombre_etapa,
          orden_etapa: parseInt(formData.orden_etapa),
        });
        if (response.success) {
          showAlert('Etapa creada exitosamente', 'success');
        } else {
          showAlert(response.message || 'Error al crear etapa', 'error');
        }
      }
      setFormData({ nombre_etapa: '', orden_etapa: '' });
      setEditingEtapa(null);
      await loadData();
    } catch (error) {
      showAlert('Error al guardar etapa: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (etapa) => {
    setEditingEtapa(etapa);
    setFormData({
      nombre_etapa: etapa.nombre_etapa,
      orden_etapa: etapa.orden_etapa,
    });
  };

  const handleToggleActive = async (etapa) => {
    try {
      setLoading(true);
      const response = await adminAPI.updateKvKEtapa(etapa.id, {
        nombre_etapa: etapa.nombre_etapa,
        orden_etapa: etapa.orden_etapa,
        activa: !etapa.activa,
      });
      if (response.success) {
        showAlert(`Etapa ${etapa.activa ? 'desactivada' : 'activada'} exitosamente`, 'success');
        await loadData();
      } else {
        showAlert(response.message || 'Error al actualizar estado', 'error');
      }
    } catch (error) {
      showAlert('Error al actualizar estado: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (etapaId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta etapa?')) return;
    try {
      setLoading(true);
      const response = await adminAPI.deleteKvKEtapa(etapaId);
      if (response.success) {
        showAlert('Etapa eliminada exitosamente', 'success');
        await loadData();
      } else {
        showAlert(response.message || 'Error al eliminar etapa', 'error');
      }
    } catch (error) {
      showAlert('Error al eliminar etapa: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  const handleViewUsers = (etapa) => {
    setSelectedEtapa(etapa);
    setCurrentPage(1); // Reset to first page
  };

  const clearSelectedEtapa = () => {
    setSelectedEtapa(null);
    setCurrentPage(1); // Reset to first page
  };

  // Filter user data based on selected stage
  const filteredUserData = selectedEtapa
    ? userData.map((user) => ({
        ...user,
        batallas: user.batallas.filter((batalla) => batalla.etapa_id === selectedEtapa.id),
        initial: null, // Hide initial data when filtering by stage
      })).filter((user) => user.batallas.length > 0) // Only show users with data for this stage
    : userData;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUserData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUserData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ⚙️ Administración de Etapas KvK
            </h1>
            <p className="text-gray-600">
              Configura las etapas y revisa los datos de usuarios para el evento Kingdom vs Kingdom
            </p>
          </div>

          {/* Form to Create/Update Stage */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingEtapa ? 'Editar Etapa' : 'Crear Nueva Etapa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre de la Etapa
                  </label>
                  <input
                    type="text"
                    name="nombre_etapa"
                    value={formData.nombre_etapa}
                    onChange={handleInputChange}
                    placeholder="Ej: Etapa Paso nivel 5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Orden de la Etapa
                  </label>
                  <input
                    type="number"
                    name="orden_etapa"
                    value={formData.orden_etapa}
                    onChange={handleInputChange}
                    placeholder="Ej: 1"
                    min="1"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                {editingEtapa && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEtapa(null);
                      setFormData({ nombre_etapa: '', orden_etapa: '' });
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {editingEtapa ? 'Actualizar Etapa' : 'Crear Etapa'}
                </button>
              </div>
            </form>
          </div>

          {!selectedEtapa ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Lista de Etapas</h2>
              {etapas.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⚙️</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No hay etapas configuradas
                  </h3>
                  <p className="text-gray-500">
                    Crea una nueva etapa usando el formulario de arriba
                  </p>
                </div>
              ) : (
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left text-gray-700 font-semibold">Nombre</th>
                      <th className="p-3 text-left text-gray-700 font-semibold">Orden</th>
                      <th className="p-3 text-left text-gray-700 font-semibold">Estado</th>
                      <th className="p-3 text-left text-gray-700 font-semibold">Fecha Creación</th>
                      <th className="p-3 text-left text-gray-700 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {etapas.map((etapa) => (
                      <tr key={etapa.id} className="border-t border-gray-200">
                        <td className="p-3">{etapa.nombre_etapa}</td>
                        <td className="p-3">{etapa.orden_etapa}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              etapa.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {etapa.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="p-3">{formatDate(etapa.fecha_creacion)}</td>
                        <td className="p-3 flex space-x-2">
                          <button
                            onClick={() => handleEdit(etapa)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            title="Editar"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(etapa)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title={etapa.activa ? 'Desactivar' : 'Activar'}
                          >
                            {etapa.activa ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(etapa.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            title="Eliminar"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => handleViewUsers(etapa)}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            title="Ver Usuarios"
                          >
                            Ver Usuarios
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Datos de Usuarios para {selectedEtapa.nombre_etapa}
                </h2>
                <button
                  onClick={clearSelectedEtapa}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Volver
                </button>
              </div>
              {filteredUserData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No hay datos de usuarios para esta etapa
                  </h3>
                  <p className="text-gray-500">
                    Los usuarios deben registrar sus datos en el módulo KvK
                  </p>
                </div>
              ) : (
                <>
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-gray-700 font-semibold">Usuario</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Etapa</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Kill Points</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Kills T4</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Kills T5</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Muertes T4</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Muertes T5</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Fotos</th>
                        <th className="p-3 text-left text-gray-700 font-semibold">Fecha Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user) =>
                        user.batallas.map((batalla) => (
                          <tr key={`${user.id}-${batalla.etapa_id}`} className="border-t border-gray-200">
                            <td className="p-3">{user.nombre_usuario}</td>
                            <td className="p-3">{batalla.nombre_etapa}</td>
                            <td className="p-3">{formatNumber(batalla.kill_points)}</td>
                            <td className="p-3">{formatNumber(batalla.kill_t4)}</td>
                            <td className="p-3">{formatNumber(batalla.kill_t5)}</td>
                            <td className="p-3">{formatNumber(batalla.muertes_propias_t4)}</td>
                            <td className="p-3">{formatNumber(batalla.muertes_propias_t5)}</td>
                            <td className="p-3 flex space-x-2">
                              {batalla.foto_batalla_url && (
                                <img
                                  src={`http://localhost:8000/uploads/${batalla.foto_batalla_url}`}
                                  alt="Batalla"
                                  className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => openImageModal(`http://localhost:8000/uploads/${batalla.foto_batalla_url}`)}
                                />
                              )}
                              {batalla.foto_muertes_url && (
                                <img
                                  src={`http://localhost:8000/uploads/${batalla.foto_muertes_url}`}
                                  alt="Muertes"
                                  className="w-8 h-8 object-cover rounded cursor-pointer hover:opacity-80"
                                  onClick={() => openImageModal(`http://localhost:8000/uploads/${batalla.foto_muertes_url}`)}
                                />
                              )}
                            </td>
                            <td className="p-3">{formatDate(batalla.fecha_registro)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {/* Pagination */}
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-gray-600">
                      Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredUserData.length)} de {filteredUserData.length} usuarios
                    </p>
                    <div className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`px-3 py-1 rounded-lg ${
                            currentPage === page
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageSrc={modalImage}
      />
    </div>
  );
};

export default KvkAdminPage;