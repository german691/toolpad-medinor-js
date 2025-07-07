import { api, handleServiceError } from "../api";

export default async function getCategories() {
  try {
    const response = await api.get("/categories");
    return response;
  } catch (error) {
    handleServiceError(error);
  }
}
