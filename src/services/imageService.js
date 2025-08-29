import { api, handleServiceError } from "../api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.16.111:5000/api";

/**
 * Obtiene las imágenes existentes de un producto
 */
export const getProductImages = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/images`);
    return response.data.images.map((img) => ({
      ...img,
      url: `${API_BASE_URL}${img.url}`,
    }));
  } catch (error) {
    handleServiceError(error);
  }
};

/**
 * Sube las imágenes nuevas para un producto.
 */
export const uploadImages = async (productId, newImages) => {
  const formData = new FormData();

  const mainImage = newImages.find((img) => img.role === "principal");
  const secondaryImages = newImages.filter((img) => img.role === "secundaria");

  if (mainImage && mainImage.blob) {
    formData.append("mainImage", mainImage.blob, mainImage.file.name);
  }

  secondaryImages.forEach((img) => {
    if (img.blob) {
      formData.append("secondaryImages", img.blob, img.file.name);
    }
  });

  try {
    const response = await api.post(`/products/${productId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

/**
 * Elimina todas las imágenes de un producto (sin cambios)
 */
export const clearProductImages = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}/images`);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

/**
 * Elimina una imagen específica de un producto (sin cambios)
 */
export const deleteProductImage = async (productId, imageId) => {
  try {
    const response = await api.delete(
      `/products/${productId}/images/${imageId}`
    );
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};

/**
 * Sube imágenes en lote, asociándolas por el nombre del archivo (código de producto).
 */
export const uploadImagesByCode = async (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("product_images", file);
  });

  try {
    const response = await api.post("/products/upload-by-code", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};
