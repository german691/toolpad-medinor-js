import { api, handleServiceError } from "../api";

export default async function getLabs() {
  try {
    const response = await api.get("/labs");
    // console.log("api labs", response.data.items);
    return response;
  } catch (error) {
    handleServiceError(error);
  }
}
