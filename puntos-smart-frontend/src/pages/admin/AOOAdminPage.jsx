import React, { useState, useEffect } from 'react';
import { useAlert } from '../../contexts/AlertContext';
import { adminAPI } from '../../services/api';
import { formatDate, formatNumber } from '../../utils/helpers';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { ButtonSpinner } from '../../components/ui/LoadingSpinner';

const AOOAdminPage = () => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [eventoActivo, setEventoActivo] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nuevoHorario, setNuevoHorario] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [eventosResponse, statsResponse] = await Promise.all([
        adminAPI.getAOOEvents(),
        adminAPI.getAOOStats()
      ]);

      setEventos(eventosResponse.data.eventos || []);
      setEstadisticas(statsResponse.data.estadisticas);
      setEventoActivo(statsResponse.data.evento_activo);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      showAlert('Error al cargar datos de administración: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!nuevoHorario.trim()) {
      showAlert('El horario es requerido', 'error');
      return;
    }

    try {
      setSaving(true);
      
      const response = await adminAPI.createAOOEvent(nuevoHorario.trim());
      
      if (response.success) {
        showAlert('Evento AOO creado exitosamente', 'success');
        setNuevoHorario('');
        setShowCreateForm(false);
        await loadAdminData();
      } else {
        showAlert(response.message || 'Error al crear evento', 'error');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showAlert('Error al crear evento: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEvent = async (eventId, activo) => {
    try {
      const response = await adminAPI.toggleAOOEvent(eventId, activo);
      
      if (response.success) {
        showAlert(response.message, 'success');
        await loadAdminData();
      } else {
        showAlert(response.message || 'Error al cambiar estado', 'error');
      }
    } catch (error) {
      console.error('Error toggling event:', error);
      showAlert('Error al cambiar estado: ' + error.message, 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('¿Estás seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await adminAPI.deleteAOOEvent(eventId);
      
      if (response.success) {
        showAlert('Evento eliminado exitosamente', 'success');
        await loadAdminData();
      } else {
        showAlert(response.message || 'Error al eliminar evento', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showAlert('Error al eliminar evento: ' + error.message, 'error');
    }
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
                  ⚙️ Administración AOO
                </h1>
                <p className="text-gray-600">
                  Gestiona eventos Ark of Osiris y revisa estadísticas
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Nuevo Evento AOO
              </button>
            </div>
          </div>

          {/* Crear nuevo evento */}
          {showCreateForm && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Crear Nuevo Evento AOO
              </h2>
              
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Horario del Evento
                  </label>
                  <input
                    type="text"
                    value={nuevoHorario}
                    onChange={(e) => setNuevoHorario(e.target.value)}
                    className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Domingo 20:00 UTC"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Especifica día y hora del evento AOO
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {saving && <ButtonSpinner />}
                    <span>Crear Evento</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Estadísticas del evento activo */}
          {estadisticas && eventoActivo && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📊 Estadísticas - {eventoActivo.horario}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{estadisticas.total_inscritos}</div>
                  <div className="text-sm text-blue-800">Total Inscritos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{estadisticas.lideres_rally}</div>
                  <div className="text-sm text-green-800">Líderes Rally</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{estadisticas.lideres_guarnicion}</div>
                  <div className="text-sm text-purple-800">Líderes Guarnición</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">{formatNumber(estadisticas.total_tropas)}</div>
                  <div className="text-sm text-yellow-800">Total Tropas</div>
                </div>
              </div>

              {/* Top jugadores */}
              {estadisticas.top_jugadores && estadisticas.top_jugadores.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    🏆 Top Jugadores (por tropas)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Posición</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tropas</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rally</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Guarnición</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estadisticas.top_jugadores.map((jugador, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="text-2xl">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}°`}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold">{jugador.nombre_usuario}</td>
                            <td className="px-4 py-3 text-center font-medium">{formatNumber(jugador.cantidad_tropas)}</td>
                            <td className="px-4 py-3 text-center">
                              {jugador.puede_liderar_rally ? '✅' : '❌'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {jugador.puede_liderar_guarnicion ? '✅' : '❌'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lista de todos los eventos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              📅 Todos los Eventos AOO
            </h2>

            {eventos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horario</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Inscritos</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Fecha Creación</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.map((evento) => (
                      <tr key={evento.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold">{evento.horario}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {evento.activo ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ✅ Activo
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                              ⏸️ Inactivo
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">
                          {evento.total_inscritos}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {formatDate(evento.fecha_creacion)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleToggleEvent(evento.id, !evento.activo)}
                              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                evento.activo 
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                            >
                              {evento.activo ? 'Desactivar' : 'Activar'}
                            </button>
                            
                            {evento.total_inscritos === 0 && (
                              <button
                                onClick={() => handleDeleteEvent(evento.id)}
                                className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs font-semibold transition-colors"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No hay eventos AOO creados
                </h3>
                <p className="text-gray-500">
                  Crea el primer evento AOO para que los usuarios puedan inscribirse
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AOOAdminPage;