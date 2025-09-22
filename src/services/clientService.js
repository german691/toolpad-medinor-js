import { api, handleServiceError } from "../api";

export const analyzeClients = async (clientsDataObject) => {
  try {
    const response = await api.post("/clients/analyze", {
      clients: clientsDataObject,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const confirmClientMigration = async (migrationDataObject) => {
  try {
    const response = await api.post("/clients/make-migration", {
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
  search = "",
} = {}) => {
  try {
    const response = await api.post("/clients/get", {
      page,
      limit,
      filters,
      sort,
      search,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const getClientById = async (id) => {
  try {
    const response = await api.get(`/clients/get/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const createNewClient = async (clientData) => {
  try {
    const response = await api.post("/clients/add", clientData);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const updateClientById = async (id, clientData) => {
  try {
    const response = await api.put(`/clients/update/${id}`, clientData);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const bulkUpdateClients = async (clientData) => {
  try {
    const response = await api.put("/clients/update", clientData);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const restoreClientPassword = async (clientData) => {
  try {
    const response = await api.post("/clients/restore-password", {
      id: clientData,
    });
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const clientService = {
  getItems: getClients,
  getItemById: getClientById,
  createItem: createNewClient,
  editItem: updateClientById,
  updateItem: updateClientById,
};
