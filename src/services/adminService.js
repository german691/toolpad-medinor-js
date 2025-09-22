import { api, handleServiceError } from "../api";

export const getAdmins = async ({
  page = 1,
  limit = 25,
  filters = {},
  sort = {},
  search = "",
} = {}) => {
  try {
    const response = await api.get("/admin", {
      params: {
        page,
        limit,
        search,
        ...filters,
        ...sort,
      },
    });
    const d = response.data;
    return {
      items: d.items ?? [],
      page: Number(d.page) || 1,
      totalItems: Number(d.totalItems) || 0,
      totalPages: Number(d.totalPages) || 1,
    };
  } catch (error) {
    handleServiceError(error);
  }
};

export const getAdminById = async (id) => {
  try {
    const response = await api.get(`/admin/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const createNewAdmin = async (data) => {
  try {
    const response = await api.post("/admin", data);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const updateAdminById = async (id, data) => {
  try {
    const response = await api.put(`/admin/${id}`, data);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const restoreAdminPassword = async (data) => {
  try {
    const response = await api.post("/admin/restore-password", {
      id: data,
    });
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const bulkUpdateAdmins = async (admins) => {
  try {
    const response = await api.put("/admin/bulk", admins);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const adminService = {
  getItems: getAdmins,
  getItemById: getAdminById,
  createItem: createNewAdmin,
  editItem: updateAdminById,
  updateItem: updateAdminById,
};
