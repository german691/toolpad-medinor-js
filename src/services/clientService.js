import { apiClient, handleServiceError } from "../api";

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
