// components/admin/KvkEtapasTab.jsx
import React, { useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { adminAPI } from "../../services/api";
import { formatDate } from "../../utils/helpers";

const KvkEtapasTab = ({ etapas, onEtapasChange }) => {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [editingEtapa, setEditingEtapa] = useState(null);
  const [formData, setFormData] = useState({
    nombre_etapa: "",
    orden_etapa: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.nombre_etapa ||
      !formData.orden_etapa ||
      formData.orden_etapa <= 0
    ) {
      showAlert(
        "Nombre y orden de etapa son requeridos y el orden debe ser mayor a 0",
        "error"
      );
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
          showAlert("Etapa actualizada exitosamente", "success");
        } else {
          showAlert(response.message || "Error al actualizar etapa", "error");
        }
      } else {
        const response = await adminAPI.createKvKEtapa({
          nombre_etapa: formData.nombre_etapa,
          orden_etapa: parseInt(formData.orden_etapa),
        });
        if (response.success) {
          showAlert("Etapa creada exitosamente", "success");
        } else {
          showAlert(response.message || "Error al crear etapa", "error");
        }
      }
      setFormData({ nombre_etapa: "", orden_etapa: "" });
      setEditingEtapa(null);
      await onEtapasChange();
    } catch (error) {
      showAlert("Error al guardar etapa: " + error.message, "error");
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
        showAlert(
          `Etapa ${etapa.activa ? "desactivada" : "activada"} exitosamente`,
          "success"
        );
        await onEtapasChange();
      } else {
        showAlert(response.message || "Error al actualizar estado", "error");
      }
    } catch (error) {
      showAlert("Error al actualizar estado: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (etapaId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta etapa?")) return;
    try {
      setLoading(true);
      const response = await adminAPI.deleteKvKEtapa(etapaId);
      if (response.success) {
        showAlert("Etapa eliminada exitosamente", "success");
        await onEtapasChange();
      } else {
        showAlert(response.message || "Error al eliminar etapa", "error");
      }
    } catch (error) {
      showAlert("Error al eliminar etapa: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form to Create/Update Stage */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingEtapa ? "Editar Etapa" : "Crear Nueva Etapa"}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  setFormData({
                    nombre_etapa: "",
                    orden_etapa: "",
                  });
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {editingEtapa ? "Actualizar Etapa" : "Crear Etapa"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Etapas */}
      <div>
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
          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    Nombre
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    Orden
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    Estado
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    Fecha Creación
                  </th>
                  <th className="p-3 text-left text-gray-700 font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {etapas.map((etapa) => (
                  <tr
                    key={etapa.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 font-semibold">{etapa.nombre_etapa}</td>
                    <td className="p-3">{etapa.orden_etapa}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          etapa.activa
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {etapa.activa ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="p-3">{formatDate(etapa.fecha_creacion)}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(etapa)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleActive(etapa)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          title={etapa.activa ? "Desactivar" : "Activar"}
                        >
                          {etapa.activa ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          onClick={() => handleDelete(etapa.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          title="Eliminar"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas de Etapas */}
      {etapas.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Estadísticas de Etapas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total de Etapas</p>
              <p className="text-2xl font-bold text-blue-600">{etapas.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Etapas Activas</p>
              <p className="text-2xl font-bold text-green-600">
                {etapas.filter((e) => e.activa).length}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">Etapas Inactivas</p>
              <p className="text-2xl font-bold text-red-600">
                {etapas.filter((e) => !e.activa).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KvkEtapasTab;