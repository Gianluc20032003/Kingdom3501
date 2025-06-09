import axios from "axios";

// Configuración base de axios
const api = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "✅ Authorization header agregado:",
        config.headers.Authorization
      ); // 👈 AGREGAR ESTA LÍNEA
    } else {
      console.log("❌ No hay token en localStorage"); // 👈 AGREGAR ESTA LÍNEA
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    // Extraer mensaje de error
    const message =
      error.response?.data?.message || error.message || "Error desconocido";
    return Promise.reject(new Error(message));
  }
);

// API de autenticación
export const authAPI = {
  login: (username, password) =>
    api.post("/auth/login.php", { username, password }),

  register: (userData) => api.post("/auth/register.php", userData),

  validateToken: () => api.get("/auth/validate.php"),
};

// API de módulos
export const modulesAPI = {
  getConfig: () => api.get("/modules/config.php"),

  updateConfig: (moduleKey, config) =>
    api.post("/modules/update-config.php", { module: moduleKey, config }),
};

// API de Fortalezas Bárbaras
export const fortalezasAPI = {
  getUserData: () => api.get("/fortalezas/user-data.php"),

  getRanking: () => api.get("/fortalezas/ranking.php"),

  save: (formData) => {
    // Para FormData, necesitamos cambiar el Content-Type
    return api.post("/fortalezas/save.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// API de Movilización
export const movilizacionAPI = {
  getUserData: () => api.get("/movilizacion/user-data.php"),

  getRanking: () => api.get("/movilizacion/ranking.php"),

  save: (formData) => {
    return api.post("/movilizacion/save.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// API de KvK
export const kvkAPI = {
  getUserData: () => api.get("/kvk/user-data.php"),

  getEtapas: () => api.get("/kvk/etapas.php"),

  saveInitial: (formData) => {
    return api.post("/kvk/save-initial.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  saveBattle: (formData) => {
    return api.post("/kvk/save-battle.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// API de MGE
export const mgeAPI = {
  getConfig: () => api.get("/mge/config.php"),

  getUserData: () => api.get("/mge/user-data.php"),

  save: (formData) => {
    return api.post("/mge/save.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getPostulaciones: () => api.get("/mge/postulaciones.php"),
};

// API de AOO
export const aooAPI = {
  getConfig: () => api.get("/aoo/config.php"),

  getUserData: () => api.get("/aoo/user-data.php"),

  save: (formData) => {
    return api.post("/aoo/save.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getInscripciones: () => api.get("/aoo/inscripciones.php"),
};

// API de Admin
export const adminAPI = {
  getUsuarios: () => api.get("/admin/usuarios.php"),

  updateUsuario: (userId, userData) =>
    api.post("/admin/update-usuario.php", { user_id: userId, ...userData }),

  deleteUsuario: (userId) =>
    api.post("/admin/delete-usuario.php", { user_id: userId }),

  getEstadisticas: () => api.get("/admin/estadisticas.php"),

  createKvKEtapa: (etapaData) =>
    api.post("/admin/create-kvk-etapa.php", etapaData),

  updateKvKEtapa: (etapaId, etapaData) =>
    api.post("/admin/update-kvk-etapa.php", {
      etapa_id: etapaId,
      ...etapaData,
    }),

  setMGEConfig: (tipoTropa) =>
    api.post("/admin/set-mge-config.php", { tipo_tropa: tipoTropa }),

  setAOOConfig: (horario) => api.post("/admin/set-aoo-config.php", { horario }),

  getAOOEvents: () => api.get("/admin/aoo-config.php"),

  createAOOEvent: (horario) =>
    api.post("/admin/aoo-config.php", { action: "create", horario }),

  toggleAOOEvent: (eventId, activo) =>
    api.post("/admin/aoo-config.php", {
      action: "toggle",
      event_id: eventId,
      activo,
    }),

  deleteAOOEvent: (eventId) =>
    api.post("/admin/aoo-config.php", { action: "delete", event_id: eventId }),

  getAOOStats: () => api.get("/admin/aoo-stats.php"),
};

// Función helper para subir archivos con progreso
export const uploadWithProgress = (endpoint, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Configurar progreso
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    // Configurar respuesta
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error("Respuesta inválida del servidor"));
        }
      } else {
        reject(new Error(`Error HTTP: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Error de red"));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Tiempo de espera agotado"));
    });

    // Configurar y enviar
    xhr.timeout = 30000;
    xhr.open("POST", `/api/${endpoint}`);

    const token = localStorage.getItem("token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.send(formData);
  });
};

export default api;
