import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { aooAPI } from "../../services/api";
import { formatDate, validateFile, createFormData } from "../../utils/helpers";
import Header from "../../components/common/Header";
import Sidebar from "../../components/common/Sidebar";
import { ButtonSpinner } from "../../components/ui/LoadingSpinner";
import ImageModal from "../../components/ui/ImageModal";

const AOOPage = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [userData, setUserData] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [formData, setFormData] = useState({
    cantidad_tropas: "",
    puede_liderar_rally: false,
    puede_liderar_guarnicion: false,
    comandantes_disponibles: "",
    foto_comandantes: null,
  });

  useEffect(() => {
    loadModuleData();
  }, []);

  const loadModuleData = async () => {
    try {
      setLoading(true);

      // Cargar configuración y datos del usuario
      const [configResponse, userDataResponse] = await Promise.all([
        aooAPI.getConfig(),
        aooAPI.getUserData(),
      ]);

      setConfig(configResponse.data.config);
      setUserData(userDataResponse.data.inscripcion);

      // Llenar formulario si hay datos existentes
      if (userDataResponse.data.inscripcion) {
        const inscripcion = userDataResponse.data.inscripcion;
        setFormData((prev) => ({
          ...prev,
          cantidad_tropas: inscripcion.cantidad_tropas || "",
          puede_liderar_rally: Boolean(inscripcion.puede_liderar_rally),
          puede_liderar_guarnicion: Boolean(
            inscripcion.puede_liderar_guarnicion
          ),
          comandantes_disponibles: inscripcion.comandantes_disponibles || "",
        }));
      }

      // Si es admin, cargar inscripciones
      if (user?.es_admin) {
        try {
          const inscripcionesResponse = await aooAPI.getInscripciones();
          setInscripciones(inscripcionesResponse.data.inscripciones || []);
        } catch (error) {
          console.error("Error cargando inscripciones:", error);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showAlert("Error al cargar los datos: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "foto_comandantes" && files[0]) {
      const file = files[0];
      const errors = validateFile(file);

      if (errors.length > 0) {
        showAlert(errors.join(", "), "error");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!config) {
      showAlert("No hay configuración AOO activa", "error");
      return;
    }

    if (!formData.cantidad_tropas || formData.cantidad_tropas < 0) {
      showAlert("La cantidad de tropas debe ser un número válido", "error");
      return;
    }

    if (!formData.comandantes_disponibles.trim()) {
      showAlert("Debes especificar los comandantes disponibles", "error");
      return;
    }

    const isNewRecord = !userData;
    if (isNewRecord && !formData.foto_comandantes) {
      showAlert(
        "La foto de comandantes es requerida para el registro inicial",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      const submitData = createFormData(
        {
          ...formData,
          config_id: config.id,
        },
        ["foto_comandantes"]
      );

      const response = await aooAPI.save(submitData);

      if (response.success) {
        showAlert("Inscripción guardada exitosamente", "success");
        await loadModuleData();
      } else {
        showAlert(response.message || "Error al guardar inscripción", "error");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showAlert("Error al guardar la inscripción: " + error.message, "error");
    } finally {
      setSaving(false);
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                  👥 Inscripción AOO
                </h1>
                <p className="text-gray-600">
                  Regístrate para eventos Ark of Osiris (AOO)
                </p>
              </div>
              {config && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Horario del Evento
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {config.horario}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estado de configuración */}
          {!config ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 class="text-lg font-semibold text-yellow-800 mb-2">
                No hay eventos AOO programados
              </h3>
              <p class="text-yellow-700">
                El administrador debe configurar un evento AOO para poder
                inscribirse
              </p>
            </div>
          ) : (
            <>
              {/* Formulario de inscripción */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  ➕ {isUpdate ? "Actualizar" : "Registrar"} Inscripción AOO
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Cantidad de Tropas
                      </label>
                      <input
                        type="number"
                        name="cantidad_tropas"
                        value={formData.cantidad_tropas}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: 500000"
                        min="0"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Número total de tropas disponibles
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Foto de Comandantes
                      </label>
                      <input
                        type="file"
                        name="foto_comandantes"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required={!isUpdate}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Captura de pantalla de tus comandantes
                      </p>

                      {/* Preview de imagen actual */}
                      {userData?.foto_comandantes_url && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">
                            Imagen actual:
                          </p>
                          <img
                            src={`http://localhost:8000/uploads/${userData.foto_comandantes_url}`}
                            alt="Foto actual"
                            className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              openImageModal(
                                `http://localhost:8000/uploads/${userData.foto_comandantes_url}`
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Comandantes Disponibles
                    </label>
                    <textarea
                      name="comandantes_disponibles"
                      value={formData.comandantes_disponibles}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Richard I, Edward, Constantine..."
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Lista los comandantes que tienes disponibles para AOO
                    </p>
                  </div>

                  {/* Capacidades de liderazgo */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Capacidades de Liderazgo
                    </h3>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="puede_liderar_rally"
                        name="puede_liderar_rally"
                        checked={formData.puede_liderar_rally}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label
                        htmlFor="puede_liderar_rally"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Puedo liderar Rally
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="puede_liderar_guarnicion"
                        name="puede_liderar_guarnicion"
                        checked={formData.puede_liderar_guarnicion}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label
                        htmlFor="puede_liderar_guarnicion"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Puedo liderar Guarnición
                      </label>
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
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {saving && <ButtonSpinner />}
                      <span>
                        {isUpdate ? "Actualizar" : "Registrar"} Inscripción
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Lista de inscritos (solo para admin) */}
              {user?.es_admin && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    📋 Lista de Inscritos ({inscripciones.length})
                  </h2>

                  {inscripciones.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                              Usuario
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Tropas
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Rally
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Guarnición
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Comandantes
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Foto
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                              Fecha
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscripciones.map((inscripcion, index) => (
                            <tr
                              key={index}
                              className="border-t hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-4">
                                <div className="font-semibold text-gray-800">
                                  {inscripcion.nombre_usuario}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="font-medium">
                                  {new Intl.NumberFormat("es-ES").format(
                                    inscripcion.cantidad_tropas
                                  )}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {inscripcion.puede_liderar_rally ? (
                                  <span className="text-green-600">✅</span>
                                ) : (
                                  <span className="text-gray-400">❌</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                {inscripcion.puede_liderar_guarnicion ? (
                                  <span className="text-green-600">✅</span>
                                ) : (
                                  <span className="text-gray-400">❌</span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="max-w-xs truncate text-sm">
                                  {inscripcion.comandantes_disponibles}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {inscripcion.foto_comandantes_url ? (
                                  <img
                                    src={`http://localhost:8000/uploads/${inscripcion.foto_comandantes_url}`}
                                    alt="Comandantes"
                                    className="w-12 h-12 object-cover rounded mx-auto cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() =>
                                      openImageModal(
                                        `http://localhost:8000/uploads/${inscripcion.foto_comandantes_url}`
                                      )
                                    }
                                  />
                                ) : (
                                  <span className="text-gray-400 text-sm">
                                    Sin foto
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <span className="text-sm text-gray-600">
                                  {formatDate(inscripcion.fecha_inscripcion)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📝</div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No hay inscripciones todavía
                      </h3>
                      <p className="text-gray-500">
                        Los usuarios podrán inscribirse cuando haya un evento
                        AOO configurado
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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

export default AOOPage;
