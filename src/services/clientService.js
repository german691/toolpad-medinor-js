import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ver cómo manejar esto desde el back en un futuro
// cuando se implemente el wrapper de autenticación para toolpad
apiClient.interceptors.request.use(
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

const handleServiceError = (error) => {
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

export const analyzeClients = async (clientsDataObject) => {
  try {
    const response = await apiClient.post("/clients/analyze", {
      clients: clientsDataObject,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const confirmClientMigration = async (migrationDataObject) => {
  try {
    const response = await apiClient.post("/clients/make-migration", {
      data: migrationDataObject,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const getClients = async ({
  page = 1,
  limit = 25,
  filters = {},
  sort = {},
} = {}) => {
  try {
    const response = await apiClient.post("/clients/get", {
      page,
      limit,
      filters,
      sort,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const getClientById = async (id) => {
  try {
    const response = await apiClient.get(`/clients/get/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const createNewClient = async (clientData) => {
  try {
    const response = await apiClient.post("/clients/add", clientData);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const updateClientById = async (id, clientData) => {
  try {
    const response = await apiClient.put(`/clients/get/${id}`, clientData);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};
