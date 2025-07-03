import React from "react";
import { clientService } from "../../services/clientService"; // Import your specific client API functions
import { CRUDProvider } from "./useCRUD";

export const ClientsProvider = ({ children }) => {
  return <CRUDProvider services={clientService}>{children}</CRUDProvider>;
};
