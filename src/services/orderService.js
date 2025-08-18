import { api, handleServiceError } from "../api";

export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const getOrders = async (params = {}) => {
  try {
    const response = await api.get("/orders", { params });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};
