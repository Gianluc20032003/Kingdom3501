import axios from "axios";

// Configuración base de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
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
  getSettings: () => api.get("/movilizacion/settings.php"),

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

export const kvkAPI = {
  getUserData: () => api.get("/kvk/user-data.php"),

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

  saveHonor: (formData) => {
    return api.post("/kvk/save-honor.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // NUEVO: Métodos para Pre-KvK
  savePreKvk: (formData) => {
    return api.post("/kvk/save-prekvk.php", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getPreKvkData: () => api.get("/kvk/prekvk-data.php"),
  getSettings: () => api.get("/kvk/settings.php"),
  getPreKvkRanking: () => api.get("/kvk/prekvk-ranking.php"), 
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
  // KvK Admin Endpoints
  getKvkEtapas: () => api.get("/admin/kvk-etapas.php"),
  createKvKEtapa: (etapaData) => api.post("/admin/kvk-etapas.php", etapaData),
  updateKvKEtapa: (id, data) =>
    api.put("/admin/kvk-etapas.php", { id, ...data }),
  deleteKvKEtapa: (id) => api.delete("/admin/kvk-etapas.php", { data: { id } }),
  getKvkUserData: () => api.get("/admin/kvk-etapas.php?type=user_data"),
  getKvkRanking: () => api.get("/admin/kvk-etapas.php?type=ranking"),
  getKvkSettings: () => api.get("/admin/settings.php"),
  updateKvkSettings: (data) => api.post("/admin/settings.php", data),
  updateKvkUserInitial: (userId, formData) =>
    api.post(`/admin/kvk-user-initial.php?user_id=${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateKvkBattle: (userId, etapaId, formData) =>
    api.post(
      `/admin/kvk-battle.php?user_id=${userId}&etapa_id=${etapaId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  // MGE Admin Endpoints
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
  getAOOInscripciones: () => api.get("/aoo/inscripciones.php"),
  deleteAOOEvent: (eventId) =>
    api.post("/admin/aoo-config.php", { action: "delete", event_id: eventId }),
  getAOOStats: () => api.get("/admin/aoo-stats.php"),

  // Movilizacion
  getMovilizacionSettings: () => api.get("/admin/movilizacion/settings.php"),
  toggleMovilizacion: (activo) =>
    api.post("/admin/movilizacion/settings.php", { activo }),
  clearMovilizacionData: () => api.post("/admin/movilizacion/clear-data.php"),
  getMovilizacionStats: () => api.get("/admin/movilizacion/stats.php"),
  getMovilizacionRanking: () => api.get("/movilizacion/ranking.php"),
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

    // Configurar y enviar - ACTUALIZADA
    xhr.timeout = 30000;
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "/api";
    xhr.open("POST", `${apiBaseUrl}/${endpoint}`);

    const token = localStorage.getItem("token");
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.send(formData);
  });
};

export default api;
