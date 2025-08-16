import { api, handleServiceError } from "../api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Obtiene las imágenes existentes de un producto
 */
export const getProductImages = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/images`);
    // Añade la URL base a cada imagen para que se muestre correctamente
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
 * ⭐️ FUNCIÓN ACTUALIZADA ⭐️
 */
export const uploadImages = async (productId, newImages) => {
  const formData = new FormData();

  const mainImage = newImages.find((img) => img.role === "principal");
  const secondaryImages = newImages.filter((img) => img.role === "secundaria");

  // Ya no necesitamos la función dataURLtoFile.
  // Usamos directamente el blob que viene en el objeto de imagen.

  if (mainImage && mainImage.blob) {
    // El método append de FormData acepta un Blob directamente.
    // Formato: formData.append(nombreDelCampo, blob, nombreDelArchivo)
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
        // El navegador establece el "Content-Type" a "multipart/form-data"
        // automáticamente cuando usas FormData, por lo que no es estrictamente
        // necesario ponerlo, pero no está de más ser explícito.
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
