import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ver cómo manejar esto desde el back en un futuro
// cuando se implemente el wrapper de autenticación para toolpad
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const handleServiceError = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      throw {
        status: error.response.status,
        message: error.response.data.message || "Error en la solicitud",
        data: error.response.data,
      };
    } else if (error.request) {
      throw {
        status: null,
        message: "No se recibió respuesta del servidor",
        data: null,
      };
    } else {
      throw {
        status: null,
        message: "Error en la configuración de la solicitud",
        data: null,
      };
    }
  }
  throw {
    status: null,
    message: "Ocurrió un error inesperado",
    data: null,
  };
};
