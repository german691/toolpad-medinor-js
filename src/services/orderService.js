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

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

export const closeOrder = async (orderId) => {
  try {
    const response = await api.post("/orders/close", { orderId });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};
