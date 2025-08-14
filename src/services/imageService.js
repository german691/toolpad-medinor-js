import { api, handleServiceError } from "../api";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Convierte una URL de datos (base64) a un objeto File
 */
const dataURLtoFile = (dataUrl, filename) => {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const array = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new File([array], filename, { type: mime });
};
/**
 * Obtiene las imágenes existentes de un producto
 */
export const getProductImages = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/images`);
    const images = response.data.images;

    return images.map((img) => ({
      ...img,
      url: `${API_BASE_URL}${img.url}`,
    }));
  } catch (error) {
    handleServiceError(error);
  }
};

/**
 * Sube las imágenes nuevas para un producto
 */
export const uploadImages = async (productId, newImages) => {
  const formData = new FormData();

  const mainImage = newImages.find((img) => img.role === "principal");
  const secondaryImages = newImages.filter((img) => img.role === "secundaria");

  if (mainImage) {
    const file = dataURLtoFile(mainImage.croppedSrc, mainImage.file.name);
    formData.append("mainImage", file);
  }

  secondaryImages.forEach((img) => {
    const file = dataURLtoFile(img.croppedSrc, img.file.name);
    formData.append("secondaryImages", file);
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
 * Elimina todas las imágenes de un producto
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
 * Elimina una imagen específica (principal o secundaria) de un producto.
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

// /**
//  * Elimina la imagen principal de un producto.
//  */
// export const deleteMainImage = async (productId) => {
//   try {
//     const response = await api.delete(`/products/${productId}/main-image`);
//     return response.data;
//   } catch (error) {
//     handleServiceError(error);
//   }
// };
