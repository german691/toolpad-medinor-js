import { api, handleServiceError } from "../api";

/**
 * Llama al endpoint de login de la API.
 * @param credentials - Un objeto con email y password.
 * @returns La respuesta del servidor, que debería incluir el token y los datos del usuario.
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/admin/login", credentials);
    return response.data;
  } catch (error) {
    handleServiceError(error);
  }
};
