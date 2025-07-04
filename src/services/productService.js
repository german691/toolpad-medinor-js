import { api, handleServiceError } from "../api";

export const analyzeProducts = async (productsDataObject) => {
  try {
    const response = await api.post("/products/analyze", {
      products: productsDataObject,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const confirmProductMigration = async (migrationDataObject) => {
  try {
    const response = await api.post("/products/make-migration", {
      data: migrationDataObject,
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const getProducts = async ({
  page = 1,
  limit = 25,
  filters = {},
  sort = {},
  search = "",
} = {}) => {
  try {
    const response = await api.post("/products/get", {
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

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/get/${id}`);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const createNewProduct = async (productData) => {
  try {
    const response = await api.post("/products/add", productData);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const updateProductById = async (id, productData) => {
  try {
    const response = await api.put(`/products/update/${id}`, productData);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const bulkUpdateProducts = async (productData) => {
  try {
    console.log("datos impresos desde services: ", productData);
    const response = await api.put("/products/update", productData);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
};

export const productService = {
  getItems: getProducts,
  getItemById: getProductById,
  createItem: createNewProduct,
  editItem: updateProductById,
  updateItem: updateProductById,
};
